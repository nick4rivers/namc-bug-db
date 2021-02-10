#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import BugDbStack from '../src/BugDbStack'
import VPCStack from '../src/VPCStack'
import { stackProps, awsConfig } from '../src/config'
import log from 'loglevel'
log.enableAll()

log.info('Deploying NAMC Bug DB App stage: ', stackProps.stage)

/**
 * This is the deployment script
 */
const app = new cdk.App()

const vpcStack = new VPCStack(app, `NAMC-BugDB-VPCStack`, {
    env: awsConfig
})

const newStack = new BugDbStack(
    app,
    `NAMC-BugDB-Stack-${stackProps.stage}`,
    {
        env: awsConfig
    },
    vpcStack
)

log.info('Done!')
