// Test script to verify frontend-backend connection
// Run this in the browser console or as a Node.js script

const API_BASE = 'http://localhost:8000/reserish';
const API_ENDPOINTS = {
  slots: `${API_BASE}/api/interview/slots/`,
  test: `${API_BASE}/api/`,
};

async function testConnection() {
  console.log('🧪 Testing Interview API Connection...');
  
  try {
    // Test 1: Check if backend is accessible
    console.log('📍 Testing backend accessibility...');
    const response = await fetch(API_ENDPOINTS.test);
    console.log('✅ Backend is accessible');
    
    // Test 2: Check interview slots endpoint (should require auth)
    console.log('📍 Testing interview slots endpoint...');
    const slotsResponse = await fetch(API_ENDPOINTS.slots);
    
    if (slotsResponse.status === 401) {
      console.log('✅ Interview API is working (authentication required)');
      console.log('📝 Response:', await slotsResponse.json());
    } else {
      console.log('⚠️ Unexpected response:', slotsResponse.status);
      console.log('📝 Response:', await slotsResponse.text());
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('🔍 Troubleshooting tips:');
    console.log('1. Ensure Django backend is running: python manage.py runserver');
    console.log('2. Check if the URL is correct:', API_BASE);
    console.log('3. Verify CORS settings in Django');
    console.log('4. Check browser console for CORS errors');
  }
}

// Run the test
testConnection();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testConnection, API_BASE, API_ENDPOINTS };
}
