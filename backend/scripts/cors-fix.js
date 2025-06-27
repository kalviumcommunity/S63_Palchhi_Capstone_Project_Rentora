/**
 * CORS Fix Script
 * 
 * This script helps verify and test CORS settings.
 * Run with: node scripts/cors-fix.js
 */

require('dotenv').config();
const axios = require('axios');
const chalk = require('chalk') || { green: (t) => t, red: (t) => t, yellow: (t) => t, blue: (t) => t };

const API_URL = process.env.API_URL || 'https://s63-palchhi-capstone-project-rentora.onrender.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://magical-otter-cbb01e.netlify.app';

console.log(chalk.blue('CORS Fix Testing Script'));
console.log(chalk.blue('======================'));
console.log();

// Test endpoints
const endpoints = [
  { method: 'GET', url: '/health', name: 'Health Check' },
  { method: 'GET', url: '/cors-test', name: 'CORS Test' },
  { method: 'OPTIONS', url: '/auth/login', name: 'Auth Login OPTIONS' },
  { method: 'OPTIONS', url: '/api/auth/login', name: 'API Auth Login OPTIONS' }
];

// Function to test an endpoint
async function testEndpoint(endpoint) {
  console.log(chalk.yellow(`Testing ${endpoint.name}: ${endpoint.method} ${endpoint.url}`));
  
  try {
    const response = await axios({
      method: endpoint.method,
      url: `${API_URL}${endpoint.url}`,
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log(chalk.green('✓ Success!'));
    console.log('  Status:', response.status);
    console.log('  CORS Headers:');
    console.log('    Access-Control-Allow-Origin:', response.headers['access-control-allow-origin'] || 'Not set');
    console.log('    Access-Control-Allow-Methods:', response.headers['access-control-allow-methods'] || 'Not set');
    console.log('    Access-Control-Allow-Headers:', response.headers['access-control-allow-headers'] || 'Not set');
    console.log();
    
    return true;
  } catch (error) {
    console.log(chalk.red('✗ Failed!'));
    
    if (error.response) {
      console.log('  Status:', error.response.status);
      console.log('  CORS Headers:');
      console.log('    Access-Control-Allow-Origin:', error.response.headers['access-control-allow-origin'] || 'Not set');
      console.log('    Access-Control-Allow-Methods:', error.response.headers['access-control-allow-methods'] || 'Not set');
      console.log('    Access-Control-Allow-Headers:', error.response.headers['access-control-allow-headers'] || 'Not set');
    } else {
      console.log('  Error:', error.message);
    }
    
    console.log();
    return false;
  }
}

// Run all tests
async function runTests() {
  let successCount = 0;
  
  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint);
    if (success) successCount++;
  }
  
  console.log(chalk.blue('Test Summary'));
  console.log(chalk.blue('============'));
  console.log(`Passed: ${successCount}/${endpoints.length}`);
  
  if (successCount === endpoints.length) {
    console.log(chalk.green('All tests passed! CORS should be working correctly.'));
  } else {
    console.log(chalk.yellow('Some tests failed. CORS may not be fully configured.'));
    
    console.log(chalk.blue('\nDeployment Checklist:'));
    console.log('1. Make sure your server has the latest code');
    console.log('2. Check that CORS is configured to allow requests from:', FRONTEND_URL);
    console.log('3. Ensure both /api/auth/login and /auth/login routes are working');
    console.log('4. Verify OPTIONS requests are handled correctly');
    console.log('5. Restart your server after making changes');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
});