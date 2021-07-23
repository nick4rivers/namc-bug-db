// import config from '../config'
import log from 'loglevel'
import { getPool, queries as q } from './'

let pool = null
beforeAll(async () => {
    pool = getPool()
})

describe('Series Tests', () => {
    test('geoRecord', async () => {
        // const testcoord = [-114.18410166361783808, 43.33994947168406497]
        // const testcoord3857 = [-12813578.6, 5847585.51]
        // const preAuthStr = JSON.parse(output.preAuth)
        // const result = await q.getRecord(pool, 55001200067802)
        // const geoResult = await q.getGeoRecord(pool, testcoord)
        // const geoResultEPSG = await q.getGeoRecordEPSG(pool, testcoord3857, 3857)
        // expect(preAuthStr).toHaveProperty('url')
        log.info('done')
    })
})
