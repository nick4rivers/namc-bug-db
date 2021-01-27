"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var AuthPolicy = (function () {
    function AuthPolicy(principal, awsAccountId, apiOptions) {
        var _this = this;
        this.addMethod = function (effect, verb, resource, conditions) {
            if (verb !== '*' && !AuthPolicy.HttpVerb.hasOwnProperty(verb)) {
                throw new Error('Invalid HTTP verb ' + verb + '. Allowed verbs in AuthPolicy.HttpVerb');
            }
            if (!_this.pathRegex.test(resource)) {
                throw new Error('Invalid resource path: ' + resource + '. Path should match ' + _this.pathRegex);
            }
            var cleanedResource = resource;
            if (resource.substring(0, 1) === '/') {
                cleanedResource = resource.substring(1, resource.length);
            }
            var resourceArn = "arn:aws:execute-api:" + _this.region + ":" + _this.awsAccountId + ":" + _this.restApiId +
                (_this.stage + "/" + verb + "/" + cleanedResource);
            if (effect.toLowerCase() === 'allow') {
                _this.allowMethods.push({
                    resourceArn: resourceArn,
                    conditions: conditions
                });
            }
            else if (effect.toLowerCase() === 'deny') {
                _this.denyMethods.push({
                    resourceArn: resourceArn,
                    conditions: conditions
                });
            }
        };
        this.getEmptyStatement = function (effect) {
            effect = effect.substring(0, 1).toUpperCase() + effect.substring(1, effect.length).toLowerCase();
            return {
                Action: 'execute-api:Invoke',
                Effect: effect,
                Resource: []
            };
        };
        this.getStatementsForEffect = function (effect, methods) {
            var statements = [];
            if (methods.length > 0) {
                var statement = _this.getEmptyStatement(effect);
                for (var i = 0; i < methods.length; i++) {
                    var curMethod = methods[i];
                    if (curMethod.conditions === null || curMethod.conditions.length === 0) {
                        statement.Resource.push(curMethod.resourceArn);
                    }
                    else {
                        var conditionalStatement = _this.getEmptyStatement(effect);
                        conditionalStatement.Resource.push(curMethod.resourceArn);
                        conditionalStatement.Condition = curMethod.conditions;
                        statements.push(conditionalStatement);
                    }
                }
                if (statement.Resource !== null && statement.Resource.length > 0) {
                    statements.push(statement);
                }
            }
            return statements;
        };
        this.allowAllMethods = function () {
            _this.addMethod('allow', '*', '*', null);
        };
        this.denyAllMethods = function () {
            _this.addMethod('deny', '*', '*', null);
        };
        this.allowMethod = function (verb, resource) {
            _this.addMethod('allow', verb, resource, null);
        };
        this.denyMethod = function (verb, resource) {
            _this.addMethod('deny', verb, resource, null);
        };
        this.allowMethodWithConditions = function (verb, resource, conditions) {
            _this.addMethod('allow', verb, resource, conditions);
        };
        this.denyMethodWithConditions = function (verb, resource, conditions) {
            _this.addMethod('deny', verb, resource, conditions);
        };
        this.build = function () {
            if ((!_this.allowMethods || _this.allowMethods.length === 0) &&
                (!_this.denyMethods || _this.denyMethods.length === 0)) {
                throw new Error('No statements defined for the policy');
            }
            var policy = {
                principalId: _this.principalId,
                policyDocument: {
                    Version: _this.version,
                    Statement: __spreadArrays(_this.getStatementsForEffect('Allow', _this.allowMethods), _this.getStatementsForEffect('Deny', _this.denyMethods))
                }
            };
            return policy;
        };
        this.awsAccountId = awsAccountId;
        this.principalId = principal;
        this.version = '2012-10-17';
        this.pathRegex = new RegExp('^[/.a-zA-Z0-9-*]+$');
        this.allowMethods = [];
        this.denyMethods = [];
        if (!apiOptions || !apiOptions.restApiId) {
            this.restApiId = '*';
        }
        else {
            this.restApiId = apiOptions.restApiId;
        }
        if (!apiOptions || !apiOptions.region) {
            this.region = '*';
        }
        else {
            this.region = apiOptions.region;
        }
        if (!apiOptions || !apiOptions.stage) {
            this.stage = '*';
        }
        else {
            this.stage = apiOptions.stage;
        }
    }
    AuthPolicy.HttpVerb = {
        GET: 'GET',
        POST: 'POST',
        PUT: 'PUT',
        PATCH: 'PATCH',
        HEAD: 'HEAD',
        DELETE: 'DELETE',
        OPTIONS: 'OPTIONS',
        ALL: '*'
    };
    return AuthPolicy;
}());
exports.default = AuthPolicy;
//# sourceMappingURL=AuthPolicy.js.map