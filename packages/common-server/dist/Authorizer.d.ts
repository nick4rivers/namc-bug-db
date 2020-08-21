declare type ValidateResolve = (params: any) => void;
declare class Authorizer {
    userPoolId: string;
    region: string;
    iss: string;
    pems: {
        [key: string]: string;
    };
    constructor(config: any);
    ValidateToken: (pems: {
        [x: string]: string;
    }, token: string, resolve: ValidateResolve, reject: (reason?: string | Error) => void) => void;
    AuthHandler: (headers: {
        [key: string]: string;
    }) => Promise<void | {
        [key: string]: string;
    }>;
    getBearerToken(headers: {
        [key: string]: string;
    }): string;
}
export default Authorizer;
