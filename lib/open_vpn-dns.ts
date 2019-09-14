import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as route53 from '@aws-cdk/aws-route53';

interface DNSProps extends cdk.StackProps {
    instance: ec2.Instance;
}

export class OpenVpnDNS extends cdk.Stack {
  public readonly dnsRecord: route53.ARecord;

  constructor(scope: cdk.Construct, id: string, props: DNSProps) {
    super(scope, id, props);

    const zone = route53.HostedZone.fromLookup(this, 'OpenVPNDNSHostedZone', {
        domainName: 'shahab96.com',
        privateZone: false,
    });

    const recordName = 'vpn.shahab96.com';
    const target = route53.RecordTarget.fromIpAddresses(props.instance.instancePublicIp);

    this.dnsRecord = new route53.ARecord(this, 'OpenVPNDNSARecord', {
        recordName,
        target,
        zone,
    });
  }
}
