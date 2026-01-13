#!/bin/bash
cd "$(dirname "$0")"
npm run build
chmod +x dist/cli.js
echo "Build complete!"
