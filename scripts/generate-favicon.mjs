#!/usr/bin/env node
// Optional. Regenerates src/app/favicon.ico from src/app/icon.svg.
// Not part of prebuild or build, and it does not add dependencies to
// package.json. sharp and png-to-ico are resolved from NODE_PATH:
//
//   npm install --no-save --prefix /tmp/favicon-tools sharp png-to-ico
//   NODE_PATH=/tmp/favicon-tools/node_modules node scripts/generate-favicon.mjs
//
// Writes a multi-size ICO (16, 32, 48 px) of the same artwork.

import { createRequire } from 'node:module'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const svgPath = path.join(root, 'src/app/icon.svg')
const icoPath = path.join(root, 'src/app/favicon.ico')
const sizes = [16, 32, 48]

// ESM import does not honor NODE_PATH. Resolve from NODE_PATH entries,
// then from /tmp/favicon-tools, so the packages stay out of package.json.
const { sharp, pngToIco } = await loadTools()

async function loadTools() {
  const roots = [
    ...(process.env.NODE_PATH ? process.env.NODE_PATH.split(path.delimiter) : []),
    '/tmp/favicon-tools/node_modules',
  ]
  try {
    const sharp = (await importFrom(roots, 'sharp')).default
    const pngToIcoModule = await importFrom(roots, 'png-to-ico')
    const pngToIco = pngToIcoModule.default ?? pngToIcoModule
    return { sharp, pngToIco }
  } catch (error) {
    console.error('generate-favicon: sharp and png-to-ico must be resolvable from NODE_PATH.')
    console.error('  npm install --no-save --prefix /tmp/favicon-tools sharp png-to-ico')
    console.error('  NODE_PATH=/tmp/favicon-tools/node_modules node scripts/generate-favicon.mjs')
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

async function importFrom(roots, specifier) {
  let lastError
  for (const rootDir of roots) {
    const base = path.join(rootDir, '..', 'package.json')
    try {
      const resolved = createRequire(base).resolve(specifier)
      return import(pathToFileURL(resolved).href)
    } catch (error) {
      lastError = error
    }
  }
  throw lastError ?? new Error(`cannot resolve ${specifier}`)
}

const svg = await readFile(svgPath)
// Rasterize well above the largest icon, then downscale so the 16 px
// frame keeps the same artwork instead of a blurry upscale from 32 px.
const pngs = await Promise.all(
  sizes.map((size) =>
    sharp(svg, { density: 72 * 8 })
      .resize(size, size, { fit: 'fill' })
      .png()
      .toBuffer(),
  ),
)

const ico = Buffer.from(await pngToIco(pngs))
await writeFile(icoPath, ico)

const frames = readIcoFrames(ico)
const got = frames.map((frame) => frame.size).join(', ')
const expected = sizes.join(', ')
if (got !== expected) {
  console.error(`generate-favicon: expected sizes ${expected}, wrote ${got || 'none'}`)
  process.exit(1)
}

console.log(
  `wrote ${path.relative(root, icoPath)} (${frames.length} frames: ${got} px, ${ico.length} bytes)`,
)

function readIcoFrames(buffer) {
  if (buffer.length < 6) return []
  const count = buffer.readUInt16LE(4)
  const frames = []
  for (let i = 0; i < count; i++) {
    const entry = 6 + i * 16
    if (entry + 16 > buffer.length) break
    const width = buffer.readUInt8(entry) || 256
    const height = buffer.readUInt8(entry + 1) || 256
    frames.push({ size: width === height ? String(width) : `${width}x${height}` })
  }
  return frames
}
