import * as cdk from '@aws-cdk/core'
import { AWSTagsDef } from '../types'

/**
 * Apply every tag in a dictionary to
 * @param scope
 * @param tags
 */
export const addTagsToResource = (scope: cdk.Construct, tags: AWSTagsDef): void => {
    Object.keys(tags).forEach((tkey) => {
        cdk.Tag.add(scope, tkey, tags[tkey])
    })
}
