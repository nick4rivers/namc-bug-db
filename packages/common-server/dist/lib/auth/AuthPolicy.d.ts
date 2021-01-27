declare type Methods = {
    resourceArn: string;
    conditions: string;
};
declare type ConditionalStatement = {
    Resource: string[];
    Action: string;
    Effect: string;
    Condition?: string;
};
declare type Policy = {
    principalId?: string;
    policyDocument: {
        Version?: string;
        Statement?: string[];
    };
};
declare class AuthPolicy {
    awsAccountId: string;
    principalId: string;
    version: string;
    restApiId: string;
    region: string;
    stage: string;
    pathRegex: RegExp;
    allowMethods: Methods[];
    denyMethods: Methods[];
    static HttpVerb: {
        GET: string;
        POST: string;
        PUT: string;
        PATCH: string;
        HEAD: string;
        DELETE: string;
        OPTIONS: string;
        ALL: string;
    };
    constructor(principal: any, awsAccountId: any, apiOptions: any);
    addMethod: (effect: any, verb: any, resource: any, conditions: any) => void;
    getEmptyStatement: (effect: string) => ConditionalStatement;
    getStatementsForEffect: (effect: any, methods: any) => any[];
    allowAllMethods: () => void;
    denyAllMethods: () => void;
    allowMethod: (verb: string, resource: string) => void;
    denyMethod: (verb: string, resource: string) => void;
    allowMethodWithConditions: (verb: string, resource: string, conditions: {}) => void;
    denyMethodWithConditions: (verb: string, resource: string, conditions: {}) => void;
    build: () => Policy;
}
export default AuthPolicy;
