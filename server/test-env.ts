/**
 * Diagnostic script to check if GOOGLE_PLACES_API_KEY is loaded
 */

import { ENV } from './_core/env';

console.log('='.repeat(80));
console.log('ENVIRONMENT VARIABLE DIAGNOSTIC');
console.log('='.repeat(80));

console.log('\n📋 Checking GOOGLE_PLACES_API_KEY:');
console.log('  Raw process.env value:', process.env.GOOGLE_PLACES_API_KEY ? '✅ SET' : '❌ NOT SET');
if (process.env.GOOGLE_PLACES_API_KEY) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  console.log('  Length:', key.length);
  console.log('  First 10 chars:', key.substring(0, 10) + '...');
  console.log('  Last 10 chars:', '...' + key.substring(key.length - 10));
} else {
  console.log('  ❌ Environment variable is not set!');
}

console.log('\n📋 Checking ENV.googlePlacesApiKey:');
console.log('  Value:', ENV.googlePlacesApiKey ? '✅ SET' : '❌ NOT SET');
if (ENV.googlePlacesApiKey) {
  console.log('  Length:', ENV.googlePlacesApiKey.length);
  console.log('  First 10 chars:', ENV.googlePlacesApiKey.substring(0, 10) + '...');
} else {
  console.log('  ❌ ENV wrapper shows empty string!');
}

console.log('\n📋 Other environment variables:');
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? '✅ SET' : '❌ NOT SET');
console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('  VITE_APP_ID:', process.env.VITE_APP_ID ? '✅ SET' : '❌ NOT SET');

console.log('\n📋 Decision:');
if (ENV.googlePlacesApiKey) {
  console.log('  ✅ Google Places API will be used for geocoding');
} else {
  console.log('  ⚠️  OpenStreetMap fallback will be used (less accurate)');
}

console.log('\n' + '='.repeat(80));

