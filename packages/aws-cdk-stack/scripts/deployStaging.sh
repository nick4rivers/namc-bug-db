#!/bin/bash
ORIG_PWD=$(pwd)
# lerna run --no-bail --stream --parallel build
# lerna run --no-bail --stream --parallel package

cd $ORIG_PWD
dotenv -e ../../.env.staging cdk deploy NAMC-BugDB-VPCStack NAMC-BugDB-Stack-staging
# Destroy command
# dotenv -e ../../.env.staging yarn cdk destroy