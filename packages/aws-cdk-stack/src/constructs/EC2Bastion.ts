import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
// import * as s3 from '@aws-cdk/aws-s3'
// import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs'
import { stageTags, awsConfig, stackProps } from '../config'
import { addTagsToResource } from './tags'

export interface EC2BastionProps {
    vpc: ec2.IVpc
    // dbIngressSg: ec2.ISecurityGroup
}

// https://github.com/martinbpeters/cdk-vpc-postgres/blob/master/stacks/vpc.py
class EC2Bastion extends cdk.Construct {
    readonly ec2Instance: ec2.BastionHostLinux
    // readonly ingressSG: ec2.ISecurityGroup
    readonly elasticIp: string
    constructor(scope: cdk.Construct, id: string, props: EC2BastionProps) {
        super(scope, id)

        const ingressSG = new ec2.SecurityGroup(this, 'rds-security-group', {
            vpc: props.vpc,
            allowAllOutbound: false,
            description: `Bastion ingress access on SSH`,
            securityGroupName: `${stackProps.stackPrefix}_RDSSecurityGroup`
        })

        this.ec2Instance = new ec2.BastionHostLinux(this, `EC2Bastion_${stackProps.stage}`, {
            vpc: props.vpc,
            // This instance should be tiny. Smallest possible and we will keep it off most of the time
            // Note: Nano seems to die on aws sync ops so upgrade to Micro
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.NANO),
            machineImage: new ec2.AmazonLinuxImage({
                generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
            }),
            securityGroup: ingressSG,
            subnetSelection: { subnetType: ec2.SubnetType.PUBLIC },
            instanceName: `${stackProps.stackPrefix}Bastion_${stackProps.stage}`
        })
        addTagsToResource(this.ec2Instance, stageTags)

        // props.dbIngressSg.connections

        // Allow port 22 and ssh connect
        this.ec2Instance.instance.instance.addPropertyOverride('KeyName', awsConfig.SSHKeyName)
        this.ec2Instance.allowSshAccessFrom(ec2.Peer.anyIpv4())

        // Now we assign an elastic IP to this so the IP doesn't change ever
        const eip = new ec2.CfnEIP(this, `EC2BastionIP_${stackProps.stage}`, {})
        addTagsToResource(eip, stageTags)

        new ec2.CfnEIPAssociation(this, `EC2BastionIPAssoc_${stackProps.stage}`, {
            eip: eip.ref,
            instanceId: this.ec2Instance.instanceId
        })
        this.elasticIp = eip.domain as string
    }
}

export default EC2Bastion
