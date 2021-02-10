// import programSecret from '../../../.programs/'
import * as cdk from '@aws-cdk/core'
import * as ssm from '@aws-cdk/aws-ssm'
import * as ec2 from '@aws-cdk/aws-ec2'
import { addTagsToResource } from './tags'
import { SSMParameter } from '../types'
import { stageTags } from '../config'

export interface SSMParametersProps {
    vpc: ec2.IVpc
}

/**
 * We store all the connective tissue for the stack in an SSM Parameter
 * This is mainly so that we don't have to pass bucket names as environment variables
 */
class SSMParameters extends cdk.Construct {
    readonly parameterName: string
    readonly value: object
    readonly param: ssm.StringParameter
    constructor(scope: cdk.Construct, id: string, name: string, ssmValue: SSMParameter, props: SSMParametersProps) {
        super(scope, id)

        this.parameterName = name
        this.value = ssmValue
        this.param = new ssm.StringParameter(this, `Config_${ssmValue.stage}`, {
            parameterName: this.parameterName,
            description: 'Configuration object',
            type: ssm.ParameterType.STRING,
            stringValue: JSON.stringify(ssmValue)
        })
        addTagsToResource(this.param, stageTags)
    }
}

export default SSMParameters
