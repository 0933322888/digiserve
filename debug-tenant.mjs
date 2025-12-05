
import fs from 'fs';
import path from 'path';

// Manually load .env.local
try {
    const envConfig = fs.readFileSync('.env.local', 'utf8');
    envConfig.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            let value = parts.slice(1).join('=').trim();
            // Remove quotes if present
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            if (key && value) {
                process.env[key] = value;
            }
        }
    });
    console.log('Loaded env keys:', Object.keys(process.env).filter(k => !k.startsWith('npm_')));
} catch (e) {
    console.error('Failed to load .env.local', e);
}

async function run() {
    try {
        // Dynamic imports after env is loaded
        const { getRestaurantModel } = await import('./lib/db/models.js');
        const connectDB = (await import('./lib/db/mongodb-connection.js')).default;
        const mongoose = (await import('mongoose')).default;

        await connectDB();

        console.log('Connected to DB. Listing collections:');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const Restaurant = getRestaurantModel();
        console.log('Counting tenants:');
        const count = await Restaurant.countDocuments();
        console.log(`Total tenants: ${count}`);

        const tenantId = 'tenant_1764731432995_9f1qdu';
        console.log(`Checking specific tenant: ${tenantId}`);
        const tenant = await Restaurant.findOne({ barId: tenantId });

        if (tenant) {
            console.log('Tenant found:');
            console.log(JSON.stringify(tenant, null, 2));
        } else {
            console.log('Tenant NOT found');
        }
    } catch (error) {
        console.error('Error:', error);
    }
    process.exit(0);
}

run();
