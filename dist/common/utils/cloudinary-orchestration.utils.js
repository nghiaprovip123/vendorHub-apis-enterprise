"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryRest = void 0;
const crypto_1 = __importDefault(require("crypto"));
const form_data_1 = __importDefault(require("form-data"));
const axios_1 = __importDefault(require("axios"));
class CloudinaryRest {
    static sign(params, secret) {
        const toSign = Object.keys(params)
            .sort()
            .map(k => `${k}=${params[k]}`)
            .join('&');
        return crypto_1.default
            .createHash('sha1')
            .update(toSign + secret)
            .digest('hex');
    }
    static async UploadImageToCloudinary(file, options) {
        const { folder, public_id, resource_type = 'image', filename = 'file', contentType = 'application/octet-stream' } = options;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = this.sign({
            folder,
            public_id,
            timestamp
        }, apiSecret);
        const form = new form_data_1.default();
        form.append('file', file, {
            filename,
            contentType
        });
        form.append('folder', folder);
        form.append('public_id', public_id);
        form.append('api_key', apiKey);
        form.append('timestamp', timestamp);
        form.append('signature', signature);
        const res = await axios_1.default.post(`https://api.cloudinary.com/v1_1/${cloudName}/${resource_type}/upload`, form, {
            headers: form.getHeaders()
        });
        return res.data;
    }
}
exports.CloudinaryRest = CloudinaryRest;
