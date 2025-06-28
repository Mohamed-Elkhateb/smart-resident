// Frontend Configuration Helper
// Run this script after deployment to update frontend files with actual values

const fs = require('fs');
const path = require('path');

// Get values from command line arguments
const args = process.argv.slice(2);
if (args.length < 3) {
    console.log('Usage: node configure-frontend.js <API_URL> <USER_POOL_ID> <CLIENT_ID> [REGION]');
    console.log('Example: node configure-frontend.js https://abc123.execute-api.us-east-1.amazonaws.com/Stage us-east-1_ABC123 1234567890abcdef us-east-1');
    process.exit(1);
}

const [apiUrl, userPoolId, clientId, region = 'us-east-1'] = args;

// Update admin portal script
const adminScriptPath = path.join(__dirname, 'frontend', 'admin-portal', 'script.js');
let adminScript = fs.readFileSync(adminScriptPath, 'utf8');

adminScript = adminScript.replace('YOUR_USER_POOL_ID', userPoolId);
adminScript = adminScript.replace('YOUR_USER_POOL_CLIENT_ID', clientId);
adminScript = adminScript.replace('YOUR_API_GATEWAY_INVOKE_URL_HERE', apiUrl);
adminScript = adminScript.replace("region: 'us-east-1'", `region: '${region}'`);

fs.writeFileSync(adminScriptPath, adminScript);
console.log('✅ Updated admin portal configuration');

// Update mobile app script
const mobileScriptPath = path.join(__dirname, 'frontend', 'mobile-app-frontend', 'script.js');
let mobileScript = fs.readFileSync(mobileScriptPath, 'utf8');

mobileScript = mobileScript.replace('YOUR_USER_POOL_ID', userPoolId);
mobileScript = mobileScript.replace('YOUR_USER_POOL_CLIENT_ID', clientId);
mobileScript = mobileScript.replace('YOUR_API_GATEWAY_INVOKE_URL_HERE', apiUrl);
mobileScript = mobileScript.replace("region: 'us-east-1'", `region: '${region}'`);

fs.writeFileSync(mobileScriptPath, mobileScript);
console.log('✅ Updated mobile app configuration');

console.log('\n🎉 Frontend configuration complete!');
console.log('\nNext steps:');
console.log('1. Open frontend/admin-portal/index.html in your browser');
console.log('2. Open frontend/mobile-app-frontend/index.html in your browser');
console.log('3. Or upload the frontend folders to S3 for hosting');