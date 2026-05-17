const MAX_WIDTH = 1280
const JPEG_QUALITY = 0.7

export function compressImage(base64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const { width, height } = img
      if (width <= MAX_WIDTH) {
        resolve(base64)
        return
      }
      const ratio = MAX_WIDTH / width
      const canvas = document.createElement('canvas')
      canvas.width = MAX_WIDTH
      canvas.height = Math.round(height * ratio)
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(base64)
        return
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(base64); return }
          const reader = new FileReader()
          reader.onloadend = () => {
            const result = (reader.result as string).split(',')[1] || base64
            resolve(result)
          }
          reader.readAsDataURL(blob)
        },
        'image/jpeg',
        JPEG_QUALITY
      )
    }
    img.onerror = () => resolve(base64)
    img.src = `data:image/jpeg;base64,${base64}`
  })
}
