#!/bin/bash
set -e

echo "🚀 Starting Vercel Build..."

# 1. Install Rust
if ! command -v rustc &> /dev/null; then
    echo "📦 Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    echo "✅ Rust is already installed."
fi

# 2. Install wasm-pack
if ! command -v wasm-pack &> /dev/null; then
    echo "📦 Installing wasm-pack..."
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh | sh
else
    echo "✅ wasm-pack is already installed."
fi

# 3. Build Core (WASM)
echo "🛠️ Building RustyCAD Core (WASM)..."
# We output directly to the web source directory so Vite can find it easily
wasm-pack build --target web --out-dir web/src/wasm --out-name rustycad --no-typescript
# Note: --no-typescript prevents generating a .d.ts that might conflict or be in the wrong place,
# but usually we want types. Let's keep types but maybe move them if needed.
# Actually, let's allow types, it helps development.
wasm-pack build --target web --out-dir web/src/wasm --out-name rustycad

# 4. Build Frontend
echo "🎨 Building Frontend..."
cd web
npm install
npm run build

echo "✅ Build Complete!"
