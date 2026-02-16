export const optionsCookie = {
  httpOnly: true,
  secure: false,             
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  domain: 'vh.local'
} as const;

export const optionsRevokedCookie = {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  } as const;
  