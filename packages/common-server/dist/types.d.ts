import { StrObj } from '@namcbugdb/common';
export declare type UserObj = {
    cognito: {
        sub: string;
        isLoggedIn: boolean;
        isAdmin: boolean;
    };
};
export declare type DBReturnType = StrObj[];
export declare type DBReturnPromiseType = Promise<DBReturnType>;
export declare type LambdaCtxAuth = {
    isLoggedIn: string;
    user: string;
};
