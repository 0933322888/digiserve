
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local manually
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');

if (fs.existsSync(envPath)) {
    console.log('Loading .env.local...');
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} else {
    console.log('.env.local not found');
}

async function main() {
    // Dynamic imports to ensure env vars are loaded first
    const { getRestaurantModel, getUserModel } = await import('../lib/db/models.js');
    const connectDB = (await import('../lib/db/mongodb-connection.js')).default;

    await connectDB();
    const User = getUserModel();
    const Restaurant = getRestaurantModel();

    console.log('--- RESTAURANTS ---');
    const restaurants = await Restaurant.find({}, 'barId name subdomain domain');
    restaurants.forEach(r => {
        console.log(`Name: ${r.name}, ID: ${r.barId}, Subdomain: ${r.subdomain}`);
    });

    console.log('\n--- USERS ---');
    const users = await User.find({}, 'email name tenantIds role');
    users.forEach(u => {
        console.log(`Email: ${u.email}, Name: ${u.name}, Role: ${u.role}, TenantIDs: [${u.tenantIds.join(', ')}]`);
    });

    process.exit(0);
}

main().catch(console.error);
