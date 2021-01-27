// import programSecret from '../../../.programs/'
import * as cdk from '@aws-cdk/core'
import * as ssm from '@aws-cdk/aws-ssm'
import { addTagsToResource } from './tags'
import { SSMParameter } from '../types'
import { globalTags } from '../config'

/**
 * We store all the connective tissue for the stack in an SSM Parameter
 * This is mainly so that we don't have to pass bucket names as environment variables
 */
class SSMParameters extends cdk.Construct {
    readonly parameterName: string
    readonly value: object
    readonly param: ssm.StringParameter
    constructor(scope: cdk.Construct, id: string, name: string, props: SSMParameter) {
        super(scope, id)

        this.parameterName = name
        this.value = props
        this.param = new ssm.StringParameter(this, `Config_${props.stage}`, {
            parameterName: this.parameterName,
            description: 'Configuration object',
            type: ssm.ParameterType.STRING,
            stringValue: JSON.stringify(props)
        })
        addTagsToResource(this.param, globalTags)
    }
}

export default SSMParameters
