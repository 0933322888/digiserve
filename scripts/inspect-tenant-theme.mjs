import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

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

const { default: connectDB } = await import('../lib/db/mongodb-connection.js');
const { getRestaurantModel } = await import('../lib/db/models.js');

async function main() {
    await connectDB();
    const Restaurant = getRestaurantModel();
    const restaurants = await Restaurant.find({}, 'barId name subdomain slug theme');
    console.log('--- RESTAURANTS THEME DATA ---');
    for (const r of restaurants) {
        console.log(`Tenant: ${r.name} (${r.barId})`);
        console.log('Theme:', JSON.stringify(r.theme, null, 2));
    }
    await mongoose.disconnect();
    process.exit(0);
}

main().catch(console.error);
