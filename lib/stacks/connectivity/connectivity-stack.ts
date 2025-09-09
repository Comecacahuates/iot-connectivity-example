import * as cdk from "aws-cdk-lib";
import * as iot from "aws-cdk-lib/aws-iot";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as events from "aws-cdk-lib/aws-events";
import * as timestream from "aws-cdk-lib/aws-timestream";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export interface ConnectivityStackProps extends cdk.StackProps {
  eventBus: events.IEventBus;
  timestreamDatabase: timestream.CfnDatabase;
  deviceEventsTable: timestream.CfnTable;
}

export class ConnectivityStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ConnectivityStackProps) {
    super(scope, id, props);

    const { eventBus, timestreamDatabase, deviceEventsTable } = props;

    // Lambda Function
    const connectivityFunction = new lambda.Function(
      this,
      "ConnectivityFunction",
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        handler: "index.handler",
        code: lambda.Code.fromInline(`
        const { EventBridgeClient, PutEventsCommand } = require('@aws-sdk/client-eventbridge');

        const eventbridge = new EventBridgeClient({});

        exports.handler = async (event) => {
          console.log('Received connectivity event:', JSON.stringify(event, null, 2));

          const { clientId, eventType, sessionIdentifier, disconnectReason, timestamp } = event;

          const domainEvent = {
            Source: 'connectivity.service',
            DetailType: eventType === 'connected' ? 'Device Connected' : 'Device Disconnected',
            Detail: JSON.stringify({
              clientId,
              eventType,
              sessionIdentifier,
              ...(disconnectReason && { disconnectReason }),
              timestamp
            }),
            EventBusName: process.env.EVENTBUS_NAME
          };

          await eventbridge.send(new PutEventsCommand({
            Entries: [domainEvent]
          }));

          console.log('Published domain event:', domainEvent.DetailType);
        };
      `),
        memorySize: 256,
        timeout: cdk.Duration.seconds(30),
        environment: {
          EVENTBUS_NAME: eventBus.eventBusName,
          LOG_LEVEL: "INFO",
        },
      },
    );

    // Grant Lambda permission to put events to EventBridge
    eventBus.grantPutEventsTo(connectivityFunction);

    // IoT Rule Service Role
    const iotRuleRole = new iam.Role(this, "IoTRuleRole", {
      assumedBy: new iam.ServicePrincipal("iot.amazonaws.com"),
      inlinePolicies: {
        TimestreamWritePolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["timestream:WriteRecords"],
              resources: [deviceEventsTable.attrArn],
            }),
          ],
        }),
        LambdaInvokePolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["lambda:InvokeFunction"],
              resources: [connectivityFunction.functionArn],
            }),
          ],
        }),
      },
    });

    // IoT Rule for Connectivity Events
    new iot.CfnTopicRule(this, "ConnectivityRule", {
      ruleName: "ConnectivityRule",
      topicRulePayload: {
        sql: "SELECT * FROM '$aws/events/presence/+/+'",
        description: "Routes connectivity events to Timestream and Lambda",
        actions: [
          {
            timestream: {
              databaseName: timestreamDatabase.databaseName!,
              tableName: deviceEventsTable.tableName!,
              dimensions: [
                {
                  name: "clientId",
                  value: "${clientId}",
                },
                {
                  name: "eventType",
                  value: "${eventType}",
                },
                {
                  name: "sessionIdentifier",
                  value: "${sessionIdentifier}",
                },
                {
                  name: "disconnectReason",
                  value: "${disconnectReason}",
                },
              ],
              timestamp: {
                value: "${timestamp}",
                unit: "MILLISECONDS",
              },
              roleArn: iotRuleRole.roleArn,
            },
          },
          {
            lambda: {
              functionArn: connectivityFunction.functionArn,
            },
          },
        ],
        ruleDisabled: false,
      },
    });

    // Grant IoT Rule permission to invoke Lambda
    connectivityFunction.addPermission("AllowIoTRuleInvoke", {
      principal: new iam.ServicePrincipal("iot.amazonaws.com"),
      sourceArn: `arn:aws:iot:${this.region}:${this.account}:rule/ConnectivityRule`,
    });

    // Outputs
    new cdk.CfnOutput(this, "EventBusName", {
      value: eventBus.eventBusName,
      description: "EventBridge Custom Event Bus Name",
    });

    new cdk.CfnOutput(this, "FunctionName", {
      value: connectivityFunction.functionName,
      description: "Lambda Function Name",
    });
  }
}
