#!/bin/bash
set -e

# --- Configuration for Vercel ---
# Set explicit locations for Rust to avoid $HOME mismatches
export RUSTUP_HOME=/vercel/.rustup
export CARGO_HOME=/vercel/.cargo
export PATH=$CARGO_HOME/bin:$PATH

echo "🚀 Starting Vercel Build Script..."
echo "Current Directory: $(pwd)"
echo "RUSTUP_HOME: $RUSTUP_HOME"

# 1. Install Rust (if not found)
if ! command -v rustc &> /dev/null; then
    echo "📦 Installing Rust..."
    # --no-modify-path because we set PATH manually above
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --no-modify-path
else
    echo "✅ Rust is already installed."
fi

# Ensure the target is added
echo "🎯 Adding WASM target..."
rustup target add wasm32-unknown-unknown

# 2. Install wasm-pack (if not found)
if ! command -v wasm-pack &> /dev/null; then
    echo "📦 Installing wasm-pack..."
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh | sh
else
    echo "✅ wasm-pack is already installed."
fi

# 3. Build Core (WASM)
echo "🛠️ Building RustyCAD Core (WASM)..."
# Build directly into the web source tree
wasm-pack build --target web --out-dir web/src/wasm --out-name rustycad

# 4. Build Frontend
echo "🎨 Building Frontend..."
cd web
npm install
npm run build

echo "✅ Build Complete!"
