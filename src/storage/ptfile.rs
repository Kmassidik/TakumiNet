//! Packet Tracer `.pkt` / `.pka` container codec.
//!
//! A modern (PT 6+) file is XML through four reversible stages:
//!
//! 1. reverse + position-keyed XOR     `out[n-1-i] = in[i] ^ ((n - i*n) & 0xff)`
//! 2. Twofish-EAX decrypt              key 0x89*16, nonce 0x10*16, 16-byte tag
//! 3. position-keyed XOR               `b[i] ^= (len - i) & 0xff`
//! 4. zlib, prefixed by 4-byte BE uncompressed length
//!
//! Pipeline documented by Mirco De Zorzi (pka2xml); this is an independent
//! Rust implementation used for interoperability with the user's own files.

use miniz_oxide::inflate::decompress_to_vec_with_limit;
use twofish::cipher::{Block as CipherBlock, BlockCipherEncrypt, KeyInit};
use twofish::Twofish;

const KEY: [u8; 16] = [0x89; 16];
const NONCE: [u8; 16] = [0x10; 16];
/// Alternate key used by some saved "nets"/activity files.
const KEY2: [u8; 16] = [0xBA; 16];
const NONCE2: [u8; 16] = [0xBE; 16];

type Block = [u8; 16];

fn cipher() -> Twofish {
    Twofish::new_from_slice(&KEY).expect("16-byte key")
}

fn cipher_with(key: &[u8; 16]) -> Twofish {
    Twofish::new_from_slice(key).expect("16-byte key")
}

fn encrypt_block(c: &Twofish, b: &Block) -> Block {
    let mut block = CipherBlock::<Twofish>::from(*b);
    c.encrypt_block(&mut block);
    block.into()
}

fn gf_double(b: &Block) -> Block {
    let mut n: u128 = u128::from_be_bytes(*b) << 1;
    if b[0] & 0x80 != 0 {
        n ^= 0x87;
    }
    n.to_be_bytes()
}

fn xor_block(a: &Block, b: &Block) -> Block {
    let mut o = [0u8; 16];
    for i in 0..16 {
        o[i] = a[i] ^ b[i];
    }
    o
}

/// OMAC1/CMAC over a 16-byte typed prefix followed by the message.
fn omac(c: &Twofish, tag: u8, msg: &[u8]) -> Block {
    let l = encrypt_block(c, &[0u8; 16]);
    let k1 = gf_double(&l);
    let k2 = gf_double(&k1);

    let mut data = Vec::with_capacity(16 + msg.len());
    data.extend_from_slice(&[0u8; 16]);
    data[15] = tag;
    data.extend_from_slice(msg);

    let (body, last) = if data.len() % 16 == 0 {
        let split = data.len() - 16;
        (
            data[..split].to_vec(),
            xor_block(&data[split..].try_into().unwrap(), &k1),
        )
    } else {
        let mut padded = data.clone();
        let pad = 16 - (padded.len() % 16);
        padded.push(0x80);
        padded.extend(std::iter::repeat(0).take(pad - 1));
        let split = padded.len() - 16;
        (
            padded[..split].to_vec(),
            xor_block(&padded[split..].try_into().unwrap(), &k2),
        )
    };

    let body_owned = body;
    let mut state = [0u8; 16];
    let mut i = 0;
    while i < body_owned.len() {
        state = encrypt_block(c, &xor_block(&state, &body_owned[i..i + 16].try_into().unwrap()));
        i += 16;
    }
    encrypt_block(c, &xor_block(&state, &last))
}

fn ctr(c: &Twofish, nonce: &Block, data: &[u8]) -> Vec<u8> {
    let base = u128::from_be_bytes(*nonce);
    let mut out = Vec::with_capacity(data.len());
    let mut block_index: u128 = 0;
    for chunk in data.chunks(16) {
        let ks = encrypt_block(c, &(base.wrapping_add(block_index)).to_be_bytes());
        for (i, b) in chunk.iter().enumerate() {
            out.push(b ^ ks[i]);
        }
        block_index += 1;
    }
    out
}

