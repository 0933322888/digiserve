
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
const { verifyCredentials, createSessionToken, verifyPassword } = await import('../lib/auth-service.js');
const { verifySessionToken } = await import('../lib/auth-edge.js');
const { default: connectDB } = await import('../lib/db/mongodb-connection.js');
const { getUserModel } = await import('../lib/db/models.js');
const mongoose = (await import('mongoose')).default;

async function verifyAuth() {
    console.log('Connecting to DB...');
    await connectDB();
    console.log('Connected.');

    try {
        const email = 'admin@trio.app';
        const password = 'password123';

        // 1. Debug: Check User directly
        console.log('\nDebugging User...');
        const User = getUserModel();
        const debugUser = await User.findOne({ email });

        if (!debugUser) {
            console.log('❌ Debug: User NOT found in DB!');
        } else {
            console.log('✅ Debug: User found:', debugUser.email);
            console.log('   Debug: Password Hash:', debugUser.passwordHash);

            const isMatch = await verifyPassword(password, debugUser.passwordHash);
            console.log('   Debug: Password match?', isMatch);
        }

        // 2. Test Login
        console.log('\nTesting verifyCredentials...');
        const user = await verifyCredentials(email, password);

        if (user) {
            console.log('✅ Login successful:', user.email);
            console.log('   Tenant IDs:', user.tenantIds);
        } else {
            console.error('❌ Login failed!');
            process.exit(1);
        }

        // 3. Test Token Creation
        console.log('\nTesting createSessionToken...');
        const token = await createSessionToken(user);
        console.log('✅ Token created.');

        // 4. Test Token Verification (Edge compatible)
        console.log('\nTesting verifySessionToken...');
        const payload = await verifySessionToken(token);

        if (payload) {
            console.log('✅ Token verified.');
            console.log('   Payload:', payload);

            // 5. Test Tenant Access Logic (Simulating Middleware)
            console.log('\nTesting Tenant Access Logic...');
            const targetTenant = 'bar_1';
            const hasAccess = payload.tenantIds.includes(targetTenant);

            if (hasAccess) {
                console.log(`✅ User has access to ${targetTenant}`);
            } else {
                console.error(`❌ User missing access to ${targetTenant}`);
            }

            const badTenant = 'bar_999';
            const hasBadAccess = payload.tenantIds.includes(badTenant);
            if (!hasBadAccess) {
                console.log(`✅ User correctly denied access to ${badTenant}`);
            } else {
                console.error(`❌ User incorrectly granted access to ${badTenant}`);
            }

        } else {
            console.error('❌ Token verification failed!');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

verifyAuth();
