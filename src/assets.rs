//! Read-only access to the extracted Packet Tracer asset tree.
//!
//! The assets stay where they were unpacked (`intake/...`) and are never
//! copied into this repo or into the container image — the EULA does not allow
//! redistributing them. The server only ever reads.

use std::fs;
use std::io;
use std::path::{Component, Path, PathBuf};

#[derive(Clone, Debug)]
pub struct Assets {
    pub root: PathBuf,
}

#[derive(Clone, Debug)]
pub struct Entry {
    pub name: String,
    pub path: String,
    pub dir: bool,
    pub size: u64,
}

impl Assets {
    /// `ASSET_ROOT` first, then the newest `intake/<stamp>/{appimage,tree}/opt/pt`.
    pub fn discover() -> Option<Assets> {
        if let Ok(p) = std::env::var("ASSET_ROOT") {
            let pb = PathBuf::from(&p);
            if pb.is_dir() {
                return Some(Assets {
                    root: fs::canonicalize(pb).ok()?,
                });
            }
            eprintln!("ASSET_ROOT is not a directory: {p}");
        }

        let mut best: Option<(String, PathBuf)> = None;
        let Ok(rd) = fs::read_dir("intake") else {
            return None;
        };
        for entry in rd.flatten() {
            let stamp = entry.file_name().to_string_lossy().to_string();
            for leaf in ["appimage/opt/pt", "tree/opt/pt", "root/opt/pt"] {
                let cand = entry.path().join(leaf);
                if cand.is_dir() {
                    let better = match &best {
                        Some((n, _)) => stamp > *n,
                        None => true,
                    };
                    if better {
                        best = Some((stamp.clone(), fs::canonicalize(cand).ok()?));
                    }
                }
            }
        }
        best.map(|(_, root)| Assets { root })
    }

    /// Resolve a relative path, rejecting traversal and anything escaping root.
    pub fn resolve(&self, rel: &str) -> Option<PathBuf> {
        let rel = rel.trim_start_matches('/');
        let mut clean = PathBuf::new();
        for c in Path::new(rel).components() {
            match c {
                Component::Normal(x) => clean.push(x),
                Component::CurDir => {}
                _ => return None,
            }
        }
        let full = self.root.join(&clean);
        let canonical = fs::canonicalize(&full).ok()?;
        if canonical.starts_with(&self.root) {
            Some(canonical)
        } else {
            None
        }
    }

    pub fn list(&self, rel: &str) -> io::Result<Vec<Entry>> {
        let dir = self
            .resolve(rel)
            .ok_or_else(|| io::Error::new(io::ErrorKind::NotFound, "no such directory"))?;
        let base = rel.trim_matches('/');

        let mut out = Vec::new();
        for entry in fs::read_dir(dir)? {
            let entry = entry?;
            let meta = entry.metadata()?;
            let name = entry.file_name().to_string_lossy().to_string();
            let path = if base.is_empty() {
                name.clone()
            } else {
                format!("{base}/{name}")
            };
            out.push(Entry {
                name,
                path,
                dir: meta.is_dir(),
                size: meta.len(),
            });
        }
        out.sort_by(|a, b| {
            b.dir
                .cmp(&a.dir)
                .then_with(|| a.name.to_lowercase().cmp(&b.name.to_lowercase()))
        });
        Ok(out)
    }

    /// Total regular files and bytes, for the header. Walks once at startup.
    pub fn totals(&self) -> (usize, u64) {
        fn walk(dir: &Path, files: &mut usize, bytes: &mut u64, depth: u32) {
            if depth > 24 {
                return;
            }
            let Ok(rd) = fs::read_dir(dir) else { return };
            for entry in rd.flatten() {
                let Ok(meta) = entry.metadata() else { continue };
                if meta.is_dir() {
                    walk(&entry.path(), files, bytes, depth + 1);
                } else {
                    *files += 1;
                    *bytes += meta.len();
                }
            }
        }
        let (mut files, mut bytes) = (0usize, 0u64);
        walk(&self.root, &mut files, &mut bytes, 0);
        (files, bytes)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_traversal() {
        let dir = std::env::temp_dir().join("pt-assets-test");
        let _ = fs::create_dir_all(&dir);
        fs::write(dir.join("ok.txt"), b"hi").unwrap();
        let assets = Assets {
            root: fs::canonicalize(&dir).unwrap(),
        };
        assert!(assets.resolve("ok.txt").is_some());
        assert!(assets.resolve("../ok.txt").is_none());
        assert!(assets.resolve("/etc/passwd").is_none());
        assert!(assets.resolve("a/../../ok.txt").is_none());
    }

    #[test]
    fn listing_sorts_dirs_first() {
        let dir = std::env::temp_dir().join("pt-assets-test2");
        let _ = fs::create_dir_all(dir.join("sub"));
        fs::write(dir.join("b.txt"), b"x").unwrap();
        fs::write(dir.join("a.txt"), b"x").unwrap();
        let assets = Assets {
            root: fs::canonicalize(&dir).unwrap(),
        };
        let entries = assets.list("").unwrap();
        assert!(entries[0].dir);
        assert_eq!(entries[1].name, "a.txt");
        assert_eq!(entries[1].path, "a.txt");
    }
}