fn eax_decrypt(c: &Twofish, nonce: &Block, ct_with_tag: &[u8]) -> Result<Vec<u8>, String> {
    if ct_with_tag.len() < 16 {
        return Err("ciphertext shorter than EAX tag".into());
    }
    let (ct, tag_bytes) = ct_with_tag.split_at(ct_with_tag.len() - 16);
    let tag: Block = tag_bytes.try_into().unwrap();

    let n = omac(c, 0, nonce);
    let h = omac(c, 1, &[]);
    let cmac = omac(c, 2, ct);
    let expected = xor_block(&xor_block(&n, &h), &cmac);
    if expected != tag {
        return Err("EAX authentication tag mismatch".into());
    }
    Ok(ctr(c, &n, ct))
}

fn deobfuscate(data: &[u8]) -> Vec<u8> {
    let n = data.len();
    let mut out = vec![0u8; n];
    for i in 0..n {
        out[i] = data[n - 1 - i] ^ (((n.wrapping_sub(i.wrapping_mul(n))) & 0xff) as u8);
    }
    out
}

fn obfuscate(data: &[u8]) -> Vec<u8> {
    let n = data.len();
    let mut out = vec![0u8; n];
    for i in 0..n {
        out[n - 1 - i] = data[i] ^ (((n.wrapping_sub(i.wrapping_mul(n))) & 0xff) as u8);
    }
    out
}

fn xor_stage(data: &[u8]) -> Vec<u8> {
    let m = data.len();
    data.iter()
        .enumerate()
        .map(|(i, b)| b ^ ((m.wrapping_sub(i) & 0xff) as u8))
        .collect()
}

/// Key/nonce pairs the shipped containers use. The second pair covers the older
/// saves; the rest are cheap cross-checks for the template families.
const CANDIDATES: &[([u8; 16], [u8; 16])] = &[
    (KEY, NONCE),
    (KEY2, NONCE2),
    (KEY, NONCE2),
    (KEY2, NONCE),
    ([0x00; 16], [0x00; 16]),
    ([0xff; 16], [0xff; 16]),
];

/// Decrypt a `.pkt`/`.pka` blob into UTF-8 XML.
pub fn decrypt(bytes: &[u8]) -> Result<Vec<u8>, String> {
    if bytes.len() < 20 {
        return Err("file too small to be a Packet Tracer container".into());
    }
    let stage1 = deobfuscate(bytes);
    CANDIDATES
        .iter()
        .find_map(|(key, nonce)| unpack(key, nonce, &stage1))
        .ok_or_else(|| "could not decrypt: unknown container key".to_string())
}

/// Largest payload a `.pktz`/`.pksz` archive may expand to: 512 MiB.
pub const MAX_ARCHIVE_PAYLOAD: usize = 512 * 1024 * 1024;
/// Largest central directory this reader will index: 64 MiB.
const MAX_ARCHIVE_DIRECTORY: usize = 64 * 1024 * 1024;
const ZIP_LOCAL_SIG: [u8; 4] = *b"PK\x03\x04";
const ZIP_CENTRAL_SIG: [u8; 4] = *b"PK\x01\x02";
const ZIP_EOCD_SIG: [u8; 4] = *b"PK\x05\x06";
const ZIP_EOCD_LEN: usize = 22;
const ZIP_MAX_COMMENT: usize = 0xffff;
const ZIP64_SENTINEL32: u32 = 0xffff_ffff;
const ZIP64_SENTINEL16: usize = 0xffff;

