//! Minimal libpcap writer for captured Ethernet frames.

/// Serializes timestamped Ethernet frames as a little-endian libpcap capture.
pub fn write_pcap<'a>(frames: impl IntoIterator<Item = (f64, &'a [u8])>) -> Vec<u8> {
    let mut bytes = Vec::with_capacity(24);
    bytes.extend_from_slice(&0xa1b2c3d4u32.to_le_bytes());
    bytes.extend_from_slice(&2u16.to_le_bytes());
    bytes.extend_from_slice(&4u16.to_le_bytes());
    bytes.extend_from_slice(&0i32.to_le_bytes());
    bytes.extend_from_slice(&0u32.to_le_bytes());
    bytes.extend_from_slice(&65_535u32.to_le_bytes());
    bytes.extend_from_slice(&1u32.to_le_bytes());

    for (timestamp, frame) in frames {
        let total_micros = (timestamp * 1_000_000.0).round() as u64;
        let seconds = (total_micros / 1_000_000) as u32;
        let micros = (total_micros % 1_000_000) as u32;
        let length = frame.len() as u32;

        bytes.extend_from_slice(&seconds.to_le_bytes());
        bytes.extend_from_slice(&micros.to_le_bytes());
        bytes.extend_from_slice(&length.to_le_bytes());
        bytes.extend_from_slice(&length.to_le_bytes());
        bytes.extend_from_slice(frame);
    }

    bytes
}

#[cfg(test)]
mod tests {
    use super::write_pcap;

    fn u16_at(bytes: &[u8], at: usize) -> u16 {
        u16::from_le_bytes(bytes[at..at + 2].try_into().unwrap())
    }

    fn u32_at(bytes: &[u8], at: usize) -> u32 {
        u32::from_le_bytes(bytes[at..at + 4].try_into().unwrap())
    }

    #[test]
    fn l27_pcap_reparse_returns_identical_timestamped_frames() {
        let frames = vec![
            (1.250_001, vec![0, 1, 2, 3, 4, 5]),
            (2.0, (0u8..=255).collect::<Vec<_>>()),
        ];
        let bytes = write_pcap(frames.iter().map(|(time, frame)| (*time, frame.as_slice())));
        assert_eq!(u32_at(&bytes, 0), 0xa1b2c3d4);
        assert_eq!(u16_at(&bytes, 4), 2);
        assert_eq!(u16_at(&bytes, 6), 4);
        assert_eq!(u32_at(&bytes, 16), 65_535);
        assert_eq!(u32_at(&bytes, 20), 1, "Ethernet link type");

        let mut at = 24;
        let mut parsed = Vec::new();
        while at < bytes.len() {
            let sec = u32_at(&bytes, at);
            let usec = u32_at(&bytes, at + 4);
            let captured = u32_at(&bytes, at + 8) as usize;
            let original = u32_at(&bytes, at + 12) as usize;
            assert_eq!(captured, original);
            at += 16;
            parsed.push((sec as f64 + usec as f64 / 1_000_000.0, bytes[at..at + captured].to_vec()));
            at += captured;
        }
        assert_eq!(parsed.len(), frames.len());
        for ((time, frame), (parsed_time, parsed_frame)) in frames.iter().zip(parsed.iter()) {
            assert!((time - parsed_time).abs() < 0.000_001);
            assert_eq!(frame, parsed_frame);
        }
    }

    #[test]
    fn empty_capture_is_a_valid_global_header_only() {
        let bytes = write_pcap(std::iter::empty::<(f64, &[u8])>());
        assert_eq!(bytes.len(), 24);
    }
}
