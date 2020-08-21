declare const _default: {
    Query: {
        auth: (obj: any, args: any, ctx: any, info: any) => {
            loggedIn: boolean;
            userPool: string;
            clientId: string;
            region: string;
            domain: string;
        };
    };
    Mutation: {};
};
export default _default;
