import { types } from '@namcbugdb/common'
export type UserObj = {
    cognito: {
        sub: string
        isLoggedIn: boolean
        isAdmin: boolean
        isMachine: boolean
    }
}

export type DBReturnType = types.StrObj[]
export type DBReturnPromiseType = Promise<DBReturnType>

export type LambdaCtxAuth = {
    isLoggedIn: string
    user: string
}
