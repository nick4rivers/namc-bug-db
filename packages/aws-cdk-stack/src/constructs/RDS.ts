/* eslint-disable @typescript-eslint/camelcase */
import * as cdk from '@aws-cdk/core'
import * as rds from '@aws-cdk/aws-rds'
import * as secretsmanager from '@aws-cdk/aws-secretsmanager'
import * as ec2 from '@aws-cdk/aws-ec2'
// import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs'
import { globalTags, stackProps } from '../config'
import { addTagsToResource } from './tags'

export interface RDSPostgresDBProps {
    vpc: ec2.IVpc
    bastion: ec2.IInstance
}

const DbName = 'bugdb' // default
const DbUserName = 'bugdb_root' // default
// DOCS: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-rds-dbcluster.html#cfn-rds-dbcluster-engine
// from running: aws rds describe-db-engine-versions --engine aurora-postgresql --query "DBEngineVersions[].EngineVersion"
// const EngineVersion = '5.6.10a'
// const ParameterGroupFamily = 'aurora-postgresql10'
const ScalingMaxCapacity = 4
const ScalingMinCapacity = 2
const ScalingSecondsUtilAutoPause = 900 // 15min

// https://github.com/ysku/aurora-serverless-example/blob/master/lib/config.ts
class RDSPostgresDB extends cdk.Construct {
    public readonly dbSG: ec2.SecurityGroup
    public readonly dbSGId: string
    public readonly dbClusterArn: string
    public readonly secret: secretsmanager.Secret

    constructor(scope: cdk.Construct, id: string, props: RDSPostgresDBProps) {
        super(scope, id)

        const vpc = props.vpc

        // Allow psql connect from anywhere inside this VPC
        // https://github.com/aws/aws-cdk/issues/929

        this.dbSG = new ec2.SecurityGroup(this, `DBSG_${stackProps.stage}`, {
            vpc: vpc,
            allowAllOutbound: true,
            description: `Security group for ${stackProps.stackPrefix} database (${stackProps.stage})`,
            securityGroupName: `${stackProps.stackPrefix}Database ${stackProps.stage}`
        })
        addTagsToResource(this.dbSG, globalTags)
        // TODO: This should be looked up
        this.dbSG.addIngressRule(ec2.Peer.ipv4('172.31.0.0/16'), ec2.Port.tcp(5432), 'allow psql through')

        const subnetGroup = new rds.CfnDBSubnetGroup(this, `SubnetGroup_${stackProps.stage}`, {
            dbSubnetGroupDescription: `CloudFormation managed DB subnet group for ${stackProps.stackPrefix}Database ${stackProps.stage}`,
            subnetIds: vpc.publicSubnets.map((sub) => sub.subnetId)
        })
        addTagsToResource(subnetGroup, globalTags)

        // use secret manager to configure database username and password
        // cf. https://docs.aws.amazon.com/ja_jp/secretsmanager/latest/userguide/intro.html
        this.secret = new secretsmanager.Secret(this, `DBSecret_${stackProps.stage}`, {
            secretName: `${stackProps.stackPrefix}Secret_${stackProps.stage}`,
            description: 'RDS database auto-generated user password',
            generateSecretString: {
                excludeCharacters: '"@/',
                generateStringKey: 'password',
                passwordLength: 32,
                secretStringTemplate: `{"username": "${DbUserName}"}`
            }
        })
        addTagsToResource(this.secret, globalTags)

        // TODO: We'll stick with the default for now. Bring this back if you need extra configuration
        // const parameterGroup = new rds.CfnDBClusterParameterGroup(this, `RDSParameterGroup_${stackProps.stage}`, {
        //     description: `${stackProps.stackPrefix} parameter group for ${DbName}`,
        //     family: ParameterGroupFamily,
        //     parameters: {
        //         character_set_client: 'utf8mb4',
        //         character_set_connection: 'utf8mb4',
        //         character_set_database: 'utf8mb4',
        //         character_set_results: 'utf8mb4',
        //         character_set_server: 'utf8mb4'
        //     }
        // })
        // addTagsToResource(parameterGroup, globalTags)

        const db = new rds.CfnDBCluster(this, `RDS_${stackProps.stage}`, {
            // cannot use upper case characters.
            databaseName: DbName,
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
            vpcSecurityGroupIds: [this.dbSG.securityGroupId]
        })
        addTagsToResource(db, globalTags)

        // this.dbClusterArn = this.formatArn({
        //   service: 'rds',
        //   resource: 'cluster',
        //   sep: ':',
        //   // NOTE: resourceName should be lower case for RDS
        //   // however arn is evaluated in case sensitive.
        //   resourceName: (db.dbClusterIdentifier || '').toString().toLowerCase()
        // });
        // }
        // addTagsToResource(this.userPool, globalTags)
    }
}

export default RDSPostgresDB
