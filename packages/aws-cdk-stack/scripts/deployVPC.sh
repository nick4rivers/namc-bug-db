#!/bin/bash
dotenv -e ../../.env.staging cdk deploy NAMC-BugDB-VPCStack
# dotenv -e ../../.env.staging yarn cdk destroy