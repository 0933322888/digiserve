
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

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

async function verifySchema() {
    // Dynamic imports to ensure env vars are loaded first
    const { default: connectDB } = await import('../lib/db/mongodb-connection.js');
    const {
        getMenuModel,
        getReservationModel,
        getRestaurantModel,
        getUserModel
    } = await import('../lib/db/models.js');

    console.log('Connecting to DB...');
    await connectDB();
    console.log('Connected.');

    try {
        // 1. Test Menu Schema (should fail without barId)
        console.log('\nTesting Menu Schema validation...');
        const Menu = getMenuModel();
        try {
            await Menu.create({
                id: 'test-menu-1',
                name: 'Test Menu',
                // barId missing
            });
            console.error('❌ FAILED: Menu created without barId!');
        } catch (err) {
            if (err.errors && err.errors.barId) {
                console.log('✅ SUCCESS: Menu validation failed as expected (missing barId).');
            } else {
                console.error('❌ FAILED: Menu creation failed but not due to barId:', err.message);
            }
        }

        // 2. Test Tenant (Restaurant) Schema
        console.log('\nTesting Tenant Schema...');
        const Tenant = getRestaurantModel();
        const tenantId = `tenant-${Date.now()}`;
        const tenant = await Tenant.create({
            id: tenantId,
            barId: 'bar_test_1',
            name: 'Test Bar',
            modules: ['ordering', 'reservations'],
            features: { analytics: true },
            settings: { currency: 'USD' }
        });
        console.log('✅ SUCCESS: Tenant created:', tenant.barId);

        // 3. Test User Schema
        console.log('\nTesting User Schema...');
        const User = getUserModel();
        const user = await User.create({
            id: `user-${Date.now()}`,
            email: `test-${Date.now()}@example.com`,
            passwordHash: 'hashed_secret',
            name: 'Test User',
            role: 'manager',
            tenantIds: ['bar_test_1']
        });
        console.log('✅ SUCCESS: User created:', user.email);

        // Cleanup
        await Tenant.deleteOne({ id: tenantId });
        await User.deleteOne({ id: user.id });
        console.log('\nCleanup complete.');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

verifySchema();
