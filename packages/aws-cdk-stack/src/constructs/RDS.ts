/* eslint-disable @typescript-eslint/camelcase */
import * as cdk from '@aws-cdk/core'
import * as rds from '@aws-cdk/aws-rds'
import * as secretsmanager from '@aws-cdk/aws-secretsmanager'
import * as ec2 from '@aws-cdk/aws-ec2'
// import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs'
import { globalTags, stackProps } from '../config'
import { addTagsToResource } from './tags'

export interface RDSPostgresDBProps {
    dbName: string
    dbUserName: string
    secretName: string
    vpc: ec2.IVpc
}

// DOCS: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-rds-dbcluster.html#cfn-rds-dbcluster-engine
// from running: aws rds describe-db-engine-versions --engine aurora-postgresql --query "DBEngineVersions[].EngineVersion"
// const EngineVersion = '5.6.10a'
// const ParameterGroupFamily = 'aurora-postgresql10'
const ScalingMaxCapacity = 4
const ScalingMinCapacity = 2
const ScalingSecondsUtilAutoPause = 900 // 15min

// https://github.com/ysku/aurora-serverless-example/blob/master/lib/config.ts
class RDSPostgresDB extends cdk.Construct {
    public readonly dbAccessSG: ec2.SecurityGroup
    public readonly dbSGId: string
    public readonly dbClusterArn: string
    public readonly secret: secretsmanager.Secret
    public readonly endpointUrl: string
    public readonly endpointPort: string

    constructor(scope: cdk.Construct, id: string, props: RDSPostgresDBProps) {
        super(scope, id)

        const vpc = props.vpc

        // // Allow psql connect from anywhere inside this VPC
        // // https://github.com/aws/aws-cdk/issues/929
        // this.dbSG = new ec2.SecurityGroup(this, `DBSG_${stackProps.stage}`, {
        //     vpc: vpc,
        //     allowAllOutbound: true,
        //     description: `Security group for ${stackProps.stackPrefix} database (${stackProps.stage})`,
        //     securityGroupName: `${stackProps.stackPrefix}Database ${stackProps.stage}`
        // })
        // addTagsToResource(this.dbSG, globalTags)
        // // TODO: This should be looked up
        // this.dbSG.addIngressRule(ec2.Peer.ipv4('172.31.0.0/16'), ec2.Port.tcp(5432), 'allow psql through')

        this.dbAccessSG = new ec2.SecurityGroup(this, 'rds-security-group', {
            vpc: props.vpc,
            allowAllOutbound: false,
            description: `Access control for ${stackProps.stackPrefix} database (${stackProps.stage})`,
            securityGroupName: `${stackProps.stackPrefix}_RDSSecurityGroup`
        })

        // This is the security group that allows access TO the DB
        const inboundDbAccessSecurityGroup = new ec2.SecurityGroup(this, 'ingress-security-group', {
            vpc: props.vpc,
            allowAllOutbound: false,
            description: `Ingress control for ${stackProps.stackPrefix} database (${stackProps.stage})`,
            securityGroupName: `${stackProps.stackPrefix}_IngressSecurityGroup`
        })
        this.dbAccessSG.addEgressRule(inboundDbAccessSecurityGroup, ec2.Port.tcp(5432))
        inboundDbAccessSecurityGroup.addIngressRule(this.dbAccessSG, ec2.Port.tcp(5432))

        const subnetGroup = new rds.CfnDBSubnetGroup(this, `SubnetGroup_${stackProps.stage}`, {
            dbSubnetGroupDescription: `CloudFormation managed DB subnet group for ${stackProps.stackPrefix}Database ${stackProps.stage}`,
            subnetIds: vpc.publicSubnets.map((sub) => sub.subnetId)
        })
        addTagsToResource(subnetGroup, globalTags)

        // use secret manager to configure database username and password
        // cf. https://docs.aws.amazon.com/ja_jp/secretsmanager/latest/userguide/intro.html
        this.secret = new secretsmanager.Secret(this, `DBSecret_${stackProps.stage}`, {
            secretName: props.secretName,
            description: 'RDS database auto-generated user password',
            generateSecretString: {
                excludeCharacters: '"@/',
                generateStringKey: 'password',
                passwordLength: 32,
                secretStringTemplate: `{"username": "${props.dbUserName}"}`
            }
        })
        addTagsToResource(this.secret, globalTags)

        const db = new rds.CfnDBCluster(this, `RDS_${stackProps.stage}`, {
            // cannot use upper case characters.
            databaseName: props.dbName,
            dbClusterIdentifier: `namc-bugdb-${stackProps.stage}`,
            // See above
            // dbClusterParameterGroupName: parameterGroup.ref,
            dbSubnetGroupName: subnetGroup.ref,
            // Days of backups we want to keep
            backupRetentionPeriod: stackProps.isDev ? 1 : 30,
            engine: 'aurora-postgresql',
            engineMode: 'serverless',
            // 5.7.mysql_aurora.2.03.2 didn't work
            // RDS The engine mode serverless you requested is currently unavailable.
            // engineVersion: EngineVersion,
            // need to build following format
            // {{resolve:secretsmanager:secret-id:secret-string:json-key:version-stage:version-id}}
            // cf. https://docs.aws.amazon.com/ja_jp/AWSCloudFormation/latest/UserGuide/dynamic-references.html
            masterUsername: cdk.Fn.join('', [
                '{{resolve:secretsmanager:',
                this.secret.secretArn,
                ':SecretString:username}}'
            ]),
            masterUserPassword: cdk.Fn.join('', [
                '{{resolve:secretsmanager:',
                this.secret.secretArn,
                ':SecretString:password}}'
            ]),
            // TODO: Different Configurations between STAGING and PRODUCTION
            scalingConfiguration: {
                autoPause: true,
                maxCapacity: ScalingMaxCapacity,
                minCapacity: ScalingMinCapacity,
                secondsUntilAutoPause: ScalingSecondsUtilAutoPause
            },
            vpcSecurityGroupIds: [inboundDbAccessSecurityGroup.securityGroupId]
        })
        addTagsToResource(db, globalTags)
        this.endpointUrl = db.attrEndpointAddress
        this.endpointPort = db.attrEndpointPort
        this.dbClusterArn = cdk.Stack.of(this).formatArn({
            service: 'rds',
            resource: 'cluster',
            sep: ':',
            // NOTE: resourceName should be lower case for RDS
            // however arn is evaluated in case sensitive.
            resourceName: (db.dbClusterIdentifier || '').toString().toLowerCase()
        })
    }
}

export default RDSPostgresDB
