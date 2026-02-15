export const optionsCookie = {
  httpOnly: true,
  secure: false,             // dev HTTP
  sameSite: 'lax' as const,
  domain: '.vh.local',       // QUAN TRỌNG
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
} as const;

export const optionsRevokedCookie = {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  } as const;
  