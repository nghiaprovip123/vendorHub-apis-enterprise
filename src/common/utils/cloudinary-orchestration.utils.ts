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
    params: any,
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
  static async UploadImageToCloudinary (
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
        contentType = 'application/octet-stream'
      } = options

      const apiKey = process.env.CLOUDINARY_API_KEY!
      const apiSecret = process.env.CLOUDINARY_API_SECRET!
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME!
      const timestamp = Math.floor( Date.now() / 1000 )

      const signature = this.sign(
        {
          folder,
          public_id,
          timestamp
        }, apiSecret
      )

      const form = new FormData()
      form.append('file', file, {
        filename,
        contentType
      })
      form.append('folder', folder)
      form.append('public_id', public_id)
      form.append('api_key', apiKey)
      form.append('timestamp', timestamp)
      form.append('signature', signature)

      const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/${resource_type}/upload`, 
        form,
        {
          headers: form.getHeaders()
        }
      )

      return res.data as UploadResult
  }
  static async OverwriteImageInCloudinary(
    file: Readable,
    options: {
      contentType: string
      resource_type?: 'image' | 'video' | 'raw'
      folder: string
      public_id: string
      filename?: string
      overwrite: true
    }
  ): Promise<UploadResult> {
  
    const apiKey = process.env.CLOUDINARY_API_KEY!
    const apiSecret = process.env.CLOUDINARY_API_SECRET!
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME!
    const timestamp = Math.floor(Date.now() / 1000)
  
    const {
      filename = 'file',
      public_id,
      resource_type = 'image',
      folder,
      contentType = 'application/octet-stream',
    } = options
  
    const form = new FormData()
    form.append('file', file, { contentType, filename })
  
    const paramsToSign = {
      folder,
      overwrite: 'true',
      public_id,
      timestamp,
    }
  
    const signature = CloudinaryRest.sign(paramsToSign, apiSecret)
  
    form.append('api_key', apiKey)
    form.append('timestamp', timestamp.toString())
    form.append('signature', signature)
    form.append('folder', folder)
    form.append('public_id', public_id)
    form.append('overwrite', 'true')
  
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resource_type}/upload`,
      form,
      { headers: form.getHeaders() }
    )
  
    return res.data as UploadResult
  }  
}