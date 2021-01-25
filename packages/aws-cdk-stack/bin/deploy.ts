#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import NAMCBUgDbStack from '../src/NAMCBUgDbStack'
import { stackProps, awsConfig } from '../src/config'
import log from 'loglevel'
log.enableAll()

log.info('Deploying NAMC Bug DB App stage: ', stackProps.stage)

/**
 * This is the deployment script
 */
const app = new cdk.App()

const newStack = new NAMCBUgDbStack(app, `NAMC-BugDB-Stack-${stackProps.stage}`, {
    env: awsConfig
})

log.info('Done!')
