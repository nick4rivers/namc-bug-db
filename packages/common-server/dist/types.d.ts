import { types } from '@namcbugdb/common';
export declare type UserObj = {
    cognito: {
        sub: string;
        isLoggedIn: boolean;
        isAdmin: boolean;
        isMachine: boolean;
    };
};
export declare type DBReturnType = types.StrObj[];
export declare type DBReturnPromiseType = Promise<DBReturnType>;
export declare type LambdaCtxAuth = {
    isLoggedIn: string;
    user: string;
};
