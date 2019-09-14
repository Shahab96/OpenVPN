import * as cdk from '@aws-cdk/core';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipelineActions from '@aws-cdk/aws-codepipeline-actions';
import * as cicd from '@aws-cdk/app-delivery';
import { OpenVpnStack } from './open_vpn-stack';
import { OpenVpnDNS } from './open_vpn-dns';

export class OpenVpnCode extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const oauthToken = cdk.SecretValue.secretsManager('arn:aws:secretsmanager:us-east-1:780350716816:secret:GitHubKey-chdFGT', {
      jsonField: 'GitHubKey',
    });

    const sourceArtifact = new codepipeline.Artifact();

    const sourceAction = new codepipelineActions.GitHubSourceAction({
      actionName: 'Commit',
      owner: 'Shahab96',
      repo: 'OpenVPN',
      output: sourceArtifact,
      oauthToken,
    });

    const buildSpec = codebuild.BuildSpec.fromObject({
      version: '0.2',
      env: {
        variables: {
          CDK_DEFAULT_ACCOUNT: process.env.CDK_DEFAULT_ACCOUNT,
          CDK_DEFAULT_REGION: process.env.CDK_DEFAULT_REGION,
        },
      },
      phases: {
        install: {
          commands: 'npm ci',
        },
        build: {
          commands: [,
            'npm run build',
            'npm run cdk synth -- -o dist',
          ],
        },
      },
      artifacts: {
        'base-directory': 'dist',
        files: '**/*',
      },
    });

    const project = new codebuild.PipelineProject(this, 'OpenVPNPipelineProject', {
      environment: {
        buildImage: codebuild.LinuxBuildImage.UBUNTU_14_04_NODEJS_10_14_1,
      },
      buildSpec,
    });

    const buildArtifact = new codepipeline.Artifact();
    const build = new codepipelineActions.CodeBuildAction({
      actionName: 'Bootstrap',
      input: sourceArtifact,
      project,
      outputs: [buildArtifact],
    });

    const selfUpdate = new cicd.PipelineDeployStackAction({
      stack: this,
      input: buildArtifact,
      adminPermissions: true,
    });

    const serverStack = new OpenVpnStack(scope, 'OpenVPNStack', {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
      },
    });

    const deployInstance = new cicd.PipelineDeployStackAction({
      stack: serverStack,
      input: buildArtifact,
      adminPermissions: true,
    });

    const dnsStack = new OpenVpnDNS(this, 'OpenVPNDNSStack', {
      instance: serverStack.instance,
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
      },
    });

    const deployDNSUpdate = new cicd.PipelineDeployStackAction({
      stack: dnsStack,
      input: buildArtifact,
      adminPermissions: true,
    });

    new codepipeline.Pipeline(this, 'OpenVPNPipeline', {
      pipelineName: 'OpenVPN',
      stages: [{
        stageName: 'Source',
        actions: [sourceAction],
      }, {
        stageName: 'Build',
        actions: [build],
      }, {
        stageName: 'SelfUpdate',
        actions: [selfUpdate],
      }, {
        stageName: 'InstanceDeploy',
        actions: [deployInstance],
      }, {
        stageName: 'DNSDeploy',
        actions: [deployDNSUpdate],
      }],
    });
  }
}
