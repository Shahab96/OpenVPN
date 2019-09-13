#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { OpenVpnCode } from '../lib/open_vpn-code';

const app = new cdk.App();
new OpenVpnCode(app, 'OpenVPNCodeStack');
