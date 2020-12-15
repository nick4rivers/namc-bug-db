declare const _default: {
    development: boolean;
    apiUrl: string;
    pg: {
        user: string;
        password: string;
        database: string;
        port: string | number;
        host: string;
    };
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
