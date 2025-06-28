@echo off
echo Building and deploying Smart Home API...

cd IaC
sam build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

sam deploy --guided
if %errorlevel% neq 0 (
    echo Deploy failed!
    pause
    exit /b 1
)

echo.
echo Deployment complete! 
echo.
echo Next steps:
echo 1. Copy the output values from above
echo 2. Update frontend configuration files with:
echo    - API Gateway URL
echo    - Cognito User Pool ID  
echo    - Cognito Client ID
echo 3. Upload frontend files to S3 or serve locally
echo.
pause