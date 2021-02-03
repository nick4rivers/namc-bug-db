export declare type UserObj = {
    cognito: {
        sub: string;
        isLoggedIn: boolean;
        isAdmin: boolean;
    };
};
export declare type LambdaCtxAuth = {
    isLoggedIn: string;
    user: string;
};
