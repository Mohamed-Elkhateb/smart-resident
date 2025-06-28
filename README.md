# Serverless Smart Home Device Management & Status API

## Project Description

This project develops a **serverless REST API** designed to manage and track the virtual status of smart home devices within a residential environment. Leveraging AWS serverless technologies, the solution provides a robust, scalable, and cost-effective backend for a smart home ecosystem, allowing for the creation, retrieval, updating, and deletion (CRUD) of device records. This API serves as the central data store for device inventory and their reported or desired states, facilitating administration via a web-based portal and a mobile application frontend.

## Problem Statement

As smart home technology becomes more prevalent, individuals often find themselves with a growing number of interconnected devices from various manufacturers. Managing these devices, monitoring their status, and maintaining an inventory can become complex without a centralized system. Existing commercial solutions often involve reliance on third-party cloud services, raising concerns about data privacy and vendor lock-in. Furthermore, for those interested in building custom smart home solutions or simply maintaining a private inventory of their devices, there's a need for a flexible, extensible, and secure backend.

## Solution Overview

This project addresses the problem by providing a private, serverless backend API on AWS for managing smart home device data. The solution focuses on:

1.  **Centralized Device Inventory:** A single source of truth for all registered smart home devices, including their properties and current/desired operational states.
2.  **Private and Secure Data Storage:** Utilizing AWS services to ensure data resides securely within the user's private AWS account, minimizing reliance on external third-party services for core data storage.
3.  **Scalable and Cost-Effective Architecture:** Employing serverless components (API Gateway, Lambda, DynamoDB) that automatically scale with demand and incur costs only when actively used.
4.  **Flexible Access:** Providing a RESTful API that can be consumed by both a web-based administration portal and a mobile application, offering convenience and control from anywhere.
5.  **Focus on Backend Logic:** The primary scope is the robust and secure backend API, abstracting away the complexities of direct physical device integration, focusing instead on data management and reporting.

This solution empowers users to maintain their smart home device information independently, demonstrating a practical application of core AWS serverless services for a common, modern use case.

## Architectural Overview

The core of this solution is a serverless REST API, providing a stateless and highly scalable backend for smart home device management. User requests from either the administration portal or mobile application frontend are routed through Amazon API Gateway. API Gateway acts as the "front door," handling request routing, authentication, and authorization. These requests then trigger specific AWS Lambda functions, which contain the business logic for performing CRUD operations on device data. All device-related information is persistently stored in Amazon DynamoDB, a fully managed NoSQL database designed for high performance at any scale. AWS IAM ensures secure access control across all components, while Amazon CloudWatch provides comprehensive logging and monitoring capabilities for operational insights. The frontends (administration portal and mobile application) are static web applications hosted securely on Amazon S3.

*(Refer to the `architecture/solution_architecture_diagram.png` for a visual representation of this architecture.)*

## Key AWS Services Used

* **Amazon API Gateway**: Exposes REST endpoints for the smart home device management API. It acts as the single entry point for all API requests, handling routing, request/response transformations, and authorization.
* **AWS Lambda**: Executes the backend logic for all API operations (Create, Read, Update, Delete). Lambda functions are invoked by API Gateway requests, processing data and interacting with DynamoDB without requiring server management.
* **Amazon DynamoDB**: Serves as the NoSQL database for storing all smart home device records. Its managed nature ensures high availability, scalability, and performance for device data.
* **AWS IAM (Identity and Access Management)**: Manages and secures access to AWS resources. IAM roles and policies are used to define permissions for Lambda functions to access DynamoDB and for API Gateway to invoke Lambda, ensuring a secure posture.
* **Amazon CloudWatch**: Provides monitoring and observability for the application. It collects logs from Lambda and API Gateway, enabling performance tracking, troubleshooting, and alarm creation for operational insights.
* **Amazon S3 (Simple Storage Service)**: Used to host the static files (HTML, CSS, JavaScript) for both the web-based administration portal and the mobile application frontend, providing highly available and scalable static content delivery.

