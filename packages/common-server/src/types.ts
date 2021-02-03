export type UserObj = {
    cognito: {
        sub: string
        isLoggedIn: boolean
        isAdmin: boolean
    }
}

export type LambdaCtxAuth = {
    isLoggedIn: string
    user: string
}
