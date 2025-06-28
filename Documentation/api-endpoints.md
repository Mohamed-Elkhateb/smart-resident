# API Endpoints and Data Models

This document provides a detailed specification of the RESTful API endpoints for the Smart Home Device Management & Status system. It includes the HTTP methods, paths, request/response formats, and data models for each operation.

## Base URL

The base URL for all API endpoints will be the **Invoke URL** provided by Amazon API Gateway after deployment (e.g., `https://xxxxxxxxx.execute-api.your-region.amazonaws.com/dev`).

## Authentication and Authorization

For this project's scope, initial access might be open or secured via simple IAM permissions. For a production environment, strong authentication and authorization are highly recommended, such as:

* **IAM Authorization**: Using AWS IAM roles/users to sign requests.
* **Amazon Cognito User Pools**: For user authentication (signup, sign-in) and token-based authorization.
* **API Keys**: For basic usage tracking and control (less secure for sensitive data).

## Data Model: SmartHomeDevice

The primary data entity managed by this API is a `SmartHomeDevice`. Each device record is stored in Amazon DynamoDB.

| Field Name  | Type    | Description                                                                 | Constraints/Notes                                                 |
| :---------- | :------ | :-------------------------------------------------------------------------- | :---------------------------------------------------------------- |
| `deviceId`  | String  | **Primary Key (Partition Key)**. Unique identifier for the device.          | Required, unique. Example: `lrl-001`, `thrm-002`                  |
| `name`      | String  | Human-readable name of the device.                                          | Required. Example: `Living Room Light`, `Bedroom Thermostat`      |
| `type`      | String  | Category or type of the device.                                             | Required. Example: `Light`, `Thermostat`, `Lock`, `Sensor`        |
| `location`  | String  | Physical location of the device within the home/compound.                   | Optional. Example: `Living Room`, `Master Bedroom`, `Kitchen`     |
| `status`    | String  | Current operational status of the device.                                   | Required. Example: `On`, `Off`, `Active`, `Inactive`, `Locked`, `Unlocked`, `22C` |
| `lastUpdated` | String  | Timestamp of the last update to the device record (ISO 8601 format).       | Automatically generated/updated by Lambda. Example: `2024-06-27T10:30:00Z` |
| `properties` | Object | Optional, flexible field for additional device-specific properties (e.g., `brightness`, `color`, `batteryLevel`). | JSON object. Example: `{ "brightness": 80, "color": "white" }`  |

## API Endpoints

### 1. Create a New Device

* **HTTP Method**: `POST`
* **Path**: `/devices`
* **Lambda Function**: `smartHomeCreateDevice`
* **Description**: Adds a new smart home device record to the system.

    **Request Body Example**:
    ```json
    {
        "deviceId": "lrl-001",
        "name": "Living Room Light",
        "type": "Light",
        "location": "Living Room",
        "status": "Off",
        "properties": {
            "brightness": 50,
            "color": "warm white"
        }
    }
    ```

    **Success Response (HTTP 201 Created)**:
    ```json
    {
        "message": "Device created successfully",
        "device": {
            "deviceId": "lrl-001",
            "name": "Living Room Light",
            "type": "Light",
            "location": "Living Room",
            "status": "Off",
            "properties": {
                "brightness": 50,
                "color": "warm white"
            },
            "lastUpdated": "2025-06-27T10:30:00Z"
        }
    }
    ```

    **Error Response (Example HTTP 400 Bad Request / 500 Internal Server Error)**:
    ```json
    {
        "error": "Missing required field: deviceId"
    }
    ```

### 2. Get All Devices

* **HTTP Method**: `GET`
* **Path**: `/devices`
* **Lambda Function**: `smartHomeGetAllDevices`
* **Description**: Retrieves a list of all registered smart home devices.

    **Request Query Parameters**: *(Optional)*
    * `limit`: Integer (e.g., `?limit=10`) - Maximum number of items to return.
    * `exclusiveStartKey`: String - Used for pagination (the `deviceId` of the last item from the previous page).

    **Success Response (HTTP 200 OK)**:
    ```json
    {
        "devices": [
            {
                "deviceId": "lrl-001",
                "name": "Living Room Light",
                "type": "Light",
                "location": "Living Room",
                "status": "On",
                "lastUpdated": "2025-06-27T10:35:00Z"
            },
            {
                "deviceId": "thrm-002",
                "name": "Bedroom Thermostat",
                "type": "Thermostat",
                "location": "Bedroom",
                "status": "22C",
                "lastUpdated": "2025-06-27T10:32:15Z"
            }
        ],
        "lastEvaluatedKey": "thrm-002" // Present if there are more items to retrieve
    }
    ```

### 3. Get a Specific Device

* **HTTP Method**: `GET`
* **Path**: `/devices/{deviceId}`
* **Lambda Function**: `smartHomeGetDevice`
* **Description**: Retrieves the details of a single smart home device using its `deviceId`.

    **Path Parameters**:
    * `deviceId`: The unique identifier of the device.

    **Success Response (HTTP 200 OK)**:
    ```json
    {
        "deviceId": "lrl-001",
        "name": "Living Room Light",
        "type": "Light",
        "location": "Living Room",
        "status": "On",
        "properties": {
            "brightness": 80,
            "color": "white"
        },
        "lastUpdated": "2025-06-27T10:35:00Z"
    }
    ```

    **Error Response (HTTP 404 Not Found)**:
    ```json
    {
        "error": "Device with ID 'non-existent-id' not found"
    }
    ```

### 4. Update an Existing Device

* **HTTP Method**: `PUT`
* **Path**: `/devices/{deviceId}`
* **Lambda Function**: `smartHomeUpdateDevice`
* **Description**: Updates one or more fields of an existing smart home device. Only the fields provided in the request body will be updated.

    **Path Parameters**:
    * `deviceId`: The unique identifier of the device to update.

    **Request Body Example (Partial Update)**:
    ```json
    {
        "status": "Off",
        "properties": {
            "brightness": 0
        }
    }
    ```

    **Success Response (HTTP 200 OK)**:
    ```json
    {
        "message": "Device updated successfully",
        "device": {
            "deviceId": "lrl-001",
            "name": "Living Room Light",
            "type": "Light",
            "location": "Living Room",
            "status": "Off",
            "properties": {
                "brightness": 0,
                "color": "warm white" // Other fields remain unchanged if not provided
            },
            "lastUpdated": "2025-06-27T10:40:00Z"
        }
    }
    ```

    **Error Response (HTTP 404 Not Found / 400 Bad Request)**:
    ```json
    {
        "error": "Device with ID 'non-existent-id' not found"
    }
    ```

### 5. Delete a Device

* **HTTP Method**: `DELETE`
* **Path**: `/devices/{deviceId}`
* **Lambda Function**: `smartHomeDeleteDevice`
* **Description**: Removes a smart home device record from the system.

    **Path Parameters**:
    * `deviceId`: The unique identifier of the device to delete.

    **Success Response (HTTP 200 OK)**:
    ```json
    {
        "message": "Device 'lrl-001' deleted successfully"
    }
    ```

    **Error Response (HTTP 404 Not Found)**:
    ```json
    {
        "error": "Device with ID 'non-existent-id' not found"
    }
    ```
