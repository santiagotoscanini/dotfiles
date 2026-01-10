#!/bin/bash
cd "$(dirname "$0")"
npm run build
cp source/packages.json dist/
chmod +x dist/cli.js
echo "Build complete! Run with: node dist/cli.js"
