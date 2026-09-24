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

async function inspectIndexes() {
    await connectDB();
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:');
    for (const col of collections) {
        if (col.name === 'restaurants' || col.name === 'users') {
            const indexes = await db.collection(col.name).indexes();
            console.log(`\nIndexes for collection "${col.name}":`, JSON.stringify(indexes, null, 2));
            const count = await db.collection(col.name).countDocuments();
            console.log(`Count of documents in "${col.name}":`, count);
            const sample = await db.collection(col.name).find({}).project({ _id: 1, id: 1, barId: 1, name: 1, email: 1 }).toArray();
            console.log(`Documents in "${col.name}":`, sample);
        }
    }
    await mongoose.disconnect();
    process.exit(0);
}

inspectIndexes().catch(console.error);