## Project Deliverables

As per the project requirements, the following deliverables are included in this repository:

* [cite_start]**Solution Architecture Diagram**: A visual representation of the solution architecture, located in `architecture/solution_architecture_diagram.png`[cite: 1]. [cite_start]Tools such as Lucidchart or any other free diagramming tools may be used[cite: 2].
* [cite_start]**GitHub Repository**: This public repository itself, containing all project documentation and code[cite: 3].
* [cite_start]**Complete Project Documentation**: This README file serves as the primary documentation, with additional details provided in the `documentation/` directory[cite: 3].
* **Source Code**: The Lambda function code for API operations, located in `lambda-functions/`. The frontend code for the administration portal and mobile application is in `frontend/`.
* **Infrastructure as Code (Optional but Recommended)**: CloudFormation/SAM templates for deploying the AWS infrastructure are located in `infrastructure-as-code/`.

**Optional Deliverables (Encouraged):**

* [cite_start]**Live URL/Recorded Video**: A live URL for the deployed frontends on AWS S3 or a recorded video demonstrating the deployed solution on AWS (e.g., interacting with the admin portal and API) is an optional but encouraged deliverable[cite: 4].

## Setup and Deployment Instructions

This section provides a high-level guide to setting up and deploying the Smart Home Device Management & Status API. Detailed steps will be elaborated in the `documentation/infrastructure.md` file.

### Prerequisites

* An active AWS Account with Free Tier eligibility.
* AWS CLI configured with appropriate credentials.
* Node.js and npm (for front-end development dependencies, if applicable).
* Python 3.x and pip (for Lambda function development, if Python is chosen).
* Git installed.
* (Optional) AWS SAM CLI for local testing and simplified deployments.

### Backend Deployment (API Gateway, Lambda, DynamoDB)

1.  **Clone the Repository**:
    ```bash
    git clone [https://github.com/your-username/smart-home-device-api.git](https://github.com/your-username/smart-home-device-api.git)
    cd smart-home-device-api
    ```
2.  **Deploy DynamoDB Table**:
    * Create a new DynamoDB table named `SmartHomeDevices` with a primary key (e.g., `deviceId`).
    * (Alternatively, use the CloudFormation/SAM template provided in `infrastructure-as-code/` to automate this).
3.  **Package and Deploy Lambda Functions**:
    * Navigate to each Lambda function directory (e.g., `lambda-functions/create-device/`).
    * Package dependencies and deploy the function to AWS Lambda.
    * Ensure appropriate IAM roles are attached to Lambda functions allowing them to interact with DynamoDB.
    * (Recommended: Use `sam deploy --guided` from the `infrastructure-as-code/sam/` directory).
4.  **Configure API Gateway**:
    * Create a new REST API in Amazon API Gateway.
    * Define resources (e.g., `/devices`, `/devices/{deviceId}`) and HTTP methods (GET, POST, PUT, DELETE).
    * Integrate each method with the corresponding Lambda function.
    * Configure API Gateway security (e.g., IAM authorization).
    * Deploy the API to a stage (e.g., `dev` or `prod`) to obtain an Invoke URL.

### Frontend Deployment (Admin Portal & Mobile App Frontend)

1.  **Build Front-end Applications**:
    * Navigate to `frontend/admin-portal/` and `frontend/mobile-app-frontend/`.
    * Update the JavaScript code in each to point to your deployed API Gateway Invoke URL.
    * (If using frameworks, build the static assets).
2.  **Host on Amazon S3**:
    * Create two S3 buckets (e.g., `your-bucket-name-admin-portal` and `your-bucket-name-mobile-app`).
    * Enable Static Website Hosting for both buckets.
    * Upload the contents of each front-end directory to its respective S3 bucket.
    * Configure bucket policies to allow public read access for website hosting.

### Post-Deployment

