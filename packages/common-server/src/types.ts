import { StrObj } from '@namcbugdb/common'
export type UserObj = {
    cognito: {
        sub: string
        isLoggedIn: boolean
        isAdmin: boolean
    }
}

export type DBReturnType = StrObj[]
export type DBReturnPromiseType = Promise<DBReturnType>

export type LambdaCtxAuth = {
    isLoggedIn: string
    user: string
}
