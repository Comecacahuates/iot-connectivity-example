# Connectivity Microservice

## Overview

The Connectivity Microservice provides real-time monitoring and tracking of IoT device connectivity status across your device fleet.

## Documentation

The `/docs` folder contains comprehensive technical documentation for this microservice:

### Architecture Documentation
- **`architecture.plantuml`** - Complete system architecture diagram showing AWS resources, data flow, and IAM permission policies for infrastructure code generation

### Data Schema Documentation
- **`timestream-schema.md`** - Timestream database schema specification including table structure, data types, and retention policies
- **`schemas/`** - Event and message schema definitions
  - **`asyncapi-main.yaml`** - AsyncAPI specification for event-driven communication patterns
  - **`channels/`** - Event channel definitions and routing configurations
  - **`messages/`** - Message schema definitions for connectivity events
  - **`parameters/`** - Parameter definitions for event processing

These documents serve as input artifacts for AI-assisted infrastructure code generation, providing complete specifications for AWS CDK deployment.

## Business Requirements

### Device Connectivity Monitoring

- Track when devices connect and disconnect from the network
- Monitor connection quality and stability patterns
- Identify devices experiencing frequent disconnections
- Provide visibility into overall fleet connectivity health

### Historical Data Management

- Maintain a complete history of connectivity events for each device
- Store connection duration and frequency metrics
- Enable trend analysis and reporting capabilities
- Support data retention policies for compliance requirements

### Event-Driven Integration

- Notify other systems when connectivity status changes occur
- Enable automated responses to connectivity issues
- Support integration with alerting and notification systems
- Facilitate data flow to analytics and reporting platforms

## Key Benefits

- **Proactive Issue Detection**: Identify connectivity problems before they impact operations
- **Fleet Visibility**: Comprehensive view of device connectivity across your entire IoT deployment
- **Data-Driven Insights**: Historical data enables optimization of connectivity strategies
- **System Integration**: Seamless integration with existing monitoring and management tools
- **Scalability**: Designed to handle connectivity events from thousands of devices

## Use Cases

- Manufacturing equipment monitoring
- Smart building sensor networks
- Vehicle fleet tracking
- Environmental monitoring systems
- Healthcare device management
