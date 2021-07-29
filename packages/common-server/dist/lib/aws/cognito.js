"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthCached = exports.getCognitoUser = exports.getCognitoUsers = exports.getUserAttributes = exports.getCognitoClient = exports.getUserObjFromLambdaCtx = void 0;
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var Authorizer_1 = __importDefault(require("../auth/Authorizer"));
var loglevel_1 = __importDefault(require("loglevel"));
var config_1 = require("../../config");
var lodash_1 = __importDefault(require("lodash"));
var MAX_USERS = 100;
var NOT_LOGGED_IN = function () {
    return lodash_1.default.cloneDeep({
        cognito: {
            isAdmin: false,
            isLoggedIn: false,
            isMachine: false,
            sub: null
        }
    });
};
function getUserObjFromLambdaCtx(authObj) {
    var newObj = NOT_LOGGED_IN();
    if (authObj.isLoggedIn === 'true' && authObj.user && authObj.user.length > 10) {
        newObj.cognito.sub = authObj.user;
        newObj.cognito.isLoggedIn = authObj.isLoggedIn === 'true';
    }
    return newObj;
}
exports.getUserObjFromLambdaCtx = getUserObjFromLambdaCtx;
function getCognitoClient(region) {
    var awsConfig = { region: region };
    aws_sdk_1.default.config.update(awsConfig);
    return new aws_sdk_1.default.CognitoIdentityServiceProvider();
}
exports.getCognitoClient = getCognitoClient;
function getUserAttributes(cognitoUser, attName) {
    try {
        if (cognitoUser.Attributes)
            return cognitoUser.Attributes.find(function (ua) { return ua.Name === attName; }).Value;
        else
            return cognitoUser.UserAttributes.find(function (ua) { return ua.Name === attName; }).Value;
    }
    catch (_a) {
        return null;
    }
}
exports.getUserAttributes = getUserAttributes;
function getCognitoUsers(cognitoClient, limit, nextToken) {
    return __awaiter(this, void 0, void 0, function () {
        var config, qLimit, params, groupParams;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, config_1.getConfigPromise()];
                case 1:
                    config = _a.sent();
                    qLimit = limit || MAX_USERS;
                    params = {
                        UserPoolId: config.cognito.userPoolId,
                        Limit: qLimit
                    };
                    if (nextToken && nextToken.length > 0)
                        params.PaginationToken = nextToken;
                    groupParams = {
                        GroupName: 'Admin',
                        UserPoolId: config.cognito.userPoolId
                    };
                    return [2, Promise.all([
                            cognitoClient.listUsers(params).promise(),
                            cognitoClient.listUsersInGroup(groupParams).promise()
                        ])
                            .then(function (_a) {
                            var userData = _a[0], adminUsers = _a[1];
                            return __assign(__assign({}, userData), { Users: userData.Users.map(function (newUser) {
                                    var isAdmin = Boolean(adminUsers.Users && adminUsers.Users.find(function (admu) { return newUser.Username === admu.Username; }));
                                    if (isAdmin)
                                        return null;
                                    config_1.NODECACHE.set("COGNITO::" + newUser.Username, newUser);
                                    return newUser;
                                }).filter(function (u) { return u !== null; }) });
                        })
                            .catch(function (err) {
                            throw new Error(err);
                        })];
            }
        });
    });
}
exports.getCognitoUsers = getCognitoUsers;
function getCognitoUser(cognitoClient, sub) {
    return __awaiter(this, void 0, void 0, function () {
        var cacheUser, config, params, user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!sub || sub.length === 0)
                        throw new Error('Invalid user sub');
                    cacheUser = config_1.NODECACHE.get("COGNITO::" + sub);
                    if (cacheUser)
                        return [2, cacheUser];
                    return [4, config_1.getConfigPromise()];
                case 1:
                    config = _a.sent();
                    params = {
                        UserPoolId: config.cognito.userPoolId,
                        Username: sub
                    };
                    return [4, Promise.all([
                            cognitoClient.adminGetUser(params).promise(),
                            cognitoClient.adminListGroupsForUser(params).promise()
                        ])
                            .then(function (_a) {
                            var user = _a[0], groupdata = _a[1];
                            var newUser = __assign(__assign({}, user), { isGlobalAdmin: Boolean(groupdata.Groups && groupdata.Groups.find(function (g) { return g.GroupName === 'Admin'; })) });
                            config_1.NODECACHE.set("COGNITO::" + sub, newUser);
                            return newUser;
                        })
                            .catch(function (err) {
                            throw new Error(err);
                        })];
                case 2:
                    user = _a.sent();
                    return [2, Promise.resolve(user)];
            }
        });
    });
}
exports.getCognitoUser = getCognitoUser;
function getAuthCached(event) {
    return __awaiter(this, void 0, void 0, function () {
        var authCode, cachedAuthUser, config_2, auth, user;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!event || !event.headers) {
                        return [2, Promise.resolve(NOT_LOGGED_IN())];
                    }
                    authCode = event.headers.authorization || event.headers.Authorization || event.headers.authorizationToken;
                    if (!authCode) {
                        return [2, Promise.resolve(NOT_LOGGED_IN())];
                    }
                    cachedAuthUser = config_1.NODECACHE.get("AUTHCODE::" + authCode);
                    if (!cachedAuthUser) return [3, 1];
                    loglevel_1.default.debug('getAuthCached:: Got cached user!', cachedAuthUser);
                    return [2, Promise.resolve(cachedAuthUser)];
                case 1:
                    loglevel_1.default.debug('getAuthCached:: No cached value. Fetching');
                    return [4, config_1.getConfigPromise()];
                case 2:
                    config_2 = _a.sent();
                    auth = new Authorizer_1.default(config_2);
                    return [4, auth
                            .AuthHandler(event.headers)
                            .then(function (data) { return __awaiter(_this, void 0, void 0, function () {
                            var isMachine, newUser;
                            return __generator(this, function (_a) {
                                isMachine = config_2.cognito.machineClientId && data.sub && config_2.cognito.machineClientId === data.sub;
                                newUser = {
                                    cognito: {
                                        isAdmin: data.isAdmin,
                                        isLoggedIn: true,
                                        isMachine: isMachine,
                                        sub: data.sub
                                    }
                                };
                                config_1.NODECACHE.set("AUTHCODE::" + authCode, newUser);
                                loglevel_1.default.info('getAuthCached:: finished fetching', newUser);
                                return [2, newUser];
                            });
                        }); })
                            .catch(function (err) {
                            loglevel_1.default.error(err);
                            return NOT_LOGGED_IN();
                        })];
                case 3:
                    user = _a.sent();
                    return [2, Promise.resolve(user)];
            }
        });
    });
}
exports.getAuthCached = getAuthCached;
//# sourceMappingURL=cognito.js.map