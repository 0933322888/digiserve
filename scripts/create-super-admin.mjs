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
const { getUserModel } = await import('../lib/db/models.js');
const { hashPassword } = await import('../lib/auth-service.js');

async function createSuperAdmin() {
    console.log('Connecting to DB...');
    await connectDB();
    console.log('Connected.');

    try {
        const email = process.argv[2] || 'superadmin@trio.app';
        const password = process.argv[3] || 'superadmin123';
        const name = process.argv[4] || 'Platform Super Admin';

        const User = getUserModel();
        let user = await User.findOne({ email: email.toLowerCase() });

        const hashedPassword = await hashPassword(password);

        if (user) {
            console.log(`ℹ️ User ${email} already exists. Updating role to super-admin and updating password...`);
            await User.updateOne(
                { email: email.toLowerCase() },
                {
                    passwordHash: hashedPassword,
                    role: 'super-admin',
                    name: name || user.name
                }
            );
            console.log('✅ Super admin user updated.');
        } else {
            console.log(`Creating super-admin user: ${email}...`);
            user = await User.create({
                id: `superadmin-${Date.now()}`,
                email: email.toLowerCase(),
                passwordHash: hashedPassword,
                name,
                role: 'super-admin',
                tenantIds: []
            });
            console.log('✅ Super admin user created.');
        }

        console.log('\nSuper Admin credentials:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`Role: super-admin`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

createSuperAdmin();
