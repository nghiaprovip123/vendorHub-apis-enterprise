import { Request, Response } from "express";

export const GoogleRedirectController = (req: Request, res: Response) => {
    const baseUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');

    baseUrl.searchParams.append('client_id', process.env.GOOGLE_CLIENT_ID!);
    baseUrl.searchParams.append('redirect_uri', process.env.GOOGLE_REDIRECT_URI!);
    baseUrl.searchParams.append('response_type', 'code');
    baseUrl.searchParams.append('scope', 'openid email profile');
    baseUrl.searchParams.append('access_type', 'offline');
    baseUrl.searchParams.append('prompt', 'consent');

    return res.redirect(baseUrl.toString());
};
