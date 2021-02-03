export declare type AuthMethod = {
    resourceArn: string;
    conditions: string;
};
export declare type AuthStatement = {
    Action: string;
    Effect: string;
    Resource: string[];
    Condition?: string;
};
export declare type AuthDocument = {
    Version: string;
    Statement: AuthStatement[];
};
export declare type AuthPolicyDoc = {
    principalId: string;
    policyDocument: AuthDocument;
    HttpVerb?: string;
    context?: {};
};
export declare enum HttpVerb {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    HEAD = "HEAD",
    DELETE = "DELETE",
    OPTIONS = "OPTIONS",
    ALL = "*"
}
