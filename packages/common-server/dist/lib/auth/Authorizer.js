"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var axios_1 = __importDefault(require("axios"));
var jwk_to_pem_1 = __importDefault(require("jwk-to-pem"));
var loglevel_1 = __importDefault(require("loglevel"));
var Authorizer = (function () {
    function Authorizer(config) {
        var _this = this;
        this.ValidateToken = function (pems, token, resolve, reject) {
            var decodedJwt = jsonwebtoken_1.default.decode(token, { complete: true });
            if (!decodedJwt) {
                loglevel_1.default.info('Not a valid JWT token', token);
                reject(new Error('Unauthorized'));
                return;
            }
            if (decodedJwt.payload.iss !== _this.iss) {
                loglevel_1.default.info('invalid issuer');
                reject(new Error('Unauthorized'));
                return;
            }
            if (decodedJwt.payload.token_use !== 'access') {
                loglevel_1.default.info('Not an access token');
                reject(new Error('Unauthorized'));
                return;
            }
            var kid = decodedJwt.header.kid;
            var pem = pems[kid];
            if (!pem) {
                loglevel_1.default.info('Invalid access token');
                reject(new Error('Unauthorized'));
                return;
            }
            jsonwebtoken_1.default.verify(token, pem, { issuer: _this.iss }, function (err, payload) {
                if (err || !payload) {
                    return reject(new Error(err.message));
                }
                else if (err) {
                    return reject(new Error('Unauthorized'));
                }
                else {
                    var sub = payload.sub, exp = payload.exp, iat = payload.iat, email = payload.email, username = payload.username;
                    var isAdmin = payload['cognito:groups'] && payload['cognito:groups'].indexOf('Admin') > -1;
                    resolve({
                        sub: sub,
                        exp: exp,
                        iat: iat,
                        email: email,
                        username: username,
                        isAdmin: isAdmin
                    });
                }
            });
        };
        this.AuthHandler = function (headers) {
            var bearerToken = _this.getBearerToken(headers);
            if (!bearerToken)
                return Promise.resolve();
            var iss = _this.iss;
            return new Promise(function (resolve, reject) {
                if (!_this.pems) {
                    return axios_1.default
                        .get(iss + "/.well-known/jwks.json", {
                        responseType: 'json'
                    })
                        .then(function (response) {
                        if (response.status === 200) {
                            _this.pems = {};
                            var keys = response.data.keys;
                            for (var i = 0; i < keys.length; i++) {
                                var keyId = keys[i].kid;
                                var modulus = keys[i].n;
                                var exponent = keys[i].e;
                                var keyType = keys[i].kty;
                                var jwk = { kty: keyType, n: modulus, e: exponent };
                                var pem = jwk_to_pem_1.default(jwk);
                                _this.pems[keyId] = pem;
                            }
                            _this.ValidateToken(_this.pems, bearerToken, resolve, reject);
                        }
                        else {
                            throw new Error('error downloading JWKs');
                        }
                    })
                        .catch(function () {
                        throw new Error('error downloading JWKs');
                    });
                }
                else {
                    _this.ValidateToken(_this.pems, bearerToken, resolve, reject);
                }
            });
        };
        this.userPoolId = config.cognito.userPoolId;
        this.region = config.region;
        this.iss = 'https://cognito-idp.' + this.region + '.amazonaws.com/' + this.userPoolId;
        this.pems = null;
    }
    Authorizer.prototype.getBearerToken = function (headers) {
        try {
            var token = headers.authorization || headers.Authorization || headers.authorizationToken;
            return token ? token.replace('Bearer ', '') : null;
        }
        catch (e) {
            loglevel_1.default.error('getBearerToken', e);
        }
        return '';
    };
    return Authorizer;
}());
exports.default = Authorizer;
//# sourceMappingURL=Authorizer.js.map