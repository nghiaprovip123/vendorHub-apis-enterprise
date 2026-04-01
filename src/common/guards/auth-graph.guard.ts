export const requireAuth = (ctx: any) => {
    if (!ctx.authid) {
      throw new Error("UNAUTHENTICATED")
    }
  }