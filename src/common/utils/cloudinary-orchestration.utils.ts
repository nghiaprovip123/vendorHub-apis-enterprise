// cloudinary-orchestration.utils.ts
import crypto from 'crypto'
import FormData from 'form-data'
import axios from 'axios'
import { Readable } from 'stream'

type Env = 'dev' | 'staging' | 'prod'
type Module = 'staffs' | 'services' | 'vendors' | 'bookings'

interface BuildPublicIdInput {
  env: Env
  module: Module
  entityId: string
  assetType: string
}

type UploadImageToCloudinaryResult = {
  secure_url: string
  public_id: string
  format: string
  width: number
  height: number
}

export class Cloudinary {
  static SignParams(
    params: Record<string, string | number>,
    apiSecret: string
  ): string {
    const toSign = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')

    return crypto
      .createHash('sha1')
      .update(toSign + apiSecret)
      .digest('hex')
  }

  // ✅ Convert stream to buffer first
  static async streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
      stream.on('error', (err) => reject(err))
      stream.on('end', () => resolve(Buffer.concat(chunks)))
    })
  }

  static async UploadImageToCloudinary(
    file: NodeJS.ReadableStream,
    public_id: string,
    folder: string,
    resource_type: 'image' | 'video' | 'raw'
  ): Promise<UploadImageToCloudinaryResult> {
    const apiKey = process.env.CLOUDINARY_API_KEY!
    const apiSecret = process.env.CLOUDINARY_API_SECRET!
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME!
    const timestamp = Math.floor(Date.now() / 1000)

    // ✅ Convert stream to buffer
    const buffer = await this.streamToBuffer(file as Readable)

    const paramsToSign = { 
      folder, 
      public_id, 
      timestamp 
    }
    const signature = Cloudinary.SignParams(paramsToSign, apiSecret)

    const form = new FormData()
    // ✅ Append buffer with filename option
    form.append('file', buffer, {
      filename: 'upload.png',
      contentType: 'image/png',
    })
    form.append('folder', folder)
    form.append('public_id', public_id)
    form.append('timestamp', timestamp.toString())
    form.append('api_key', apiKey)
    form.append('signature', signature)

    console.log('Cloudinary upload params:', {
      folder,
      public_id,
      timestamp,
      apiKey,
      signature,
      cloudName,
      bufferSize: buffer.length,
    })

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resource_type}/upload`,
        form,
        { 
          headers: form.getHeaders(),
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      )

      return res.data as UploadImageToCloudinaryResult
    } catch (error: any) {
      console.error('Cloudinary upload error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      })
      throw new Error(`Cloudinary upload failed: ${error.response?.data?.error?.message || error.message}`)
    }
  }

  static async BuildPublicId({
    env,
    module,
    entityId,
    assetType,
  }: BuildPublicIdInput): Promise<string> {
    return `${entityId}/${assetType}`
  }

  static BuildFolder({ env, module }: { env: Env; module: Module }): string {
    return `${env}/${module}`
  }
}