import { AuthMethod, AuthStatement, AuthPolicyDoc } from './types';
declare class AuthPolicy {
    readonly awsAccountId: string;
    readonly principalId: string;
    readonly version: string;
    readonly pathRegex: RegExp;
    readonly allowMethods: AuthMethod[];
    readonly denyMethods: AuthMethod[];
    readonly restApiId: string;
    readonly region: string;
    readonly stage: string;
    constructor(principal: string, awsAccountId: string, apiOptions: {
        [key: string]: string;
    });
    addMethod: (effect: string, verb: string, resource: string, conditions: any) => void;
    getEmptyStatement: (effect: string) => AuthStatement;
    getStatementsForEffect: (effect: string, methods: AuthMethod[]) => AuthStatement[];
    allowAllMethods: () => void;
    denyAllMethods: () => void;
    allowMethod: (verb: string, resource: any) => void;
    denyMethod: (verb: string, resource: string) => void;
    allowMethodWithConditions: (verb: string, resource: string, conditions: any) => void;
    denyMethodWithConditions: (verb: string, resource: string, conditions: any) => void;
    build: () => AuthPolicyDoc;
}
export default AuthPolicy;
