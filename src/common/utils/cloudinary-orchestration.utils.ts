import crypto from 'crypto'

type UploadImageToCloudinaryResult = {
  secure_url: string
  public_id: string
  format: string
  width: number
  height: number
}

export class Cloudinary {

  static signCloudinaryParams(
    params: Record<string, string | number>,
    apiSecret: string
  ) {
    const toSign = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')

    return crypto
      .createHash('sha1')
      .update(toSign + apiSecret)
      .digest('hex')
  }

  static async uploadImage(
    file: Buffer | NodeJS.ReadableStream,
    folder: string,
    publicId: string
  ): Promise<UploadImageToCloudinaryResult> {

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME!
    const apiKey = process.env.CLOUDINARY_API_KEY!
    const apiSecret = process.env.CLOUDINARY_API_SECRET!

    const timestamp = Math.floor(Date.now() / 1000)

    const paramsToSign = {
      timestamp,
      folder,
      public_id: publicId
    }

    const signature = Cloudinary.signCloudinaryParams(paramsToSign, apiSecret)

    const form = new FormData()
    form.append('file', file)
    form.append('folder', folder)
    form.append('public_id', publicId)
    form.append('timestamp', timestamp.toString())
    form.append('api_key', apiKey)
    form.append('signature', signature)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: form }
    )

    if (!res.ok) {
      throw new Error(await res.text())
    }

    const data = await res.json()
    return data as UploadImageToCloudinaryResult  
  }
}