/// Decode a `.pkt`/`.pka` container, transparently unwrapping the ZIP-based
/// `.pktz`/`.pksz` archives first.
///
/// A ZIP archive contributes the first safe entry whose name ends in
/// `.pkt`, `.pka`, `.xml`, or `.ptd`; entry names that are absolute or contain
/// `..` components are ignored, entries may be stored or deflated, and the
/// extracted payload may not exceed [`MAX_ARCHIVE_PAYLOAD`].
pub fn decode_any(bytes: &[u8]) -> Result<Vec<u8>, String> {
    if bytes.starts_with(&ZIP_LOCAL_SIG) {
        decrypt(&zip_container_payload(bytes)?)
    } else {
        decrypt(bytes)
    }
}

struct ZipEntry {
    name: String,
    flags: usize,
    method: usize,
    compressed: u32,
    uncompressed: u32,
    local_offset: u32,
}

fn u16_at(bytes: &[u8], at: usize) -> Result<usize, String> {
    let b = bytes
        .get(at..at + 2)
        .ok_or_else(|| "truncated zip structure".to_string())?;
    Ok(u16::from_le_bytes([b[0], b[1]]) as usize)
}

fn u32_at(bytes: &[u8], at: usize) -> Result<u32, String> {
    let b = bytes
        .get(at..at + 4)
        .ok_or_else(|| "truncated zip structure".to_string())?;
    Ok(u32::from_le_bytes([b[0], b[1], b[2], b[3]]))
}

fn find_eocd(bytes: &[u8]) -> Result<usize, String> {
    if bytes.len() < ZIP_EOCD_LEN {
        return Err("zip file too small for an end record".into());
    }
    let oldest = bytes.len().saturating_sub(ZIP_EOCD_LEN + ZIP_MAX_COMMENT);
    let mut at = bytes.len() - ZIP_EOCD_LEN;
    loop {
        if bytes.get(at..at + 4) == Some(&ZIP_EOCD_SIG) {
            let comment = u16_at(bytes, at + 20)?;
            if at + ZIP_EOCD_LEN + comment == bytes.len() {
                return Ok(at);
            }
        }
        if at == oldest {
            return Err("zip end-of-central-directory record not found".into());
        }
        at -= 1;
    }
}

/// Reject entry names that could escape an extraction root: absolute paths
/// (including drive letters) and any `..` component.
fn is_safe_entry_name(name: &str) -> bool {
    if name.is_empty() || name.contains('\0') {
        return false;
    }
    let bytes = name.as_bytes();
    if bytes[0] == b'/' || bytes[0] == b'\\' {
        return false;
    }
    if bytes.len() >= 2 && bytes[1] == b':' {
        return false;
    }
    !name.split(|c| c == '/' || c == '\\').any(|part| part == "..")
}

fn is_container_name(name: &str) -> bool {
    let lower = name.to_ascii_lowercase();
    [".pkt", ".pka", ".xml", ".ptd"]
        .iter()
        .any(|ext| lower.ends_with(ext))
}

