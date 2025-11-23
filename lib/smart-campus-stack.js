"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartCampusStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const s3 = __importStar(require("aws-cdk-lib/aws-s3"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const apigw = __importStar(require("aws-cdk-lib/aws-apigateway"));
class SmartCampusStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // 1) S3 bucket for all raw data
        const bucket = new s3.Bucket(this, 'RawEventBucket', {
            removalPolicy: cdk.RemovalPolicy.DESTROY, // demo only
            autoDeleteObjects: true, // demo only
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
exports.SmartCampusStack = SmartCampusStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic21hcnQtY2FtcHVzLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic21hcnQtY2FtcHVzLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQW1DO0FBRW5DLHVEQUF5QztBQUN6QywrREFBaUQ7QUFDakQsa0VBQW9EO0FBRXBELE1BQWEsZ0JBQWlCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDN0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixnQ0FBZ0M7UUFDaEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUNuRCxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUcsWUFBWTtZQUN2RCxpQkFBaUIsRUFBRSxJQUFJLEVBQW9CLFlBQVk7U0FDeEQsQ0FBQyxDQUFDO1FBRUgsZ0NBQWdDO1FBQ2hDLE1BQU0sUUFBUSxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsdUJBQXVCLEVBQUU7WUFDbEUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxPQUFPLEVBQUUsZ0JBQWdCO1lBQ3pCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7WUFDckMsV0FBVyxFQUFFO2dCQUNYLFdBQVcsRUFBRSxNQUFNLENBQUMsVUFBVTthQUMvQjtTQUNGLENBQUMsQ0FBQztRQUVILDJCQUEyQjtRQUMzQixNQUFNLFlBQVksR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFO1lBQ25FLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsT0FBTyxFQUFFLHFCQUFxQjtZQUM5QixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO1lBQ3JDLFdBQVcsRUFBRTtnQkFDWCxXQUFXLEVBQUUsTUFBTSxDQUFDLFVBQVU7YUFDL0I7U0FDRixDQUFDLENBQUM7UUFFSCwrQ0FBK0M7UUFDL0MsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM1QixNQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRWhDLDBCQUEwQjtRQUMxQixNQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQ3BELFdBQVcsRUFBRSxxQkFBcUI7WUFDbEMsYUFBYSxFQUFFO2dCQUNiLFNBQVMsRUFBRSxNQUFNO2FBQ2xCO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsa0JBQWtCO1FBQ2xCLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDOUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUVqRSxlQUFlO1FBQ2YsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDNUMsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN6QyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBRW5FLFVBQVU7UUFDVixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUNwQyxLQUFLLEVBQUUsR0FBRyxHQUFHLENBQUMsR0FBRyxnQkFBZ0I7U0FDbEMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDdkMsS0FBSyxFQUFFLEdBQUcsR0FBRyxDQUFDLEdBQUcsYUFBYTtTQUMvQixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUE3REQsNENBNkRDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgczMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzJztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCAqIGFzIGFwaWd3IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcblxuZXhwb3J0IGNsYXNzIFNtYXJ0Q2FtcHVzU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvLyAxKSBTMyBidWNrZXQgZm9yIGFsbCByYXcgZGF0YVxuICAgIGNvbnN0IGJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgJ1Jhd0V2ZW50QnVja2V0Jywge1xuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSwgIC8vIGRlbW8gb25seVxuICAgICAgYXV0b0RlbGV0ZU9iamVjdHM6IHRydWUsICAgICAgICAgICAgICAgICAgIC8vIGRlbW8gb25seVxuICAgIH0pO1xuXG4gICAgLy8gMikgTGFtYmRhIGZvciBldmVudCBjaGVjay1pbnNcbiAgICBjb25zdCBpbmdlc3RGbiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0NoZWNraW5Jbmdlc3RGdW5jdGlvbicsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzExLFxuICAgICAgaGFuZGxlcjogJ2luZ2VzdC5oYW5kbGVyJyxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhJyksXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBCVUNLRVRfTkFNRTogYnVja2V0LmJ1Y2tldE5hbWUsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gMykgTGFtYmRhIGZvciByb29tIHVzYWdlXG4gICAgY29uc3Qgcm9vbXNVc2FnZUZuID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnUm9vbXNVc2FnZUZ1bmN0aW9uJywge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfMTEsXG4gICAgICBoYW5kbGVyOiAncm9vbXNfdXNhZ2UuaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYScpLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgQlVDS0VUX05BTUU6IGJ1Y2tldC5idWNrZXROYW1lLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIEdpdmUgYm90aCBMYW1iZGFzIHdyaXRlIGFjY2VzcyB0byB0aGUgYnVja2V0XG4gICAgYnVja2V0LmdyYW50V3JpdGUoaW5nZXN0Rm4pO1xuICAgIGJ1Y2tldC5ncmFudFdyaXRlKHJvb21zVXNhZ2VGbik7XG5cbiAgICAvLyA0KSBBUEkgR2F0ZXdheSBSRVNUIEFQSVxuICAgIGNvbnN0IGFwaSA9IG5ldyBhcGlndy5SZXN0QXBpKHRoaXMsICdTbWFydENhbXB1c0FwaScsIHtcbiAgICAgIHJlc3RBcGlOYW1lOiAnU21hcnRDYW1wdXMgU2VydmljZScsXG4gICAgICBkZXBsb3lPcHRpb25zOiB7XG4gICAgICAgIHN0YWdlTmFtZTogJ3Byb2QnLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIC9ldmVudHMvY2hlY2tpblxuICAgIGNvbnN0IGV2ZW50cyA9IGFwaS5yb290LmFkZFJlc291cmNlKCdldmVudHMnKTtcbiAgICBjb25zdCBjaGVja2luID0gZXZlbnRzLmFkZFJlc291cmNlKCdjaGVja2luJyk7XG4gICAgY2hlY2tpbi5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ3cuTGFtYmRhSW50ZWdyYXRpb24oaW5nZXN0Rm4pKTtcblxuICAgIC8vIC9yb29tcy91c2FnZVxuICAgIGNvbnN0IHJvb21zID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ3Jvb21zJyk7XG4gICAgY29uc3QgdXNhZ2UgPSByb29tcy5hZGRSZXNvdXJjZSgndXNhZ2UnKTtcbiAgICB1c2FnZS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ3cuTGFtYmRhSW50ZWdyYXRpb24ocm9vbXNVc2FnZUZuKSk7XG5cbiAgICAvLyBPdXRwdXRzXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0NoZWNraW5VcmwnLCB7XG4gICAgICB2YWx1ZTogYCR7YXBpLnVybH1ldmVudHMvY2hlY2tpbmAsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnUm9vbXNVc2FnZVVybCcsIHtcbiAgICAgIHZhbHVlOiBgJHthcGkudXJsfXJvb21zL3VzYWdlYCxcbiAgICB9KTtcbiAgfVxufVxuIl19