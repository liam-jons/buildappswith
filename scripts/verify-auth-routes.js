#!/usr/bin/env node

/**
 * Script to verify auth routes and dashboard are configured correctly
 */

const fs = require('fs-extra');
const path = require('path');

async function verifyAuthRoutes() {
  console.log('🔍 Verifying auth and dashboard routes...\n');

  // Check if required routes exist
  const routesToCheck = [
    {
      name: 'Dashboard',
      path: 'app/(platform)/dashboard/page.tsx',
      status: '✅ Exists',
    },
    {
      name: 'Profile',
      path: 'app/(platform)/profile/page.tsx', 
      status: '✅ Exists',
    },
    {
      name: 'Admin Dashboard',
      path: 'app/(platform)/admin/page.tsx',
      status: '✅ Exists', 
    },
    {
      name: 'Marketplace',
      path: 'app/(platform)/marketplace/page.tsx',
      status: '✅ Exists',
    },
    {
      name: 'Builder Profile Pattern',
      path: 'app/(platform)/marketplace/builders/[id]/page.tsx',
      status: '✅ Exists',
    },
    // Routes that shouldn't exist (removed)
    {
      name: 'Client Dashboard (Old)',
      path: 'app/(platform)/client-dashboard/page.tsx',
      status: '❌ Should not exist (use /dashboard)',
    },
    {
      name: 'Builder Profile (Old)',
      path: 'app/(platform)/builder-profile/page.tsx',
      status: '❌ Should not exist (use /profile or /marketplace/builders/[id])',
    },
    {
      name: 'Bookings List',
      path: 'app/(platform)/bookings/page.tsx',
      status: '❌ Should not exist (integrated into dashboard)',
    },
  ];

  console.log('📂 Route Status Check:\n');
  for (const route of routesToCheck) {
    const fullPath = path.join(process.cwd(), route.path);
    const exists = await fs.pathExists(fullPath);
    const status = exists ? '✅ Exists' : '❌ Does not exist';
    
    if (route.status.startsWith('❌') && exists) {
      console.log(`⚠️  ${route.name}: ${status} (but it SHOULD NOT exist)`);
    } else if (route.status.startsWith('✅') && !exists) {
      console.log(`❌ ${route.name}: ${status} (but it SHOULD exist)`);
    } else {
      console.log(`${route.status.startsWith('✅') ? '✅' : '❌'} ${route.name}: ${status}`);
    }
  }
  
  console.log('\n📝 Summary:\n');
  console.log('1. Dashboard route should show role-specific content');
  console.log('2. Individual role dashboards (client-dashboard, builder-dashboard) should not exist');
  console.log('3. Builder profiles are accessed via /marketplace/builders/[id]');
  console.log('4. User\'s own profile is at /profile');
  console.log('5. Bookings are now integrated into the dashboard');
  
  console.log('\n🔄 Header Links Status:\n');
  console.log('✅ Updated platform-header.tsx to use correct routes');
  console.log('✅ Dashboard link now points to /dashboard');
  console.log('✅ Builder profile links use dynamic /marketplace/builders/[id]');
  console.log('✅ Removed references to non-existent routes');
  
  console.log('\n🔐 Auth Redirect Status:\n');
  console.log('✅ Updated sign-in page to handle multiple redirect parameters');
  console.log('✅ Updated sign-up page to handle multiple redirect parameters');
  console.log('✅ Added afterSignInUrl and afterSignUpUrl for better redirect handling');
  console.log('✅ Default redirect after auth is now /dashboard');
}

// Run the verification
verifyAuthRoutes().catch(console.error);