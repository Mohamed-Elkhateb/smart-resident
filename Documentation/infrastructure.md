# Infrastructure Deployment Guide

This document details the AWS infrastructure components required for the Serverless Smart Home Device Management & Status API and provides instructions for their deployment. While manual deployment steps are outlined for understanding, using Infrastructure as Code (IaC) via AWS Serverless Application Model (SAM) or AWS CloudFormation is highly recommended for production readiness, consistency, and repeatability.

## 1. AWS Services Overview

The core components of this serverless architecture include:

* **Amazon API Gateway**: Acts as the HTTP endpoint for the API.
* **AWS Lambda**: Executes the business logic for handling API requests.
* **Amazon DynamoDB**: Serves as the persistent NoSQL data store for device records.
* **AWS IAM**: Manages permissions and roles for secure interactions between services.
* **Amazon S3**: Hosts the static web content for the administration portal and mobile application frontends.
* **Amazon CloudWatch**: Provides monitoring and logging capabilities.

## 2. Infrastructure as Code (IaC) - Recommended Approach

The recommended method for deploying this infrastructure is using AWS SAM (Serverless Application Model), which extends CloudFormation and simplifies the definition of serverless applications.

**Location**: `infrastructure-as-code/sam/template.yaml`

### Deployment Steps using AWS SAM CLI:

1.  **Install AWS SAM CLI**: If you haven't already, install the AWS SAM CLI. Refer to the official AWS documentation for installation instructions.
2.  **Navigate to SAM Template Directory**:
    ```bash
    cd smart-home-device-api/infrastructure-as-code/sam/
    ```
3.  **Build Your Application**: This command processes your Lambda function code and dependencies.
    ```bash
    sam build
    ```
4.  **Deploy Your Application**: This command deploys your serverless application as defined in `template.yaml` to your AWS account. Follow the prompts.
    ```bash
    sam deploy --guided
    ```
    * **Stack Name**: Provide a unique name for your CloudFormation stack (e.g., `SmartHomeDeviceApiStack`).
    * **AWS Region**: Select the AWS region where you want to deploy your resources.
    * **Confirm changes**: Review the changes proposed by SAM before deployment.
    * **Allow SAM CLI to create IAM roles**: Confirm `y` to allow SAM to create necessary IAM roles.
    * **Save arguments to samconfig.toml**: Recommended for future deployments.

This will deploy:
* An Amazon DynamoDB table (`SmartHomeDevices`).
* AWS Lambda functions for each CRUD operation (e.g., `createDevice`, `getDevice`, `updateDevice`, `deleteDevice`).
* An Amazon API Gateway REST API with routes integrated with the Lambda functions.
* Necessary IAM roles and policies for Lambda and API Gateway.
* CloudWatch Log Groups for Lambda and API Gateway logging.

## 3. Manual Deployment Steps (for understanding - not recommended for production)

This section outlines the steps to manually create the resources in the AWS Management Console or via AWS CLI.

### 3.1. Amazon DynamoDB Table Creation

1.  Go to the DynamoDB service in the AWS Management Console.
2.  Click "Create table".
3.  **Table name**: `SmartHomeDevices`
4.  **Partition key**: `deviceId` (String)
5.  (Optional) **Sort key**: `location` (String) - Can be added for more complex query patterns.
6.  **Table settings**: Use default settings (On-demand capacity is fine for free-tier use).
7.  Click "Create table".

### 3.2. AWS Lambda Functions Creation

For each CRUD operation (Create, Read All, Read One, Update, Delete), you will create a separate Lambda function.

1.  Go to the Lambda service in the AWS Management Console.
2.  Click "Create function".
3.  **Author from scratch**.
4.  **Function name**:
    * `smartHomeCreateDevice`
    * `smartHomeGetDevice`
    * `smartHomeGetAllDevices`
    * `smartHomeUpdateDevice`
    * `smartHomeDeleteDevice`
5.  **Runtime**: Python 3.x (or Node.js, depending on your chosen language).
6.  **Architecture**: `x86_64` (default).
7.  **Execution role**: Choose "Create a new role with basic Lambda permissions".
    * *After creation*, you **must** attach additional permissions to this role:
        * Navigate to IAM service, find the created role (e.g., `smartHomeCreateDevice-role-...`).
        * Attach the `AmazonDynamoDBFullAccess` (for simplicity in development, but `AmazonDynamoDBReadWriteAccess` or more granular policies are better for production) managed policy or create a custom inline policy to grant `dynamodb:PutItem`, `dynamodb:GetItem`, `dynamodb:UpdateItem`, `dynamodb:DeleteItem`, `dynamodb:Scan` permissions on the `SmartHomeDevices` table.