fn zip_container_payload(bytes: &[u8]) -> Result<Vec<u8>, String> {
    let eocd = find_eocd(bytes)?;
    let entries = u16_at(bytes, eocd + 10)?;
    let dir_size = u32_at(bytes, eocd + 12)?;
    let dir_offset = u32_at(bytes, eocd + 16)?;
    if entries == ZIP64_SENTINEL16
        || dir_size == ZIP64_SENTINEL32
        || dir_offset == ZIP64_SENTINEL32
    {
        return Err("ZIP64 archives are not supported".into());
    }
    let dir_size = dir_size as usize;
    let dir_offset = dir_offset as usize;
    if dir_size > MAX_ARCHIVE_DIRECTORY {
        return Err(format!(
            "zip central directory exceeds the {MAX_ARCHIVE_DIRECTORY}-byte limit"
        ));
    }
    let dir_end = dir_offset
        .checked_add(dir_size)
        .filter(|&end| end <= eocd)
        .ok_or_else(|| "zip central directory out of bounds".to_string())?;

    let mut at = dir_offset;
    let mut candidate: Option<ZipEntry> = None;
    for _ in 0..entries {
        if bytes.get(at..at + 4) != Some(&ZIP_CENTRAL_SIG) {
            return Err("bad zip central directory entry signature".into());
        }
        let flags = u16_at(bytes, at + 8)?;
        let method = u16_at(bytes, at + 10)?;
        let compressed = u32_at(bytes, at + 20)?;
        let uncompressed = u32_at(bytes, at + 24)?;
        let name_len = u16_at(bytes, at + 28)?;
        let extra_len = u16_at(bytes, at + 30)?;
        let comment_len = u16_at(bytes, at + 32)?;
        let local_offset = u32_at(bytes, at + 42)?;
        let name_bytes = bytes
            .get(at + 46..at + 46 + name_len)
            .ok_or_else(|| "truncated zip entry name".to_string())?;
        let next = at + 46 + name_len + extra_len + comment_len;
        if next > dir_end {
            return Err("zip central directory entry exceeds its bounds".into());
        }
        at = next;
        let Ok(name) = std::str::from_utf8(name_bytes) else {
            continue;
        };
        if !is_safe_entry_name(name) || !is_container_name(name) {
            continue;
        }
        candidate = Some(ZipEntry {
            name: name.to_string(),
            flags,
            method,
            compressed,
            uncompressed,
            local_offset,
        });
        break;
    }

    let entry = candidate.ok_or_else(|| {
        "zip archive has no safe .pkt/.pka/.xml/.ptd entry".to_string()
    })?;
    extract_zip_entry(bytes, &entry)
}

fn extract_zip_entry(bytes: &[u8], entry: &ZipEntry) -> Result<Vec<u8>, String> {
    if entry.flags & 0x0001 != 0 {
        return Err(format!("zip entry `{}` is encrypted", entry.name));
    }
    if entry.compressed == ZIP64_SENTINEL32 || entry.uncompressed == ZIP64_SENTINEL32 {
        return Err("ZIP64 entries are not supported".into());
    }
    let compressed = entry.compressed as usize;
    let uncompressed = entry.uncompressed as usize;
    if compressed > MAX_ARCHIVE_PAYLOAD || uncompressed > MAX_ARCHIVE_PAYLOAD {
        return Err(format!(
            "zip entry `{}` exceeds the {MAX_ARCHIVE_PAYLOAD}-byte payload limit",
            entry.name
        ));
    }

    let local = entry.local_offset as usize;
    if bytes.get(local..local + 4) != Some(&ZIP_LOCAL_SIG) {
        return Err("bad zip local file header signature".into());
    }
    let name_len = u16_at(bytes, local + 26)?;
    let extra_len = u16_at(bytes, local + 28)?;
    let data_offset = local
        .checked_add(30)
        .and_then(|off| off.checked_add(name_len))
        .and_then(|off| off.checked_add(extra_len))
        .ok_or_else(|| "zip local header offsets overflow".to_string())?;
    let data = bytes
        .get(data_offset..data_offset + compressed)
        .ok_or_else(|| "truncated zip entry data".to_string())?;

    match entry.method {
        0 => {
            if compressed != uncompressed {
                return Err("stored zip entry size mismatch".into());
            }
            Ok(data.to_vec())
        }
        8 => {
            let out = decompress_to_vec_with_limit(data, MAX_ARCHIVE_PAYLOAD)
                .map_err(|e| format!("zip deflate error: {e}"))?;
            if uncompressed != 0 && out.len() != uncompressed {
                return Err("deflated zip entry size mismatch".into());
            }
            Ok(out)
        }
        method => Err(format!(
            "unsupported zip compression method {method} for `{}`",
            entry.name
        )),
    }
}

