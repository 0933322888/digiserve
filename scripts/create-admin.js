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

// Dynamic imports to ensure env vars are loaded first
const { default: connectDB } = await import('../lib/db/mongodb-connection.js');
const { getUserModel, getRestaurantModel } = await import('../lib/db/models.js');
const { hashPassword } = await import('../lib/auth-service.js');

async function createAdmin() {
    console.log('Connecting to DB...');
    await connectDB();
    console.log('Connected.');

    try {
        const email = 'admin@trio.app';
        const password = 'password123';
        const tenantId = 'bar_1'; // Default tenant

        // 1. Create Tenant if not exists
        const Tenant = getRestaurantModel();
        let tenant = await Tenant.findOne({ barId: tenantId });

        if (!tenant) {
            console.log(`Creating default tenant: ${tenantId}...`);
            tenant = await Tenant.create({
                id: `tenant-${Date.now()}`,
                barId: tenantId,
                name: 'Trio Bistro',
                modules: ['ordering', 'reservations', 'social'],
                features: { analytics: true },
                settings: { currency: 'USD' }
            });
            console.log('✅ Tenant created.');
        } else {
            console.log('ℹ️ Tenant already exists.');
        }

        // 2. Create Admin User
        const User = getUserModel();
        let user = await User.findOne({ email });

        if (user) {
            console.log('ℹ️ Admin user already exists.');
            // Update password just in case
            const hashedPassword = await hashPassword(password);
            await User.updateOne({ email }, { passwordHash: hashedPassword, tenantIds: [tenantId] });
            console.log('✅ Admin password updated.');
        } else {
            console.log(`Creating admin user: ${email}...`);
            const hashedPassword = await hashPassword(password);
            user = await User.create({
                id: `user-${Date.now()}`,
                email,
                passwordHash: hashedPassword,
                name: 'Admin User',
                role: 'admin',
                tenantIds: [tenantId]
            });
            console.log('✅ Admin user created.');
        }

        console.log('\nLogin credentials:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

createAdmin();