8.  Click "Create function".
9.  **Upload Code**: In the function's configuration, upload your respective Lambda code from `lambda-functions/`.

### 3.3. Amazon API Gateway REST API Creation

1.  Go to the API Gateway service in the AWS Management Console.
2.  Choose **REST API** (not HTTP API or WebSocket API). Click "Build".
3.  **Choose protocol**: REST.
4.  **Create new API**: New API.
5.  **API name**: `SmartHomeDeviceAPI`
6.  Click "Create API".
7.  **Create Resources and Methods**:
    * **Root Resource (`/`)**:
        * Actions -> Create Resource.
        * Resource Name: `devices`, Resource Path: `devices`.
        * Enable API Gateway CORS.
        * Actions -> Create Method -> `POST`.
            * Integration type: Lambda Function.
            * Lambda Region: Your chosen region.
            * Lambda Function: `smartHomeCreateDevice`.
            * Save.
        * Actions -> Create Method -> `GET`.
            * Integration type: Lambda Function.
            * Lambda Function: `smartHomeGetAllDevices`.
            * Save.
    * **Individual Device Resource (`/devices/{deviceId}`)**:
        * Select the `/devices` resource.
        * Actions -> Create Resource.
        * Resource Name: `{deviceId}`, Resource Path: `{deviceId}`.
        * Actions -> Create Method -> `GET`.
            * Integration type: Lambda Function.
            * Lambda Function: `smartHomeGetDevice`.
            * Save.
        * Actions -> Create Method -> `PUT`.
            * Integration type: Lambda Function.
            * Lambda Function: `smartHomeUpdateDevice`.
            * Save.
        * Actions -> Create Method -> `DELETE`.
            * Integration type: Lambda Function.
            * Lambda Function: `smartHomeDeleteDevice`.
            * Save.
8.  **Deploy API**:
    * Actions -> Deploy API.
    * **Deployment stage**: `dev` (or create a new stage).
    * Click "Deploy".
    * Note down the "Invoke URL" – this is your API's base URL.

### 3.4. Amazon S3 Bucket Creation for Frontends

You will create two S3 buckets to host the static content for your administration portal and mobile application.

1.  Go to the S3 service in the AWS Management Console.
2.  Click "Create bucket".
3.  **Bucket name**: Choose a unique, globally distinct name (e.g., `yourname-smarthome-admin-portal`).
4.  **AWS Region**: Select your deployment region.
5.  **Block Public Access settings**: Crucially, **uncheck** "Block all public access" to allow website hosting. Acknowledge the warning.
6.  Click "Create bucket".
7.  **Enable Static Website Hosting**:
    * Select your newly created bucket.
    * Go to "Properties" tab.
    * Scroll down to "Static website hosting" and click "Edit".
    * Enable "Static website hosting".
    * **Index document**: `index.html`
    * **Error document**: `index.html` (or a specific error page).
    * Save changes.
    * Note down the "Bucket website endpoint".
8.  **Add Bucket Policy for Public Read Access**:
    * Select your bucket.
    * Go to "Permissions" tab.
    * Under "Bucket Policy", click "Edit".
    * Paste the following policy, replacing `your-bucket-name` with your actual bucket name:
        ```json
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": "s3:GetObject",
                    "Resource": "arn:aws:s3:::your-bucket-name/*"
                }
            ]
        }
        ```
    * Save changes.
9.  **Upload Frontend Content**:
    * Go to "Objects" tab within the bucket.
    * Click "Upload" and upload all files from your `frontend/admin-portal/` (or `frontend/mobile-app-frontend/`) directory.
10. Repeat steps 1-9 for the mobile application frontend bucket (e.g., `yourname-smarthome-mobile-app`).

## 4. Post-Deployment Configuration

* **Update Frontend API URLs**: After deploying your API Gateway, you will get an "Invoke URL". You must update the JavaScript files in both your `frontend/admin-portal/` and `frontend/mobile-app-frontend/` directories to point to this new API Gateway Invoke URL.
* **Test Endpoints**: Use tools like Postman, Insomnia, or `curl` to test your API Gateway endpoints and ensure they correctly interact with Lambda and DynamoDB.
* **Access Frontends**: Open the S3 static website endpoints in your browser to access your administration portal and mobile application frontends.
