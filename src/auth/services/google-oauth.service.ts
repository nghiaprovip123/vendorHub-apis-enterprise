type exchangeGoogleTokensInput = {
    code: string
}

type fetchUserInfoInput = {
    access_token: string
}

type GoogleTokensResponse = {
    access_token: string
}

type GoogleUserInfoResponse = {
    displayName: string,
    email: string
}

type exchangeGoogleTokensOutput = {
    access_token: string
}

type fetchUserInfoOutput = {
    email: string,
    displayName: string
}

export class GoogleOpenAuthorizationService {
    static async exchangeGoogleTokens ({code}: exchangeGoogleTokensInput): Promise<exchangeGoogleTokensOutput> {
        const exchangeTokens = await fetch('https://oauth2.googleapis.com/token', {
            "method": 'POST',
            "headers": {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams(
                {
                    code,
                    client_id: process.env.GOOGLE_CLIENT_ID!,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
                    grant_type: "authorization_code",
                }
            )
        })

        if(!exchangeTokens.ok) {
            throw new Error('KHÔNG FETCH ĐƯỢC TOKENS TỪ GOOGLE AUTHORIZATION')
        }

        const tokens = (await exchangeTokens.json()) as GoogleTokensResponse;

        return tokens
    }

    static async fetchUserInfo ({access_token}: fetchUserInfoInput): Promise<fetchUserInfoOutput> {
        if (!access_token) {
            throw new Error('THIẾU THÔNG TIN ACCESS TOKEN')
        }

        const fetchUser = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
            "method": "GET",
            "headers": {
                Authorization: `Bearer ${access_token}`
            }
        })

        if(!fetchUser.ok) {
            throw new Error('KHÔNG FETCH ĐƯỢC THÔNG TIN USER TỪ GOOGLE APIs')
        }

        const user = (await fetchUser.json()) as GoogleUserInfoResponse

        return user
    }
}