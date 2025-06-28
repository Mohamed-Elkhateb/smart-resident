import json
import os
import boto3
from botocore.exceptions import ClientError

# Initialize DynamoDB client
DYNAMODB_TABLE_NAME = os.environ.get('DYNAMODB_TABLE_NAME', 'SmartHomeDevices')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(DYNAMODB_TABLE_NAME)

def lambda_handler(event, context):
    """
    Handles the retrieval of a single smart home device record from DynamoDB.
    Expected event path parameters: /{deviceId}
    """
    print(f"Received event: {json.dumps(event)}")

    try:
        # Extract deviceId from path parameters
        if 'pathParameters' not in event or not event['pathParameters'] or 'deviceId' not in event['pathParameters']:
            return {
                'statusCode': 400,
                'headers': { 'Content-Type': 'application/json' },
                'body': json.dumps({'error': 'Device ID is missing from path parameters.'})
            }

        device_id = event['pathParameters']['deviceId']

        # Get item from DynamoDB
        response = table.get_item(Key={'deviceId': device_id})

        item = response.get('Item')

        if not item:
            print(f"Device with ID {device_id} not found.")
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f"Device with ID '{device_id}' not found."})
            }

        print(f"Successfully retrieved device: {device_id}")

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(item)
        }

    except ClientError as e:
        print(f"DynamoDB ClientError: {e.response['Error']['Message']}")
        return {
            'statusCode': 500,
            'headers': { 'Content-Type': 'application/json' },
            'body': json.dumps({'error': 'Could not retrieve device due to a database error.'})
        }
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {
            'statusCode': 500,
            'headers': { 'Content-Type': 'application/json' },
            'body': json.dumps({'error': 'An unexpected error occurred.', 'details': str(e)})
        }
