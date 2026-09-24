import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const { verifySuperAdminCredentials, createSuperAdminSessionToken, verifySessionToken } = await import('../lib/auth-service.js');

async function testSuperAdmin() {
    console.log('Testing super-admin credential verification...');
    const user = await verifySuperAdminCredentials('superadmin@trio.app', 'superadmin123');
    if (!user) {
        console.error('❌ Failed to verify credentials');
        process.exit(1);
    }
    console.log('✅ Credentials valid:', user.email, user.role);

    console.log('Testing token generation...');
    const token = await createSuperAdminSessionToken(user);
    if (!token) {
        console.error('❌ Failed to create token');
        process.exit(1);
    }
    console.log('✅ Token generated successfully');

    console.log('Testing token verification...');
    const payload = await verifySessionToken(token);
    if (!payload || payload.role !== 'super-admin') {
        console.error('❌ Token payload invalid:', payload);
        process.exit(1);
    }
    console.log('✅ Token payload verified:', payload.role, payload.email);

    console.log('Testing wrong password rejection...');
    const invalidUser = await verifySuperAdminCredentials('superadmin@trio.app', 'wrongpass');
    if (invalidUser) {
        console.error('❌ Failed: Wrong password accepted!');
        process.exit(1);
    }
    console.log('✅ Wrong password rejected correctly');

    console.log('\n🎉 ALL SUPER-ADMIN AUTH TESTS PASSED!');
    process.exit(0);
}

testSuperAdmin().catch(err => {
    console.error('Error running test:', err);
    process.exit(1);
});
