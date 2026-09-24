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

async function checkDomains() {
    await connectDB();
    const db = mongoose.connection.db;
    const collection = db.collection('restaurants');

    const indexes = await collection.indexes();
    console.log('Indexes on restaurants:', JSON.stringify(indexes, null, 2));

    const docs = await collection.find({}).project({ _id: 1, barId: 1, name: 1, domain: 1, slug: 1 }).toArray();
    console.log('Documents in restaurants:', docs);

    await mongoose.disconnect();
    process.exit(0);
}

checkDomains().catch(console.error);
