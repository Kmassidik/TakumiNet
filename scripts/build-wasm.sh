#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
cargo build --release --lib --target wasm32-unknown-unknown
cp target/wasm32-unknown-unknown/release/pt_web.wasm web/engine.wasm
wc -c web/engine.wasm
