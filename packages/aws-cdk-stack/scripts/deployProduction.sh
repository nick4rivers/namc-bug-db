#!/bin/bash
ORIG_PWD=$(pwd)
# lerna run --no-bail --stream --parallel build
lerna run --no-bail --stream --parallel package

cd $ORIG_PWD
dotenv -e ../../.env.production cdk deploy NAMC-BugDB-Stack-production
# Destroy command
# dotenv -e ../../.env.staging yarn cdk destroy