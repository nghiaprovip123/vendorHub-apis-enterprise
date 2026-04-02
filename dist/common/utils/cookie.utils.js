"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionsRevokedCookie = exports.optionsCookie = void 0;
const isProd = process.env.NODE_ENV === 'production';
exports.optionsCookie = {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? 'none' : 'lax'),
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    ...(isProd ? {} : { domain: 'vh.local' })
};
exports.optionsRevokedCookie = {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? 'none' : 'strict'),
    path: '/',
    maxAge: 0,
};
