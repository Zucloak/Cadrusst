#!/bin/bash

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# Source environment variables
source $HOME/.cargo/env

# Add WASM target
rustup target add wasm32-unknown-unknown

# Install dependencies
npm install
cd frontend && npm install