* Test API endpoints using tools like Postman or `curl`.
* Access the deployed administration portal and mobile application frontends via their S3 static website URLs.
* Monitor logs in Amazon CloudWatch for any errors or insights.

## API Endpoints and Usage

The API provides a set of RESTful endpoints to manage smart home device records. All endpoints are accessed via the Amazon API Gateway Invoke URL. Authentication and authorization mechanisms (e.g., IAM roles, API Keys, or Cognito User Pools if added later) should be considered for production use.

| Method | Path               | Description                           | Request Body Example (for POST/PUT)                                         | Response Body Example (Success)                                                                                                   |
| :----- | :----------------- | :------------------------------------ | :-------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/devices`         | Creates a new smart home device record. | ```json { "name": "Living Room Light", "type": "Light", "location": "Living Room", "status": "Off", "deviceId": "lrl-001" } ``` | ```json { "message": "Device created successfully", "device": { "name": "Living Room Light", ... } } ```                        |
| `GET`  | `/devices/{deviceId}` | Retrieves details for a specific device. | *(None)* | ```json { "deviceId": "lrl-001", "name": "Living Room Light", "type": "Light", "location": "Living Room", "status": "On" } ``` |
| `GET`  | `/devices`         | Retrieves a list of all devices.      | *(None)* | ```json [ { "deviceId": "lrl-001", "name": "Living Room Light", ... }, { "deviceId": "thrm-002", "name": "Bedroom Thermostat", ... } ] ``` |
| `PUT`  | `/devices/{deviceId}` | Updates an existing device record.    | ```json { "status": "On" } ``` (partial update)                            | ```json { "message": "Device updated successfully", "device": { "deviceId": "lrl-001", ... } } ```                           |
| `DELETE` | `/devices/{deviceId}` | Deletes a device record.              | *(None)* | ```json { "message": "Device deleted successfully" } ```                                                                          |

*Detailed API specifications, including error handling and full response schemas, can be found in `documentation/api-endpoints.md`.*

## Security Considerations

Security is paramount in any cloud application, especially one dealing with personal environment data. This project adheres to AWS security best practices through:

* [cite_start]**IAM Roles and Policies**: AWS Lambda functions and API Gateway are granted least-privilege permissions through IAM roles, ensuring they can only access the necessary resources (e.g., Lambda can only write to its CloudWatch logs and interact with its designated DynamoDB table). [cite: 11]
* **API Gateway Security**: API Gateway can be configured with various authorization mechanisms (e.g., IAM authorization, Custom Authorizers, Amazon Cognito User Pools for production scenarios) to control who can access the API endpoints.
* **DynamoDB Encryption**: Data stored in Amazon DynamoDB is encrypted at rest by default using AWS Key Management Service (KMS). Data in transit is secured via HTTPS/SSL.
* **S3 Bucket Policies**: Frontend S3 buckets are configured with policies that grant public read access only for static website hosting, preventing unauthorized write access.
* **Secrets Management**: While not explicitly implemented in this basic version, for production, sensitive information (e.g., API keys, database credentials if using a different DB) would be managed securely using AWS Secrets Manager or AWS Systems Manager Parameter Store.

*Further details on security implementation are available in `documentation/security.md`.*

## Monitoring and Logging

Leveraging Amazon CloudWatch, this solution provides comprehensive monitoring and logging capabilities to ensure operational visibility and facilitate troubleshooting:

* **Lambda Logs**: All Lambda function invocations and their output are automatically logged to CloudWatch Logs. This provides detailed insights into function execution, errors, and performance.
* **API Gateway Access Logs**: API Gateway can be configured to send access logs to CloudWatch Logs, capturing details about API requests, responses, and latency.
* **CloudWatch Metrics**: Key metrics for Lambda (invocations, errors, duration, throttles) and API Gateway (latency, 4xx/5xx errors) are automatically collected by CloudWatch.
* [cite_start]**Alarms (Optional)**: CloudWatch alarms can be configured to notify administrators via Amazon SNS (Simple Notification Service) for critical events, such as high error rates or unusual latency spikes in the API. [cite: 11]

*For more in-depth information on monitoring and logging configurations, refer to `documentation/monitoring-logging.md`.*

## AWS Well-Architected Framework Pillars Adherence

This project is designed with the AWS Well-Architected Framework's six pillars in mind to ensure a robust, efficient, and secure solution:

1.  **Operational Excellence**:
    * **Automation**: Infrastructure as Code (CloudFormation/SAM) is recommended for repeatable and reliable deployments.
    * **Monitoring and Logging**: Extensive use of Amazon CloudWatch for real-time visibility into application performance and logs for troubleshooting.
    * **Serverless Nature**: Reduces operational overhead by abstracting away server management.

2.  **Security**:
    * [cite_start]**Identity and Access Management (IAM)**: Fine-grained permissions using IAM roles for Lambda and API Gateway, adhering to the principle of least privilege[cite: 11, 22].
    * **Data Protection**: DynamoDB encryption at rest and data in transit via HTTPS/SSL for API Gateway.
    * **Network Security**: API Gateway acts as a secure front door, and S3 bucket policies control access to front-end assets.

3.  **Reliability**:
    * **Serverless High Availability**: AWS Lambda and Amazon DynamoDB are inherently highly available, automatically replicating data and scaling across multiple Availability Zones to ensure resilience.
    * **Stateless Functions**: Lambda functions are stateless, making them easier to scale and recover from failures.
    * **Managed Services**: Reliance on fully managed AWS services minimizes the need for manual intervention and reduces the risk of infrastructure failures.

4.  **Performance Efficiency**:
    * [cite_start]**Auto-Scaling**: Lambda and DynamoDB automatically scale to handle varying workloads, ensuring optimal performance under different demand levels[cite: 10, 18, 25].
    * **Serverless Compute**: Lambda functions execute code in response to events, providing efficient compute only when needed.
    * **NoSQL Database**: DynamoDB provides single-digit millisecond performance at any scale, ideal for quick data retrieval and updates.

5.  **Cost Optimization**:
    * [cite_start]**Pay-per-Execution Model**: Serverless services (Lambda, API Gateway, DynamoDB) follow a pay-as-you-go model, eliminating costs for idle resources and optimizing for actual usage[cite: 18].
    * **AWS Free Tier**: The solution is designed to operate largely within AWS Free Tier limits for development and testing, significantly reducing initial costs.
    * **Managed Services**: Reduces operational costs by removing the need to manage underlying infrastructure.

6.  **Sustainability**:
    * **Resource Utilization**: Serverless architectures contribute to sustainability by dynamically allocating resources, minimizing idle capacity and thus reducing energy consumption compared to always-on servers.
    * **Shared Responsibility**: AWS's optimized data centers and shared infrastructure for managed services contribute to overall energy efficiency at scale.


## Future Enhancements

This project provides a solid foundation for a smart home device management system. Potential future enhancements could include:

* **User Authentication**: Implement Amazon Cognito User Pools for robust user authentication and authorization for the API and frontends.
* **Real-time Updates**: Integrate AWS IoT Core or WebSockets (via API Gateway) to enable real-time status updates from physical devices or push notifications to clients.
* **Device Control Integration**: Develop Lambda functions that interact with actual smart home device APIs (e.g., Philips Hue, SmartThings) to enable direct control beyond just status management.
* **Data Analytics**: Utilize Amazon Kinesis Firehose and Amazon S3 for data lake capabilities, then Amazon Athena or QuickSight for analytics on device usage patterns.
* **Advanced Monitoring**: Set up custom CloudWatch dashboards and alarms for specific operational metrics.
* **CI/CD Pipeline**: Implement a Continuous Integration/Continuous Delivery pipeline using AWS CodePipeline and CodeBuild for automated testing and deployment.
* **Custom Domain**: Configure a custom domain name for the API Gateway endpoint and S3 static websites using Amazon Route 53 and AWS Certificate Manager.

* 
