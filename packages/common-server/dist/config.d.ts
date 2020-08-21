declare const _default: {
    development: boolean;
    apiUrl: string;
    loginUrl: string;
    aws: {
        region: string;
        Auth: {
            userPoolId: string;
            userPoolWebClientId: string;
            mandatorySignIn: boolean;
            region: string;
        };
        Lambda: {};
        Postgres: {};
    };
};
export default _default;
