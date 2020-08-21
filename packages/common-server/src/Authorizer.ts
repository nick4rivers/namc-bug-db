import jwt from 'jsonwebtoken'
import axios from 'axios'
import jwkToPem from 'jwk-to-pem'
import log from 'loglevel'

type ValidateResolve = (params: any) => void
// type ValidateReject = (err: Error) => void

class Authorizer {
    userPoolId: string
    region: string
    iss: string
    pems: { [key: string]: string }

    constructor(config) {
        this.userPoolId = config.aws.Auth.userPoolId
        this.region = config.aws.Auth.region
        this.iss = 'https://cognito-idp.' + this.region + '.amazonaws.com/' + this.userPoolId
        this.pems = null
    }

    ValidateToken = (
        pems: { [x: string]: string },
        token: string,
        resolve: ValidateResolve,
        reject: (reason?: string | Error) => void
    ): void => {
        // Fail if the token is not jwt
        const decodedJwt = jwt.decode(token, { complete: true })
        if (!decodedJwt) {
            log.info('Not a valid JWT token', token)
            reject(new Error('Unauthorized'))
            return
        }

        // Fail if token is not from your UserPool
        if (decodedJwt.payload.iss !== this.iss) {
            log.info('invalid issuer')
            reject(new Error('Unauthorized'))
            return
        }

        // Reject the jwt if it's not an 'Access Token'
        if (decodedJwt.payload.token_use !== 'access') {
            log.info('Not an access token')
            reject(new Error('Unauthorized'))
            return
        }

        // Get the kid from the token and retrieve corresponding PEM
        const kid = decodedJwt.header.kid
        const pem = pems[kid]
        if (!pem) {
            log.info('Invalid access token')
            reject(new Error('Unauthorized'))
            return
        }

        // Verify the signature of the JWT token to ensure it's really coming from your User Pool
        jwt.verify(token, pem, { issuer: this.iss }, (err, payload) => {
            if (err || !payload) {
                return reject(new Error(err.message))
            } else if (err) {
                return reject(new Error('Unauthorized'))
            } else {
                // Valid token. Generate the API Gateway policy for the user
                // Always generate the policy on value of 'sub' claim and not for 'username' because username is reassignable
                // sub is UUID for a user which is never reassigned to another user.
                // const principalId = payload.sub

                // Get AWS AccountId and API Options
                // const apiOptions = {}
                // const tmp = event.methodArn.split(':')
                // const apiGatewayArnTmp = tmp[5].split('/')
                // const awsAccountId = tmp[4]
                // apiOptions.region = tmp[3]
                // apiOptions.restApiId = apiGatewayArnTmp[0]
                // apiOptions.stage = apiGatewayArnTmp[1]
                // const method = apiGatewayArnTmp[2]
                // let resource = '/' // root resource
                // if (apiGatewayArnTmp[3]) {
                //   resource += apiGatewayArnTmp[3]
                // }
                // For more information on specifics of generating policy, refer to blueprint for API Gateway's Custom authorizer in Lambda console
                // const policy = new AuthPolicy(principalId, awsAccountId, apiOptions)
                // policy.allowAllMethods()
                // context.succeed(policy.build())
                const { sub, exp, iat, email, username } = payload
                const isAdmin = payload['cognito:groups'] && payload['cognito:groups'].indexOf('Admin') > -1
                // Only pass what we need onwards
                resolve({
                    sub,
                    exp,
                    iat,
                    email,
                    username,
                    isAdmin
                })
            }
        })
    }

    AuthHandler = (headers: { [key: string]: string }): Promise<{ [key: string]: string } | void> => {
        const bearerToken = this.getBearerToken(headers)
        if (!bearerToken) return Promise.resolve()
        const iss = this.iss
        return new Promise((resolve, reject) => {
            // Download PEM for your UserPool if not already downloaded
            if (!this.pems) {
                // Download the JWKs and save it as PEM
                return axios
                    .get(`${iss}/.well-known/jwks.json`, {
                        responseType: 'json'
                    })
                    .then((response) => {
                        if (response.status === 200) {
                            this.pems = {}
                            const keys = response.data.keys
                            for (let i = 0; i < keys.length; i++) {
                                // Convert each key to PEM
                                const keyId = keys[i].kid
                                const modulus = keys[i].n
                                const exponent = keys[i].e
                                const keyType = keys[i].kty
                                const jwk = { kty: keyType, n: modulus, e: exponent }
                                const pem = jwkToPem(jwk)
                                this.pems[keyId] = pem
                            }
                            // Now continue with validating the token
                            this.ValidateToken(this.pems, bearerToken, resolve, reject)
                        } else {
                            throw new Error('error downloading JWKs')
                        }
                    })
                    .catch(() => {
                        throw new Error('error downloading JWKs')
                    })
            } else {
                // PEMs are already downloaded, continue with validating the token
                this.ValidateToken(this.pems, bearerToken, resolve, reject)
            }
        })
    }

    getBearerToken(headers: { [key: string]: string }): string {
        try {
            const token = headers.authorization || headers.Authorization || headers.authorizationToken
            return token ? token.replace('Bearer ', '') : null
        } catch (e) {
            log.error('getBearerToken', e)
        }
        return ''
    }
}

export default Authorizer
