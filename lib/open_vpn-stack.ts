import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as route53 from "@aws-cdk/aws-route53";

export class OpenVpnStack extends cdk.Stack {
  public readonly instance: ec2.Instance;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", {
      maxAzs: 1,
    });

    const machineImage = new ec2.GenericLinuxImage({
      "ap-northeast-1": "ami-0b8612cffd3478ccb",
    });
    const instanceType = ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3_AMD, ec2.InstanceSize.MICRO);
    const keyName = "OpenVPNKeyPair";
    const securityGroup = new ec2.SecurityGroup(this, "SecurityGroup", {
      vpc,
    });

    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.udp(1194));
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22));

    this.instance = new ec2.Instance(this, "Instance", {
      vpc,
      machineImage,
      instanceType,
      keyName,
      securityGroup,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });

    new route53.ARecord(this, "RecordSet", {
      recordName: "vpn.shahab96.com",
      zone: route53.PublicHostedZone.fromHostedZoneAttributes(this, "HostedZone", {
        hostedZoneId: "Z2GCKEQH874TQR",
        zoneName: "shahab96.com",
      }),
      target: {
        values: [
          this.instance.instancePublicIp,
        ],
      },
      ttl: cdk.Duration.seconds(60),
    });
  }
}
