#!/usr/bin/env node

const cdk = require('aws-cdk-lib/core');
const { ServerlessHelloApiStack } = require('../lib/serverless-hello-api-stack');

const app = new cdk.App();
new ServerlessHelloApiStack(app, 'ServerlessHelloApiStack', {
env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
