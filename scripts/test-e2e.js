import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const match = line.match(/^([^=:#]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    });
}

// Dynamic imports
const { default: connectDB } = await import('../lib/db/mongodb-connection.js');
const { getUserModel, getRestaurantModel } = await import('../lib/db/models.js');
const mongoose = (await import('mongoose')).default;

async function testE2E() {
    console.log('🧪 End-to-End Multi-Tenancy Test\n');
    console.log('='.repeat(50));

    try {
        // 1. Connect to Database
        console.log('\n📡 Step 1: Connecting to database...');
        await connectDB();
        console.log('✅ Connected to MongoDB');

        // 2. Verify Tenant Exists
        console.log('\n🏢 Step 2: Verifying tenant exists...');
        const Restaurant = getRestaurantModel();
        const tenant = await Restaurant.findOne({ barId: 'bar_1' });

        if (!tenant) {
            console.log('❌ Tenant bar_1 not found!');
            console.log('   Run: node scripts/create-admin.js');
            process.exit(1);
        }
        console.log('✅ Tenant found:', tenant.name);

        // 3. Verify User Exists
        console.log('\n👤 Step 3: Verifying user exists...');
        const User = getUserModel();
        const user = await User.findOne({ email: 'admin@trio.app' });

        if (!user) {
            console.log('❌ Admin user not found!');
            console.log('   Run: node scripts/create-admin.js');
            process.exit(1);
        }
        console.log('✅ User found:', user.email);
        console.log('   Role:', user.role);
        console.log('   Tenant Access:', user.tenantIds);

        // 4. Verify User Has Access to Tenant
        console.log('\n🔐 Step 4: Verifying user access to tenant...');
        const hasAccess = user.tenantIds.includes('bar_1');

        if (!hasAccess) {
            console.log('❌ User does not have access to bar_1!');
            process.exit(1);
        }
        console.log('✅ User has access to bar_1');

        // 5. Test Authentication Flow
        console.log('\n🔑 Step 5: Testing authentication...');
        const { verifyCredentials } = await import('../lib/auth-service.js');
        const authenticatedUser = await verifyCredentials('admin@trio.app', 'password123');

        if (!authenticatedUser) {
            console.log('❌ Authentication failed!');
            process.exit(1);
        }
        console.log('✅ Authentication successful');

        // 6. Test JWT Token Creation
        console.log('\n🎫 Step 6: Testing JWT token creation...');
        const { createSessionToken } = await import('../lib/auth-service.js');
        const token = await createSessionToken(authenticatedUser);

        if (!token) {
            console.log('❌ Token creation failed!');
            process.exit(1);
        }
        console.log('✅ JWT token created');

        // 7. Test JWT Token Verification
        console.log('\n✔️  Step 7: Testing JWT token verification...');
        const { verifySessionToken } = await import('../lib/auth-edge.js');
        const payload = await verifySessionToken(token);

        if (!payload) {
            console.log('❌ Token verification failed!');
            process.exit(1);
        }
        console.log('✅ Token verified');
        console.log('   User ID:', payload.userId);
        console.log('   Email:', payload.email);
        console.log('   Role:', payload.role);
        console.log('   Tenant IDs:', payload.tenantIds);

        // 8. Test Tenant Access Control
        console.log('\n🛡️  Step 8: Testing tenant access control...');
        const canAccessBar1 = payload.tenantIds.includes('bar_1');
        const canAccessBar999 = payload.tenantIds.includes('bar_999');

        if (!canAccessBar1) {
            console.log('❌ Should have access to bar_1!');
            process.exit(1);
        }
        if (canAccessBar999) {
            console.log('❌ Should NOT have access to bar_999!');
            process.exit(1);
        }
        console.log('✅ Access control working correctly');
        console.log('   ✓ Has access to bar_1');
        console.log('   ✓ Denied access to bar_999');

        // Success!
        console.log('\n' + '='.repeat(50));
        console.log('🎉 All tests passed!');
        console.log('='.repeat(50));
        console.log('\n✅ Multi-tenancy system is working correctly');
        console.log('✅ Authentication flow verified');
        console.log('✅ Tenant isolation enforced');
        console.log('\n📝 Next steps:');
        console.log('   1. Start the dev server: npm run dev');
        console.log('   2. Visit: http://localhost:3000/admin/login');
        console.log('   3. Login with: admin@trio.app / password123');

    } catch (error) {
        console.error('\n❌ Test failed with error:', error.message);
        console.error('\nStack trace:', error.stack);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n📡 Disconnected from database');
    }
}

testE2E();
