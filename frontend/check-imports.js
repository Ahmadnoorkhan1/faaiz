const fs = require('fs');
const path = require('path');

// Import sources to check
const imports = [
  { name: 'HomePage', path: './src/pages/HomePage.tsx' },
  { name: 'Login', path: './src/pages/auth/Login.tsx' },
  { name: 'Register', path: './src/pages/auth/Register.tsx' },
  { name: 'ClientOnboarding', path: './src/pages/onboard/ClientOnboarding.tsx' },
  { name: 'ConsultantOnboarding', path: './src/pages/onboard/ConsultantOnboarding.tsx' },
  { name: 'Dashboard', path: './src/pages/Dashboard.tsx' },
  { name: 'NotFound', path: './src/pages/NotFound.tsx' }
];

// Check each import
imports.forEach(importItem => {
  const exists = fs.existsSync(importItem.path);
  console.log(`${importItem.name}: ${exists ? 'EXISTS ✅' : 'MISSING ❌'}`);
}); 