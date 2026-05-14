/**
 * Compress a base64 JPEG image by resizing and reducing quality.
 * Target: max 1024px on longest side, ~70% quality, under 500KB.
 *
 * This runs in the Electron main process (Node.js),
 * using native image processing when available.
 */
export interface CompressResult {
  base64: string
  originalSize: number
  compressedSize: number
}

export async function compressImage(base64: string): Promise<CompressResult> {
  const originalSize = base64.length

  // In Electron main process, try sharp first
  try {
    const sharp = (await import('sharp')).default
    const buffer = Buffer.from(base64, 'base64')
    const image = sharp(buffer)
    const metadata = await image.metadata()

    const maxDim = 1024
    if (metadata.width && metadata.height) {
      const largest = Math.max(metadata.width, metadata.height)
      if (largest > maxDim) {
        image.resize({ width: Math.round(metadata.width * maxDim / largest) })
      }
    }

    const compressed = await image.jpeg({ quality: 70 }).toBuffer()
    return {
      base64: compressed.toString('base64'),
      originalSize,
      compressedSize: compressed.length
    }
  } catch {
    // sharp not available — return as-is
    return { base64, originalSize, compressedSize: originalSize }
  }
}
