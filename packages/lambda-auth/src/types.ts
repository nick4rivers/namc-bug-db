export type AuthMethod = {
    resourceArn: string
    conditions: string
}

export type AuthStatement = {
    Action: string
    Effect: string
    Resource: string[]
    Condition?: string
}

export type AuthDocument = {
    Version: string
    Statement: AuthStatement[]
}

export type AuthPolicyDoc = {
    principalId: string
    policyDocument: AuthDocument
    HttpVerb?: string
    context?: {}
}

export enum HttpVerb {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    HEAD = 'HEAD',
    DELETE = 'DELETE',
    OPTIONS = 'OPTIONS',
    ALL = '*'
}
