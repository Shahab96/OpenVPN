import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';

export class OpenVpnStack extends cdk.Stack {
  public readonly instance: ec2.Instance;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'OpenVPNVpc', {
      maxAzs: 2,
      natGateways: 1,
    });

    const machineImage = new ec2.AmazonLinuxImage();
    const instanceType = ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3_AMD, ec2.InstanceSize.NANO);
    const keyName = 'OpenVPNKeyPair';
    const securityGroup = new ec2.SecurityGroup(this, 'OpenVPNSecurityGroup', {
      vpc,
    });

    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.udp(1189));
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22));

    this.instance = new ec2.Instance(this, 'OpenVPNInstance', {
      vpc,
      machineImage,
      instanceType,
      keyName,
      securityGroup,
    });
  }
}
