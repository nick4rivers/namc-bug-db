// import log from 'loglevel'
import { util, types as t } from '@namcbugdb/common'
import { UserObj, DBReturnType } from '../types'
import { maxQueryIds } from '../config'
import { isInteger, isNumber } from 'lodash'
/**
 * The structure must match what's in the `schema.graphql` file
 */

export function loggedInGate(user: UserObj): void {
    const err = new Error('You must be authenticated to perform this query.')
    try {
        if (!user.cognito.isLoggedIn || !user.cognito.sub || user.cognito.sub.length < 10) throw err
    } catch {
        throw new Error('You are not authorized to perform this query.')
    }
}
export function limitOffsetCheck(limit: number, limitMax: number, offset: number): void {
    if (!limit) throw new Error('You must provide a limit for this query')
    if (limit < 0) throw new Error('limit must be a valid positive integer')
    if (limit > limitMax) throw new Error(`limit for this query has a maximum value of ${limitMax}`)
    if (!(offset >= 0)) throw new Error('Offset must be a positive integer')
}

export function createPagination<T>(data: DBReturnType, limit?: number, offset?: number): t.PaginatedRecords<T> {
    let nextOffset = null
    try {
        nextOffset = data && data.length === limit ? offset + limit : null
    } catch {}

    return {
        records: data.map((record) => util.snake2camel(record) as unknown) as [T],
        nextOffset
    }
}

/**
 * Some queries take an array of ids. We need to check that all the values are valid
 * @param name
 * @param idArr
 */
function checkIDArray(name: string, idArr: number[]): void {
    if (!Array.isArray(idArr)) throw new Error(`Parameter ${name} must be an array of ids.`)
    else if (idArr.length === 0)
        throw new Error(`Parameter '${name}' cannot be an empty array. Expecting between 1 and ${maxQueryIds} values`)
    else if (idArr.length > maxQueryIds)
        throw new Error(`Parameter '${name}' cannot have more than ${maxQueryIds} items. Found: ${idArr.length}`)

    // Make sure every input id is a positive integer
    const badVals = idArr.filter((id) => !isInteger(id) || id < 0)
    if (badVals.length > 0)
        throw new Error(
            `Parameter '${name} must be an array of postive integers. Found the following bad values: ${badVals.join(
                ', '
            )}`
        )
}

/**
 * Basic checking on geoJSON parameters
 * @param jsonString
 */
function checkGeoJSON(jsonString: string): void {
    if (jsonString.length === 0) throw new Error(`Cannot pass an empty string to parameter 'polygon'`)
    try {
        JSON.parse(jsonString)
    } catch (e) {
        throw new Error(`Could not parse GeoJSON from parameter 'polygon'`)
    }
}

/**
 * Checks to make sure our pointDistance object is valid
 * @param pointDistance
 */
function checkPointDistance(pointDistance: t.QueryDistance): void {
    const errs = []
    if (!isNumber(pointDistance.latitude)) errs.push('You must provide a latitude with pointDistance')
    else if (pointDistance.latitude > 90 || pointDistance.latitude < -90)
        errs.push(`pointDistance.latitude must be a valid number from -90 to 90. Got: ${pointDistance.latitude}`)

    if (!isNumber(pointDistance.longitude)) errs.push('You must provide a longitude with pointDistance')
    else if (!pointDistance.distance) errs.push('You must provide a distance with pointDistance')

    if (!isNumber(pointDistance.distance)) errs.push('You must provide a distance with pointDistance')
    else if (pointDistance.distance < 0)
        errs.push(`pointDistance.distance must be a positive number. Got: ${pointDistance.distance}`)

    if (errs.length === 0) return
    else {
        throw new Error(`Found the following problems with the 'pointDistance' parameter: ${errs.join(', ')}`)
    }
}

const ID_ARRAYS = ['sampleIds', 'boxIds', 'projectIds', 'entityIds', 'siteIds']
/**
 * In cases where you can only use one arg it makes sense to check
 * @param args
 * @param requireOne
 * @returns
 */
export function checkExclusiveFilter(args: Partial<t.QueryFilter>, requireOne = false): void {
    const validArgKeys = Object.keys(args).filter((ok) => typeof args[ok] !== 'undefined')

    // No Args. Nothing to do
    if (validArgKeys.length === 0) {
        if (!requireOne) return
        else throw new Error(`You must provide one of the following arguments: ${Object.keys(args).join(', ')}`)
    }

    // Only one kind of filter will be valid
    if (validArgKeys.length > 1) {
        throw new Error(
            `You can only specify one of the filter arguments: ${Object.keys(args).join(', ')}. Found: ${Object.keys(
                validArgKeys
            ).join(', ')}`
        )
    }
    validArgKeys.filter((ak) => ID_ARRAYS.indexOf(ak) > -1).forEach((ak) => checkIDArray)

    if (args.polygon) checkGeoJSON(args.polygon)
    if (args.pointDistance) checkPointDistance(args.pointDistance)
}
