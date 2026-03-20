const isProd = process.env.NODE_ENV === 'production';

export const optionsCookie = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  ...(isProd ? {} : { domain: 'vh.local' })
};

export const optionsRevokedCookie = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? 'none' : 'strict') as 'none' | 'strict',
  path: '/',
  maxAge: 0,
};