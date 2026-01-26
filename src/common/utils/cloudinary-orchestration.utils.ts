import crypto from 'crypto'
import FormData from 'form-data'
import axios from 'axios'
import { Readable } from 'stream'

type UploadResult = {
  secure_url: string
  public_id: string
  format: string
  width?: number
  height?: number
}

export class CloudinaryRest {
  private static sign(
    params: Record<string, string | number>,
    secret: string
  ) {
    const toSign = Object.keys(params)
      .sort()
      .map(k => `${k}=${params[k]}`)
      .join('&')

    return crypto
      .createHash('sha1')
      .update(toSign + secret)
      .digest('hex')
  }

  static async upload(
    file: Readable,
    options: {
      folder: string
      public_id: string
      resource_type?: 'image' | 'video' | 'raw'
      filename?: string
      contentType?: string
    }
  ): Promise<UploadResult> {
    const {
      folder,
      public_id,
      resource_type = 'image',
      filename = 'file',
      contentType = 'application/octet-stream',
    } = options
  
    const apiKey = process.env.CLOUDINARY_API_KEY!
    const apiSecret = process.env.CLOUDINARY_API_SECRET!
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME!
    const timestamp = Math.floor(Date.now() / 1000)
  
    const signature = this.sign(
      { folder, public_id, timestamp },
      apiSecret
    )
  
    const form = new FormData()
    form.append('file', file, {
      filename,
      contentType,
    })
    form.append('folder', folder)
    form.append('public_id', public_id)
    form.append('api_key', apiKey)
    form.append('timestamp', timestamp.toString())
    form.append('signature', signature)
    console.log(form)
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resource_type}/upload`,
      form,
      { headers: form.getHeaders() }
    )
  
    return res.data
  }
  
}
