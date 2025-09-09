# Experiment: IoT Connectivity Monitoring Service with AI-Assisted IaC

This project demonstrates an event-driven, serverless architecture for monitoring IoT device connectivity on AWS. It showcases a workflow that leverages design-first principles, AI-powered code generation, and robust documentation.

## Project Overview

The core functionality of this service is to:

1.  Ingest IoT device connection and disconnection events.
2.  Store these events in AWS Timestream for analytics.
3.  Publish standardized domain events to a central AWS EventBridge bus for consumption by other microservices.

This project was developed as an experiment to test a methodology of using architectural design artifacts (like PlantUML diagrams, AsyncAPI specifications, and database schemas) as a high-fidelity input for AI coding tools to generate Cloud Development Kit (CDK) infrastructure code.

## Key Components

- **AWS IoT Core:** Ingests raw device connectivity events.
- **AWS Lambda:** Processes events, formats them, and publishes domain events to EventBridge.
- **AWS EventBridge:** Acts as a central event bus for inter-service communication.
- **AWS Timestream:** Stores historical connectivity data for analytics and auditing.
- **AWS CDK (TypeScript):** Defines and deploys the cloud infrastructure.

## Workflow Highlights

- **Design-First Approach:** Architecture, event contracts (AsyncAPI), and data schemas are defined _before_ infrastructure code generation. You can find these design artifacts in the `docs/` directory.
- **AI-Assisted IaC:** Design artifacts are fed into an AI coding tool to generate the initial CDK code, accelerating development. The generated infrastructure code for this connectivity stack is located at `lib/stacks/connectivity/connectivity-stack.ts`. For this example, Amazon Q was used to generate this CDK file.
- **Documentation as Code:** PlantUML diagrams, AsyncAPI specs, and schema definitions serve as the "source of truth" for the system's behavior and structure.

## Getting Started

For detailed instructions on building, deploying, and testing this project, please refer to the respective documentation within the `docs` directory.

### Useful commands

- `yarn run build` compile typescript to js
- `yarn run watch` watch for changes and compile
- `yarn run test` perform the jest unit tests
- `yarn cdk deploy` deploy this stack to your default AWS account/region
- `yarn cdk diff` compare deployed stack with current state
- `yarn cdk synth` emits the synthesized CloudFormation template
