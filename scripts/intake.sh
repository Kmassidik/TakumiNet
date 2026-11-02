#!/usr/bin/env bash
# intake.sh — unpack a Cisco Packet Tracer installer and inventory it for REA.
#
# Usage:
#   ./scripts/intake.sh <installer.run|.deb|.tar.gz|.zip> [outdir]
#   ./scripts/intake.sh <already-installed-dir>          [outdir]
#
# Produces, under intake/<timestamp>/:
#   tree.txt        file listing
#   digests.txt     sha256 of every regular file
#   elf-binaries.txt ELF files with type/arch
#   qt.txt          Qt libraries and plugin dirs
#   resources.txt   large non-code blobs (icons, models, templates)
#   strings-hit.txt interesting strings (protocol/CLI/format hints)
#   summary.txt     human-readable rollup
#
# Read-only with respect to the source. Never executes the installer payload.

set -euo pipefail

SRC="${1:?usage: intake.sh <installer|installed-dir> [outdir]}"
OUTBASE="${2:-intake}"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$OUTBASE/$STAMP"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

mkdir -p "$OUT"

say() { printf '%s\n' "$*" | tee -a "$OUT/summary.txt"; }

say "intake: $SRC"
say "output: $OUT"

# ---------------------------------------------------------------- unpack
# Extraction lands inside the output dir so reported paths stay valid after
# this script exits; $WORK is only scratch space for self-extracting archives.
UNPACKED="$OUT/root"
mkdir -p "$UNPACKED"

if [ -d "$SRC" ]; then
  say "mode: installed tree (copied)"
  cp -a "$SRC/." "$UNPACKED/" 2>/dev/null || true
else
  case "$SRC" in
    *.run)
      say "mode: self-extracting .run (noexec)"
      # --noexec: extract only, never run their scripts
      sh "$SRC" --noexec --target "$WORK/run" >/dev/null 2>&1 || {
        say "ERROR: --noexec failed; inspect manually"; exit 1; }
      cp -a "$WORK/run/." "$UNPACKED/" 2>/dev/null || true
      # nested tarball common in PT installers
      find "$UNPACKED" -maxdepth 2 -name '*.tar.gz' -print0 |
        while IFS= read -r -d '' t; do
          d="${t%.tar.gz}.d"; mkdir -p "$d"; tar -xzf "$t" -C "$d" 2>/dev/null || true
        done
      ;;
    *.deb)
      say "mode: .deb"
      if command -v dpkg-deb >/dev/null 2>&1; then
        dpkg-deb -x "$SRC" "$UNPACKED"
      else
        say "dpkg-deb absent; using ar + tar"
        ( cd "$WORK" && ar x "$SRC" )
        for m in "$WORK"/data.tar.*; do
          [ -e "$m" ] || continue
          case "$m" in
            *.xz)  tar -xJf "$m" -C "$UNPACKED" ;;
            *.gz)  tar -xzf "$m" -C "$UNPACKED" ;;
            *.zst) tar --zstd -xf "$m" -C "$UNPACKED" ;;
            *.bz2) tar -xjf "$m" -C "$UNPACKED" ;;
            *)     tar -xf  "$m" -C "$UNPACKED" ;;
          esac
        done
        mkdir -p "$OUT/control"
        for m in "$WORK"/control.tar.*; do
          [ -e "$m" ] && tar -xf "$m" -C "$OUT/control" 2>/dev/null
        done
      fi
      ;;
    *.tar.gz|*.tgz)
      say "mode: tarball"
      tar -xzf "$SRC" -C "$UNPACKED"
      ;;
    *.zip)
      say "mode: zip"
      unzip -q "$SRC" -d "$UNPACKED"
      ;;
    *)
      say "ERROR: unsupported input type: $SRC"; exit 1
      ;;
  esac
fi

# ---------------------------------------------------------------- inventory
find "$UNPACKED" -type f -printf '%s\t%p\n' 2>/dev/null |
  sort -k2 > "$OUT/tree.txt"

find "$UNPACKED" -type f -exec sha256sum {} + 2>/dev/null > "$OUT/digests.txt" || true

: > "$OUT/elf-binaries.txt"
while IFS= read -r -d '' f; do
  if [ "$(head -c 4 "$f" 2>/dev/null | od -An -tx1 | tr -d ' \n')" = "7f454c46" ]; then
    printf '%s\t%s\n' "$(file -b "$f")" "$f" >> "$OUT/elf-binaries.txt"
  fi
done < <(find "$UNPACKED" -type f -print0 2>/dev/null)

: > "$OUT/qt.txt"
find "$UNPACKED" \( -iname 'libQt6*' -o -iname 'libQt5*' -o -iname 'plugins' \
  -o -iname 'platforms' -o -iname '*.qml' -o -iname '*.rcc' \) 2>/dev/null \
  | sort >> "$OUT/qt.txt" || true
find "$UNPACKED" -type f -size +200k -printf '%s\t%p\n' 2>/dev/null |
  sort -rn | head -200 > "$OUT/resources.txt" || true

: > "$OUT/strings-hit.txt"
while IFS= read -r -d '' f; do
  strings -n 6 "$f" 2>/dev/null |
    grep -aiE '\.pkt|\.pka|packettracer|netacad|ios-|router|switch|cloud|eigrp|ospf|rip|stp|vlan|dhcp|dns|icmp|arp|aaa|snmp|telnet|ssh|xml|<device' \
    | sort -u | head -400 | sed "s|^|$(basename "$f"): |" >> "$OUT/strings-hit.txt" || true
done < <(find "$UNPACKED" -type f -size +64k -print0 2>/dev/null)
head -2000 "$OUT/strings-hit.txt" > "$OUT/strings-hit.head" || true
mv "$OUT/strings-hit.head" "$OUT/strings-hit.txt"

# ---------------------------------------------------------------- summary
say ""
say "files:      $(wc -l < "$OUT/tree.txt")"
say "bytes:      $(awk -F'\t' '{s+=$1} END {print s+0}' "$OUT/tree.txt")"
say "ELF:        $(wc -l < "$OUT/elf-binaries.txt")"
say "Qt hits:    $(wc -l < "$OUT/qt.txt")"
say "big blobs:  $(wc -l < "$OUT/resources.txt")"
say "strings:    $(wc -l < "$OUT/strings-hit.txt")"
say ""
say "--- largest ELF binaries ---"
sort -k1,1nr "$OUT/tree.txt" 2>/dev/null | awk -F'\t' '
  {print $2"\t"$1}' | head -400 > /dev/null
awk -F'\t' '{print $2}' "$OUT/elf-binaries.txt" 2>/dev/null |
  while IFS= read -r p; do
    [ -f "$p" ] && printf '%s\t%s\n' "$(stat -c %s "$p")" "$p"
  done | sort -rn | head -10 | tee -a "$OUT/summary.txt" || true
say ""
say "next: start REA on the largest ELF; check qt.txt for plugin dirs and"
say "resources.txt for the asset archives (.rcc) and template .pkt files."
