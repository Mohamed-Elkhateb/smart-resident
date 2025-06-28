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
    Handles the retrieval of all smart home device records from DynamoDB.
    Supports optional 'limit' and 'exclusiveStartKey' query parameters for pagination.
    """
    print(f"Received event: {json.dumps(event)}")

    try:
        query_params = event.get('queryStringParameters', {}) or {}
        limit = int(query_params.get('limit', 100)) # Default limit
        exclusive_start_key = query_params.get('exclusiveStartKey')

        scan_params = {
            'Limit': limit
        }
        if exclusive_start_key:
            scan_params['ExclusiveStartKey'] = {'deviceId': exclusive_start_key}

        # Scan the DynamoDB table
        # NOTE: For large tables, 'Scan' operations can be inefficient and costly.
        # For production scenarios with large datasets, consider using 'Query' with an index
        # or implementing a more robust pagination strategy with 'LastEvaluatedKey'.
        response = table.scan(**scan_params)

        items = response.get('Items', [])
        last_evaluated_key = response.get('LastEvaluatedKey')

        print(f"Successfully retrieved {len(items)} devices.")

        response_body = {
            'devices': items
        }
        if last_evaluated_key:
            response_body['lastEvaluatedKey'] = last_evaluated_key['deviceId'] # Return the key for next page

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(response_body)
        }

    except ClientError as e:
        print(f"DynamoDB ClientError: {e.response['Error']['Message']}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Could not retrieve devices due to a database error.'})
        }
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {
            'statusCode': 500,
            'headers': { 'Content-Type': 'application/json' },
            'body': json.dumps({'error': 'An unexpected error occurred.', 'details': str(e)})
        }