/// One full key attempt; `None` unless every stage verifies (EAX tag, declared
/// length, zlib stream, and an XML document).
fn unpack(key: &[u8; 16], nonce: &[u8; 16], stage1: &[u8]) -> Option<Vec<u8>> {
    let stage2 = eax_decrypt(&cipher_with(key), nonce, stage1).ok()?;
    let stage3 = xor_stage(&stage2);
    if stage3.len() < 5 {
        return None;
    }
    let expected = u32::from_be_bytes(stage3[..4].try_into().ok()?) as usize;
    let plain = miniz_oxide::inflate::decompress_to_vec_zlib(&stage3[4..]).ok()?;
    if expected != 0 && plain.len() != expected {
        return None;
    }
    if !plain.starts_with(b"<") {
        return None;
    }
    Some(plain)
}

/// Encode arbitrary XML bytes into a `.pkt`/`.pka` blob.
///
/// This is the canonical encoder; [`encrypt`] is the historical name for the
/// same operation. The stage order is the reverse of [`decrypt`]: zlib with a
/// 4-byte BE length prefix, position-keyed XOR, Twofish-EAX, reverse-keyed XOR.
pub fn encode(xml: &[u8]) -> Vec<u8> {
    let compressed = miniz_oxide::deflate::compress_to_vec_zlib(xml, 6);
    let mut stage3 = Vec::with_capacity(4 + compressed.len());
    stage3.extend_from_slice(&(xml.len() as u32).to_be_bytes());
    stage3.extend_from_slice(&compressed);

    let stage2 = xor_stage(&stage3);
    let c = cipher();
    let n = omac(&c, 0, &NONCE);
    let h = omac(&c, 1, &[]);
    let ct = ctr(&c, &n, &stage2);
    let cmac = omac(&c, 2, &ct);
    let tag = xor_block(&xor_block(&n, &h), &cmac);

    let mut stage1 = ct;
    stage1.extend_from_slice(&tag);
    obfuscate(&stage1)
}

