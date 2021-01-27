import { UserObj } from '../../types'
import { getConfigPromise } from '../../config'
import * as ssm from '../aws/ssm'
import log from 'loglevel'

// log.enableAll()

export {}
// export function checkAuth(user: UserObj): void {
//     if (!user || !user.cognito.username || user.cognito.username.length === 0)
//         throw new Error('You must be authenticated')
// }

// export async function checkProgram(program: string): Promise<void> {
//     if (!program || program.length === 0) throw new Error('Program must be specified')
//     const config = await getConfigPromise()
//     if (!config.programs[program]) throw new Error(`Program not found: '${program}'`)
// }

// export function checkSuperUser(user: UserObj): void {
//     if (!user || !user.cognito.isAdmin) throw new Error('You must be a super administrator')
// }

// export function checkPermission(permission: WarehouseRoleEnum | null): void {
//     if (permission !== null && Object.values(WarehouseRoleEnum).indexOf(permission) < 0)
//         throw new Error(`Permission '${permission}' is not allowed`)
//     if (WarehouseRoleEnum.SuperUser === permission) throw new Error(`Permission '${permission}' is not assignable`)
// }

// export async function getUserPrograms(user: UserObj): Promise<{ [progname: string]: WarehouseRoleEnum }> {
//     const config = await getConfigPromise()
//     const progKeys = Object.keys(config.programs)
//     const usrProgKeys = Object.keys(user.dynamo ? user.dynamo.params : [])

//     const returnObj = progKeys.reduce((acc, pk) => ({ ...acc, [pk]: null }), {})
//     // Super users can do anything
//     if (user.cognito.isAdmin) {
//         progKeys.forEach((pk) => (returnObj[pk] = WarehouseRoleEnum.Admin))
//     }
//     // Othewrwise we assign the dynamo role
//     else if (user.cognito.username && usrProgKeys && usrProgKeys.length > 0) {
//         usrProgKeys.forEach((upk: string): void => {
//             returnObj[upk] = user.dynamo ? user.dynamo.params[upk] : []
//         })
//     }
//     return returnObj
// }

// export async function userCanObserve(user: UserObj, progMachineName: string): Promise<boolean> {
//     if (user.cognito.isAdmin) return true

//     // try the easy way first
//     const userProgs = await getUserPrograms(user)
//     if (
//         userProgs[progMachineName] &&
//         (userProgs[progMachineName] === WarehouseRoleEnum.Admin ||
//             userProgs[progMachineName] === WarehouseRoleEnum.Participant ||
//             userProgs[progMachineName] === WarehouseRoleEnum.Observer)
//     ) {
//         log.debug('userCanObserve', true)
//         return true
//     }

//     // Now go get the program XML and look for public access
//     log.debug('userCanObserve::Fetching XML', progMachineName)
//     const program = await fetchProgramXML(progMachineName)
//     log.debug('userCanObserve::PUBLIC', program.meta)
//     if (program && program.meta && program.meta.access && program.meta.access === AccessEnum.Public) return true
//     else {
//         log.debug('userCanObserve::PUBLIC', true)
//         return false
//     }
// }

// export async function userCanSeeProgram(user: UserObj, progMachineName: string): Promise<boolean> {
//     const program = await fetchProgramXML(progMachineName)
//     if (program.meta.access !== AccessEnum.Secret) return true
//     else if (user && (await userCanObserve(user, progMachineName))) return true
//     else return false
// }

// export async function userCanParticipate(user: UserObj, progMachineName: string): Promise<boolean> {
//     if (user.cognito.isAdmin) return true

//     const userProgs = await getUserPrograms(user)
//     if (!userProgs[progMachineName]) return false
//     return (
//         userProgs[progMachineName] === WarehouseRoleEnum.Admin ||
//         userProgs[progMachineName] === WarehouseRoleEnum.Participant
//     )
// }
// export async function userCanAdmin(user: UserObj, progMachineName: string): Promise<boolean> {
//     if (user.cognito.isAdmin) return true

//     const userProgs = await getUserPrograms(user)
//     if (!userProgs[progMachineName]) return false
//     return userProgs[progMachineName] === WarehouseRoleEnum.Admin
// }
// export function userisSuperUser(user: UserObj): boolean {
//     return user && user.cognito.isAdmin
// }

// export async function checkParticipate(user: UserObj, progMachineName: string): Promise<void> {
//     checkAuth(user)
//     await checkProgram(progMachineName)
//     if (!(await userCanParticipate(user, progMachineName))) {
//         throw new Error(`You must have participation privileges for the '${progMachineName}' program`)
//     }
// }
// export async function checkObserver(user: UserObj, program: string): Promise<void> {
//     checkAuth(user)
//     await checkProgram(program)
//     const canObserve = userCanObserve(user, program)
//     if (!canObserve) {
//         throw new Error(`You must have observer privileges for the '${program}' program`)
//     }
// }
// export async function checkAdmin(user: UserObj, program: string): Promise<void> {
//     checkAuth(user)
//     await checkProgram(program)
//     if (!(await userCanAdmin(user, program))) {
//         throw new Error(`You must have administration privileges for the '${program}' program`)
//     }
// }

// export async function getProgramRole(user: UserObj, program: string): Promise<WarehouseRoleEnum> {
//     log.info('getProgramRole', { program, user })
//     if (!user || !user.cognito.username) return null
//     else if (user.cognito.isAdmin) return WarehouseRoleEnum.SuperUser
//     else if (await userCanAdmin(user, program)) return WarehouseRoleEnum.Admin
//     else if (await userCanParticipate(user, program)) return WarehouseRoleEnum.Participant
//     else if (await userCanObserve(user, program)) return WarehouseRoleEnum.Observer
//     else return null
// }
