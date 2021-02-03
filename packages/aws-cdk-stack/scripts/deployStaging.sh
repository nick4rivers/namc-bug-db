#!/bin/bash
ORIG_PWD=$(pwd)
lerna run --no-bail --stream --parallel build
lerna run --no-bail --stream --parallel package

cd $ORIG_PWD
dotenv -e ../../.env.staging cdk deploy
# Destroy command
# dotenv -e ../../.env.staging yarn cdk destroy