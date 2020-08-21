#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import NAMCBUgDbStack from './NAMCBUgDbStack'
import { awsConfig } from './config'
import log from 'loglevel'
log.enableAll()

log.info('Deploying stage: ', awsConfig.stage)

/**
 * This is the deployment script
 */
const app = new cdk.App()

const newStack = new NAMCBUgDbStack(app, `NAMCBUgDbStack-${awsConfig.stage}`, awsConfig.stage, {
    env: awsConfig.cdkEnv
})
