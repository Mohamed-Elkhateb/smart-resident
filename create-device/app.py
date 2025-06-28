import json
import os
import uuid
import datetime
import boto3
from botocore.exceptions import ClientError

# Initialize DynamoDB client
# The table name will be an environment variable set during deployment (e.g., via SAM/CloudFormation)
DYNAMODB_TABLE_NAME = os.environ.get('DYNAMODB_TABLE_NAME', 'SmartHomeDevices')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(DYNAMODB_TABLE_NAME)

def lambda_handler(event, context):
    """
    Handles the creation of a new smart home device record in DynamoDB.
    Expected event body:
    {
        "deviceId": "string" (optional, will be generated if not provided)
        "name": "string",
        "type": "string",
        "location": "string" (optional),
        "status": "string",
        "properties": { "key": "value" } (optional)
    }
    """
    print(f"Received event: {json.dumps(event)}")

    try:
        # API Gateway sends the request body as a string
        if 'body' not in event:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Request body is missing.'})
            }

        body = json.loads(event['body'])

        # Validate required fields
        required_fields = ['name', 'type', 'status']
        for field in required_fields:
            if field not in body or not body[field]:
                return {
                    'statusCode': 400,
                    'headers': { 'Content-Type': 'application/json' },
                    'body': json.dumps({'error': f'Missing or empty required field: {field}'})
                }

        # Generate deviceId if not provided
        device_id = body.get('deviceId', str(uuid.uuid4()))

        # Prepare item for DynamoDB
        item = {
            'deviceId': device_id,
            'name': body['name'],
            'type': body['type'],
            'status': body['status'],
            'lastUpdated': datetime.datetime.utcnow().isoformat() + 'Z' # ISO 8601 format
        }

        if 'location' in body and body['location']:
            item['location'] = body['location']
        if 'properties' in body and isinstance(body['properties'], dict):
            item['properties'] = body['properties']

        # Put item into DynamoDB
        table.put_item(Item=item)

        print(f"Successfully created device: {device_id}")

        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Device created successfully',
                'device': item
            })
        }

    except json.JSONDecodeError:
        print("Invalid JSON in request body.")
        return {
            'statusCode': 400,
            'headers': { 'Content-Type': 'application/json' },
            'body': json.dumps({'error': 'Invalid JSON in request body.'})
        }
    except ClientError as e:
        print(f"DynamoDB ClientError: {e.response['Error']['Message']}")
        return {
            'statusCode': 500,
            'headers': { 'Content-Type': 'application/json' },
            'body': json.dumps({'error': 'Could not create device due to a database error.'})
        }
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {
            'statusCode': 500,
            'headers': { 'Content-Type': 'application/json' },
            'body': json.dumps({'error': 'An unexpected error occurred.', 'details': str(e)})
        }

