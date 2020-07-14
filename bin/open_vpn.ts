#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { OpenVpnStack } from '../lib/open_vpn-stack';

const app = new cdk.App();
const env = {
  region: "ap-northeast-1",
};
new OpenVpnStack(app, 'OpenVPN', {
  env,
});
