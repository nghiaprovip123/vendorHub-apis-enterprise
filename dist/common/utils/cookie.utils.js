"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionsRevokedCookie = exports.optionsCookie = void 0;
exports.optionsCookie = {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    domain: 'vh.local'
};
exports.optionsRevokedCookie = {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
};
