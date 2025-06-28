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
    Handles the deletion of a smart home device record from DynamoDB.
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

        # Attempt to delete the item
        response = table.delete_item(
            Key={'deviceId': device_id},
            ReturnValues='ALL_OLD' # Optionally return the deleted item if found
        )

        # Check if an item was actually deleted (ReturnValues='ALL_OLD' returns empty dict if item didn't exist)
        if not response.get('Attributes'):
            print(f"Attempted to delete device {device_id}, but it was not found.")
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f"Device with ID '{device_id}' not found."})
            }

        print(f"Successfully deleted device: {device_id}")

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'message': f"Device '{device_id}' deleted successfully"})
        }

    except ClientError as e:
        print(f"DynamoDB ClientError: {e.response['Error']['Message']}")
        return {
            'statusCode': 500,
            'headers': { 'Content-Type': 'application/json' },
            'body': json.dumps({'error': 'Could not delete device due to a database error.'})
        }
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {
            'statusCode': 500,
            'headers': { 'Content-Type': 'application/json' },
            'body': json.dumps({'error': 'An unexpected error occurred.', 'details': str(e)})
        }
