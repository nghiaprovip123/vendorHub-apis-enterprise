"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleRedirectController = void 0;
const GoogleRedirectController = (req, res) => {
    const baseUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    baseUrl.searchParams.append('client_id', process.env.GOOGLE_CLIENT_ID);
    baseUrl.searchParams.append('redirect_uri', process.env.GOOGLE_REDIRECT_URI);
    baseUrl.searchParams.append('response_type', 'code');
    baseUrl.searchParams.append('scope', 'openid email profile');
    baseUrl.searchParams.append('access_type', 'offline');
    baseUrl.searchParams.append('prompt', 'consent');
    return res.redirect(baseUrl.toString());
};
exports.GoogleRedirectController = GoogleRedirectController;
