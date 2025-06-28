#!/bin/bash
echo "Building and deploying Smart Home API..."

cd IaC
sam build
if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

sam deploy --guided
if [ $? -ne 0 ]; then
    echo "Deploy failed!"
    exit 1
fi

echo ""
echo "Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Copy the output values from above"
echo "2. Update frontend configuration files with:"
echo "   - API Gateway URL"
echo "   - Cognito User Pool ID"
echo "   - Cognito Client ID"
echo "3. Upload frontend files to S3 or serve locally"
echo ""