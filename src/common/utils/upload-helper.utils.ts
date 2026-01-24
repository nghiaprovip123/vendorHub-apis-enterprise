import crypto from "crypto"

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//   api_key: process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// })

export class Cloudinary {
  private async SignCloudinaryParams (
    params: Record<string, string | number>,
    api_secret: string
  ) {
    const toSign = Object.keys(params)
                    .sort()
                    .map(key => `${key}=${params[key]}`)
                    .join('&')
    
    return crypto
            .createHash('sha1')
            .update(toSign + api_secret)
            .digest('hex')
  }


}

// export class Cloudinary {
//   static async uploadToCloudinary ( stream: NodeJS.ReadableStream, folder: string): Promise<UploadApiResponse> {
//     return new Promise((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream (
//           {
//             folder,
//             resource_type: "image"
//           }, (error, result) => {
//             if (error) {
//               throw reject(error)
//             }
//             resolve(result!)
//           }
//         )
//         stream.pipe(uploadStream)
//       }
//     )
//   }
// }

