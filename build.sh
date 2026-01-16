#!/usr/bin/env bash
set -e

echo "📦 Instalando dependencias backend..."
pip install -r requirements.txt

echo "🎨 Construyendo frontend..."
cd frontend
npm install
npm run build

