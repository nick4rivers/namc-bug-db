// import config from '../config'
import log from 'loglevel'
import * as pg from '.'

let pool = null
beforeAll(async () => {
    pool = pg.getPool()
})

describe('Series Tests', () => {
    test('geoRecord', async () => {
        const testcoord = [-114.18410166361783808, 43.33994947168406497]
        const testcoord3857 = [-12813578.6, 5847585.51]
        // const preAuthStr = JSON.parse(output.preAuth)
        const result = await pg.getRecord(pool, 55001200067802)
        const geoResult = await pg.getGeoRecord(pool, testcoord)
        const geoResultEPSG = await pg.getGeoRecordEPSG(pool, testcoord3857, 3857)
        // expect(preAuthStr).toHaveProperty('url')
        log.info('done')
    })
})
