import json
import os
import datetime
import boto3
from botocore.exceptions import ClientError

# Initialize DynamoDB client
DYNAMODB_TABLE_NAME = os.environ.get('DYNAMODB_TABLE_NAME', 'SmartHomeDevices')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(DYNAMODB_TABLE_NAME)

def lambda_handler(event, context):
    """
    Handles the update of an existing smart home device record in DynamoDB.
    Expected event path parameters: /{deviceId}
    Expected event body: JSON object with fields to update (e.g., {"status": "On", "location": "Bedroom"})
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

        # API Gateway sends the request body as a string
        if 'body' not in event:
            return {
                'statusCode': 400,
                'headers': { 'Content-Type': 'application/json' },
                'body': json.dumps({'error': 'Request body is missing.'})
            }

        body = json.loads(event['body'])

        if not body:
            return {
                'statusCode': 400,
                'headers': { 'Content-Type': 'application/json' },
                'body': json.dumps({'error': 'Request body cannot be empty for update operation.'})
            }

        # Build UpdateExpression and ExpressionAttributeValues
        update_expression_parts = []
        expression_attribute_values = {}
        expression_attribute_names = {}
        
        # Add lastUpdated timestamp automatically
        body['lastUpdated'] = datetime.datetime.utcnow().isoformat() + 'Z'

        for key, value in body.items():
            # Avoid updating the primary key (deviceId)
            if key == 'deviceId':
                continue
            
            # For nested objects like 'properties', you might need more complex logic
            # This simple example assumes flat updates or overwriting properties.
            # For truly granular nested updates, consider using DynamoDB's SET action with nested paths.
            
            update_expression_parts.append(f'#{key} = :{key}')
            expression_attribute_values[f':{key}'] = value
            expression_attribute_names[f'#{key}'] = key


        if not update_expression_parts:
            return {
                'statusCode': 400,
                'headers': { 'Content-Type': 'application/json' },
                'body': json.dumps({'error': 'No valid fields provided for update.'})
            }

        update_expression = 'SET ' + ', '.join(update_expression_parts)

        # Perform the update operation
        # ReturnValues='ALL_NEW' retrieves the item after it's updated
        response = table.update_item(
            Key={'deviceId': device_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ExpressionAttributeNames=expression_attribute_names,
            ReturnValues='ALL_NEW'
        )

        updated_item = response.get('Attributes')

        if not updated_item:
            # This case should theoretically not happen if the item existed for update
            # unless the update expression was invalid or some other edge case.
            print(f"Update operation for {device_id} did not return attributes.")
            return {
                'statusCode': 500,
                'headers': { 'Content-Type': 'application/json' },
                'body': json.dumps({'error': 'Could not retrieve updated item details.'})
            }

        print(f"Successfully updated device: {device_id}")

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Device updated successfully',
                'device': updated_item
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
        # Check if the error is due to item not found (e.g., ConditionalCheckFailedException if using conditions)
        # For update_item, if the item doesn't exist, it will create it by default unless a condition is set.
        # This basic example will create if not exists. For "update only if exists", use ConditionExpression.
        print(f"DynamoDB ClientError: {e.response['Error']['Message']}")
        return {
            'statusCode': 500,
            'headers': { 'Content-Type': 'application/json' },
            'body': json.dumps({'error': 'Could not update device due to a database error.'})
        }
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {
            'statusCode': 500,
            'headers': { 'Content-Type': 'application/json' },
            'body': json.dumps({'error': 'An unexpected error occurred.', 'details': str(e)})
        }
