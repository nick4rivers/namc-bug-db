import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import NAMCBUgDbStack from '../NAMCBUgDbStack'
import { awsConfig } from '../config'

test('Empty Stack', () => {
    const app = new cdk.App()
    // WHEN
    const stack = new NAMCBUgDbStack(app, 'My NAMCBUgDbStack', awsConfig.stage)
    // THEN
    expectCDK(stack).to(
        matchTemplate(
            {
                Resources: {}
            },
            MatchStyle.EXACT
        )
    )
})
