#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { OpenVpnStack } from '../lib/open_vpn-stack';
import { OpenVpnDNS } from '../lib/open_vpn-dns';

const app = new cdk.App();
const env = {
  region: 'us-east-1',
};
const { instance } = new OpenVpnStack(app, 'OpenVPN', {
  env,
});
new OpenVpnDNS(app, 'OpenVPNDNS', {
  instance,
  env,
});
