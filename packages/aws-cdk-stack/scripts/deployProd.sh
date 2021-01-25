#!/bin/bash

lerna run --no-bail --stream --parallel build
lerna run --no-bail --stream --parallel package
dotenv -e ../../.env.production cdk deploy "RSWarehouse-*"