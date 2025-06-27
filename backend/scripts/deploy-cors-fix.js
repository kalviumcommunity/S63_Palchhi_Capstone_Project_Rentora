/**
 * CORS Fix Deployment Script
 * 
 * This script helps verify and update CORS settings for deployment.
 * Run with: node scripts/deploy-cors-fix.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('CORS Fix Deployment Script');
console.log('=========================');

// Check environment variables
console.log('\nChecking environment variables:');
const requiredVars = ['FRONTEND_URL', 'CLIENT_URL', 'ALLOWED_ORIGINS'];
let missingVars = false;

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.log(`❌ Missing ${varName} environment variable`);
    missingVars = true;
  } else {
    console.log(`✅ ${varName}: ${process.env[varName]}`);
  }
});

if (missingVars) {
  console.log('\n⚠️ Some required environment variables are missing. Please update your .env file.');
} else {
  console.log('\n✅ All required environment variables are present.');
}

// Parse allowed origins
console.log('\nAllowed Origins:');
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : [];

if (allowedOrigins.length === 0) {
  console.log('❌ No allowed origins found');
} else {
  allowedOrigins.forEach(origin => {
    console.log(`- ${origin}`);
  });
}

// Check if Netlify domain is included
const hasNetlifyDomain = allowedOrigins.some(origin => origin.includes('netlify.app'));
console.log(`\n${hasNetlifyDomain ? '✅' : '❌'} Netlify domain ${hasNetlifyDomain ? 'is' : 'is not'} included in allowed origins`);

// Check server.js for CORS configuration
const serverJsPath = path.join(__dirname, '..', 'server.js');
console.log(`\nChecking CORS configuration in ${serverJsPath}:`);

try {
  const serverJs = fs.readFileSync(serverJsPath, 'utf8');
  
  // Check for key CORS components
  const hasCorsMiddleware = serverJs.includes('app.use(cors(');
  const hasOptionsHandler = serverJs.includes('app.options(\'*\'');
  const hasAllowedOrigins = serverJs.includes('allowedOrigins');
  const hasNetlifyCheck = serverJs.includes('origin.includes(\'netlify.app\')');
  
  console.log(`${hasCorsMiddleware ? '✅' : '❌'} CORS middleware`);
  console.log(`${hasOptionsHandler ? '✅' : '❌'} OPTIONS request handler`);
  console.log(`${hasAllowedOrigins ? '✅' : '❌'} Allowed origins configuration`);
  console.log(`${hasNetlifyCheck ? '✅' : '❌'} Netlify domain check`);
  
  if (hasCorsMiddleware && hasOptionsHandler && hasAllowedOrigins && hasNetlifyCheck) {
    console.log('\n✅ CORS configuration looks good!');
  } else {
    console.log('\n⚠️ CORS configuration may be incomplete. Please check server.js.');
  }
} catch (error) {
  console.error(`\n❌ Error reading server.js: ${error.message}`);
}

console.log('\nDeployment Checklist:');
console.log('1. Update .env file with correct ALLOWED_ORIGINS');
console.log('2. Restart the server after making changes');
console.log('3. Test CORS with a preflight request');
console.log('4. Check server logs for any CORS-related errors');

console.log('\nTo test CORS, you can use curl:');
console.log(`curl -X OPTIONS -H "Origin: ${process.env.FRONTEND_URL}" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type" -v ${process.env.CLIENT_URL}/api/auth/login`);