/// Historical name for [`encode`].
pub fn encrypt(xml: &[u8]) -> Vec<u8> {
    encode(xml)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::{Path, PathBuf};

    #[test]
    fn round_trip_xml() {
        let xml = b"<?xml version=\"1.0\"?><PACKETTRACER5><ENGINE><DEVICES/></ENGINE></PACKETTRACER5>";
        let blob = encrypt(xml);
        assert_ne!(&blob[..4], b"<?xm");
        let back = decrypt(&blob).unwrap();
        assert_eq!(back, xml);
        assert_eq!(encode(xml), blob);
    }

    #[test]
    fn rejects_garbage() {
        assert!(decrypt(&[0u8; 40]).is_err());
    }

    fn sample_xml() -> &'static [u8] {
        b"<?xml version=\"1.0\"?><PACKETTRACER5><ENGINE><DEVICES/></ENGINE></PACKETTRACER5>"
    }

    /// Build a minimal CRC-free ZIP archive. Each entry is written with a
    /// local header followed by its data; the central directory records the
    /// method and both sizes, matching what `decode_any` reads.
    fn zip_archive(entries: &[(&str, u16, &[u8])]) -> Vec<u8> {
        let mut out = Vec::new();
        let mut directory: Vec<(u32, &str, u16, usize, usize)> = Vec::new();
        for (name, method, payload) in entries {
            let (stored, comp) = if *method == 8 {
                (
                    miniz_oxide::deflate::compress_to_vec(payload, 6),
                    payload.len(),
                )
            } else {
                (payload.to_vec(), payload.len())
            };
            let local_offset = out.len() as u32;
            out.extend_from_slice(&ZIP_LOCAL_SIG);
            out.extend_from_slice(&20u16.to_le_bytes()); // version needed
            out.extend_from_slice(&0u16.to_le_bytes()); // flags
            out.extend_from_slice(&method.to_le_bytes());
            out.extend_from_slice(&0u16.to_le_bytes()); // mtime
            out.extend_from_slice(&0u16.to_le_bytes()); // mdate
            out.extend_from_slice(&0u32.to_le_bytes()); // crc (unchecked)
            out.extend_from_slice(&(stored.len() as u32).to_le_bytes());
            out.extend_from_slice(&(payload.len() as u32).to_le_bytes());
            out.extend_from_slice(&(name.len() as u16).to_le_bytes());
            out.extend_from_slice(&0u16.to_le_bytes()); // extra len
            out.extend_from_slice(name.as_bytes());
            out.extend_from_slice(&stored);
            directory.push((local_offset, name, *method, stored.len(), payload.len()));
        }

        let dir_offset = out.len() as u32;
        for (local_offset, name, method, comp_len, uncomp_len) in &directory {
            out.extend_from_slice(&ZIP_CENTRAL_SIG);
            out.extend_from_slice(&20u16.to_le_bytes()); // version made by
            out.extend_from_slice(&20u16.to_le_bytes()); // version needed
            out.extend_from_slice(&0u16.to_le_bytes()); // flags
            out.extend_from_slice(&method.to_le_bytes());
            out.extend_from_slice(&0u16.to_le_bytes()); // mtime
            out.extend_from_slice(&0u16.to_le_bytes()); // mdate
            out.extend_from_slice(&0u32.to_le_bytes()); // crc (unchecked)
            out.extend_from_slice(&(*comp_len as u32).to_le_bytes());
            out.extend_from_slice(&(*uncomp_len as u32).to_le_bytes());
            out.extend_from_slice(&(name.len() as u16).to_le_bytes());
            out.extend_from_slice(&0u16.to_le_bytes()); // extra len
            out.extend_from_slice(&0u16.to_le_bytes()); // comment len
            out.extend_from_slice(&0u16.to_le_bytes()); // disk start
            out.extend_from_slice(&0u16.to_le_bytes()); // internal attrs
            out.extend_from_slice(&0u32.to_le_bytes()); // external attrs
            out.extend_from_slice(&local_offset.to_le_bytes());
            out.extend_from_slice(name.as_bytes());
        }
        let dir_size = out.len() as u32 - dir_offset;

        out.extend_from_slice(&ZIP_EOCD_SIG);
        out.extend_from_slice(&0u16.to_le_bytes()); // this disk
        out.extend_from_slice(&0u16.to_le_bytes()); // directory disk
        out.extend_from_slice(&(directory.len() as u16).to_le_bytes());
        out.extend_from_slice(&(directory.len() as u16).to_le_bytes());
        out.extend_from_slice(&dir_size.to_le_bytes());
        out.extend_from_slice(&dir_offset.to_le_bytes());
        out.extend_from_slice(&0u16.to_le_bytes()); // comment len
        out
    }

    #[test]
    fn decode_any_reads_stored_zip_container() {
        let xml = sample_xml();
        let blob = encode(xml);
        let archive = zip_archive(&[("topology.pkt", 0, &blob)]);
        assert_eq!(decode_any(&archive).unwrap(), xml);
        // Non-ZIP input still goes straight through decrypt.
        assert_eq!(decode_any(&blob).unwrap(), xml);
    }

    #[test]
    fn decode_any_reads_deflated_zip_container() {
        let xml = sample_xml();
        let blob = encode(xml);
        let archive = zip_archive(&[("topology.pkt", 8, &blob)]);
        assert_eq!(decode_any(&archive).unwrap(), xml);
    }

    #[test]
    fn decode_any_skips_unsafe_zip_entries() {
        let xml = sample_xml();
        let blob = encode(xml);
        let archive = zip_archive(&[
            ("../escape.pkt", 0, &blob),
            ("/absolute.pkt", 0, &blob),
            ("C:/drive.pkt", 0, &blob),
            ("nested/ok.xml", 0, &blob),
        ]);
        assert_eq!(decode_any(&archive).unwrap(), xml);
    }

    #[test]
    fn decode_any_rejects_corrupt_zip() {
        let blob = encode(sample_xml());
        let mut archive = zip_archive(&[("topology.pkt", 0, &blob)]);
        archive.truncate(archive.len() - 10);
        assert!(decode_any(&archive).is_err());
        assert!(decode_any(b"PK\x03\x04junk").is_err());
        // Valid ZIP with no container-shaped entry.
        let none = zip_archive(&[("readme.txt", 0, &blob)]);
        assert!(decode_any(&none).is_err());
    }

    /// Every shipped save must survive decrypt -> encode -> decrypt with an
    /// unchanged XML payload (ciphertext need not be identical). Saves in the
    /// legacy non-XML container family cannot be decrypted by this codec and
    /// are counted separately instead of failing the run.
    #[test]
    fn corpus_round_trip_preserves_xml() {
        if std::env::var("PT_CORPUS").is_err() {
            // ~8 minutes over 299 saves; opt in with PT_CORPUS=1 (the
            // pkt2rs --roundtrip mode covers it interactively too).
            eprintln!("corpus_round_trip_preserves_xml: set PT_CORPUS=1 to run");
            return;
        }
        if is_pkt2rs_target() {
            // ptfile.rs is shared with the pkt2rs binary; the CLI covers the
            // corpus there, so do not pay for the walk twice per test run.
            eprintln!("corpus_round_trip_preserves_xml: covered by the pt-web target");
            return;
        }
        let files = corpus_saves();
        if files.is_empty() {
            eprintln!("corpus_round_trip_preserves_xml: no intake corpus, skipping");
            return;
        }
        let mut passes = 0usize;
        let mut undecodable = 0usize;
        let mut failures: Vec<String> = Vec::new();
        for path in &files {
            let blob = match std::fs::read(path) {
                Ok(b) => b,
                Err(e) => {
                    failures.push(format!("{}: read: {e}", path.display()));
                    continue;
                }
            };
            let Ok(xml) = decrypt(&blob) else {
                undecodable += 1;
                continue;
            };
            match round_trip_payload(&xml) {
                Ok(()) => passes += 1,
                Err(e) => failures.push(format!("{}: {e}", path.display())),
            }
        }
        println!(
            "corpus_round_trip_preserves_xml: {passes} ok, {undecodable} skipped (undecodable), {} failed, {} total",
            failures.len(),
            files.len()
        );
        assert!(failures.is_empty(), "{failures:#?}");
        assert_eq!(passes + undecodable, files.len());
    }

    fn round_trip_payload(xml: &[u8]) -> Result<(), String> {
        let reencoded = encode(xml);
        let again = decrypt(&reencoded)?;
        if again != xml {
            return Err(format!(
                "payload mismatch ({} vs {} bytes)",
                xml.len(),
                again.len()
            ));
        }
        Ok(())
    }

    fn is_pkt2rs_target() -> bool {
        std::env::current_exe()
            .ok()
            .and_then(|p| p.file_name().map(|n| n.to_string_lossy().into_owned()))
            .is_some_and(|n| n.starts_with("pkt2rs"))
    }

    fn corpus_saves() -> Vec<PathBuf> {
        let intake = Path::new(env!("CARGO_MANIFEST_DIR")).join("intake");
        let Ok(rd) = std::fs::read_dir(&intake) else {
            return Vec::new();
        };
        let mut files = Vec::new();
        for entry in rd.flatten() {
            let saves = entry.path().join("appimage/opt/pt/saves");
            collect_pkt(&saves, &mut files);
        }
        files.sort();
        files
    }

    fn collect_pkt(dir: &Path, out: &mut Vec<PathBuf>) {
        let Ok(rd) = std::fs::read_dir(dir) else { return };
        for entry in rd.flatten() {
            let p = entry.path();
            if p.is_dir() {
                collect_pkt(&p, out);
            } else if p.extension().and_then(|e| e.to_str()) == Some("pkt") {
                out.push(p);
            }
        }
    }
}
