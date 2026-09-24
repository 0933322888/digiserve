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

async function fixRestaurants() {
    await connectDB();
    const db = mongoose.connection.db;
    const collection = db.collection('restaurants');

    console.log('Inspecting restaurants collection indexes before...');
    const indexesBefore = await collection.indexes();
    console.log('Current indexes:', indexesBefore.map(i => ({ name: i.name, key: i.key, unique: i.unique, sparse: i.sparse })));

    // 1. Assign `id` to existing restaurants if missing
    const missingIdRestaurants = await collection.find({ $or: [{ id: { $exists: false } }, { id: null }] }).toArray();
    console.log(`Found ${missingIdRestaurants.length} restaurant(s) missing 'id'.`);
    for (const r of missingIdRestaurants) {
        const generatedId = r.barId || `tenant_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await collection.updateOne({ _id: r._id }, { $set: { id: generatedId } });
        console.log(`Updated restaurant ${r.name} (_id: ${r._id}) with id: ${generatedId}`);
    }

    // 2. Drop the non-sparse unique index `id_1` if it exists
    const hasIdIndex = indexesBefore.some(i => i.name === 'id_1');
    if (hasIdIndex) {
        console.log('Dropping existing id_1 index...');
        try {
            await collection.dropIndex('id_1');
            console.log('Dropped id_1 index.');
        } catch (e) {
            console.error('Error dropping index:', e.message);
        }
    }

    // 3. Re-create `id_1` index as sparse and unique (matching schema)
    console.log('Re-creating id_1 index as unique + sparse...');
    await collection.createIndex({ id: 1 }, { unique: true, sparse: true, background: true });

    const indexesAfter = await collection.indexes();
    console.log('Updated indexes:', indexesAfter.map(i => ({ name: i.name, key: i.key, unique: i.unique, sparse: i.sparse })));

    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
}

fixRestaurants().catch(console.error);
