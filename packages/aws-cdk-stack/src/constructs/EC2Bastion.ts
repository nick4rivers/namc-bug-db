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
            securityGroupName: `${stackProps.stackPrefix}_BastionIngress`
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

        // TODO: This is how we add users
        // this.ec2Instance.instance.addUserData(
        //     'sudo yum update -y',
        //     'sudo yum install -y jq',
        //     `echo -e $(aws secretsmanager get-secret-value --secret-id bastion-secret --region ${this.region} | jq -r .SecretString | jq -r .key) > /home/ec2-user/.ssh/id_rsa`,
        //     'chown ec2-user:ec2-user /home/ec2-user/.ssh/id_rsa',
        //     'chmod 400 /home/ec2-user/.ssh/id_rsa'
        // )

        // Allow port 22 and ssh connect
        this.ec2Instance.instance.instance.addPropertyOverride('KeyName', awsConfig.SSHKeyName)
        // Allow ingress from anywhere on port 22
        this.ec2Instance.allowSshAccessFrom(ec2.Peer.anyIpv4())
        // Allow egress to anywhere on the internal network on postgres port
        ingressSG.connections.allowTo(ec2.Peer.ipv4(props.vpc.vpcCidrBlock), ec2.Port.tcp(5432))

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
