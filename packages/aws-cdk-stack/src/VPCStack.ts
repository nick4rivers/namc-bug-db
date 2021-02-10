import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as cognito from '@aws-cdk/aws-cognito'
import EC2Bastion from './constructs/EC2Bastion'
import { addTagsToResource } from './constructs/tags'
import { CognitoUserPool } from './constructs/Cognito'
import { globalTags } from './config'

class VPCStack extends cdk.Stack {
    readonly vpc: ec2.Vpc
    readonly endpointsSG: ec2.SecurityGroup
    readonly egressSecurityGroup: ec2.SecurityGroup
    readonly userPool: cognito.IUserPool
    readonly vpcEndpointSSM: ec2.IInterfaceVpcEndpoint
    readonly vpcEndpointSecretsManager: ec2.IInterfaceVpcEndpoint
    readonly bastionIp: string

    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        this.vpc = new ec2.Vpc(this, 'NAMC-BugDB-VPCStack', {
            cidr: '10.0.0.0/16',
            maxAzs: 2,
            subnetConfiguration: [
                {
                    cidrMask: 26,
                    name: 'publicSubnet',
                    subnetType: ec2.SubnetType.PUBLIC
                },
                {
                    cidrMask: 26,
                    name: 'isolatedSubnet',
                    subnetType: ec2.SubnetType.ISOLATED
                }
                // {
                //     cidrMask: 26,
                //     name: 'privateSubnet',
                //     subnetType: ec2.SubnetType.PRIVATE
                // }
            ],
            natGateways: 0
        })
        addTagsToResource(this.vpc, globalTags)

        // Both staging and production use a common user pool
        // They do use separate web clients though.
        const cognito = new CognitoUserPool(this, `NAMC-Cognito`)
        this.userPool = cognito.userPool

        this.endpointsSG = new ec2.SecurityGroup(this, 'ingress-security-group', {
            vpc: this.vpc,
            allowAllOutbound: false,
            securityGroupName: 'IngressSecurityGroup'
        })

        // EC2 Bastion box to access the rest of our services from:
        const bastionBox = new EC2Bastion(this, `NAMC-EC2Bastion`, {
            vpc: this.vpc
        })
        this.bastionIp = bastionBox.elasticIp

        // WE need these endpoints so that lambda behind a private subnet can access SSM and secrets manager
        this.vpcEndpointSSM = new ec2.InterfaceVpcEndpoint(this, `SSMVpcEndpoint`, {
            service: ec2.InterfaceVpcEndpointAwsService.SSM,
            vpc: this.vpc,
            subnets: { subnetType: ec2.SubnetType.ISOLATED },
            securityGroups: [this.endpointsSG],
            open: true,
            privateDnsEnabled: true
        })

        this.vpcEndpointSecretsManager = new ec2.InterfaceVpcEndpoint(this, `SECRETS_MANAGERVpcEndpoint`, {
            service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
            vpc: this.vpc,
            securityGroups: [this.endpointsSG],
            subnets: { subnetType: ec2.SubnetType.ISOLATED },
            open: true,
            privateDnsEnabled: true
        })

        // this.endpointsSG.connections.allowInternally(ec2.Port.allTraffic())
        // Anything in this VPC can access the endpoints. Reasoning: SSM and Secrets_manager are
        // already accessible on the internet so there's no need to lock it down. We just need to provide
        // access.
        this.endpointsSG.connections.allowFrom(ec2.Peer.ipv4(this.vpc.vpcCidrBlock), ec2.Port.tcp(443))
    }
}

export default VPCStack
