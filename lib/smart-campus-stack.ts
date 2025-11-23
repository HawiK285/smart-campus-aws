import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';

export class SmartCampusStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1) S3 bucket for all raw data
    const bucket = new s3.Bucket(this, 'RawEventBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,  // demo only
      autoDeleteObjects: true,                   // demo only
    });

    // 2) Lambda for event check-ins
    const ingestFn = new lambda.Function(this, 'CheckinIngestFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'ingest.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
    });

    // 3) Lambda for room usage
    const roomsUsageFn = new lambda.Function(this, 'RoomsUsageFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'rooms_usage.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
    });

    // Give both Lambdas write access to the bucket
    bucket.grantWrite(ingestFn);
    bucket.grantWrite(roomsUsageFn);

    // 4) API Gateway REST API
    const api = new apigw.RestApi(this, 'SmartCampusApi', {
      restApiName: 'SmartCampus Service',
      deployOptions: {
        stageName: 'prod',
      },
    });

    // /events/checkin
    const events = api.root.addResource('events');
    const checkin = events.addResource('checkin');
    checkin.addMethod('POST', new apigw.LambdaIntegration(ingestFn));

    // /rooms/usage
    const rooms = api.root.addResource('rooms');
    const usage = rooms.addResource('usage');
    usage.addMethod('POST', new apigw.LambdaIntegration(roomsUsageFn));

    // Outputs
    new cdk.CfnOutput(this, 'CheckinUrl', {
      value: `${api.url}events/checkin`,
    });

    new cdk.CfnOutput(this, 'RoomsUsageUrl', {
      value: `${api.url}rooms/usage`,
    });
  }
}
