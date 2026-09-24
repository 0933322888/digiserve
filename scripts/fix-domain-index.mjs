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

async function fixDomainIndex() {
    await connectDB();
    const db = mongoose.connection.db;
    const collection = db.collection('restaurants');

    console.log('1. Checking current restaurants with domain: null or empty...');
    const unsetResult = await collection.updateMany(
        { $or: [{ domain: null }, { domain: '' }] },
        { $unset: { domain: '' } }
    );
    console.log(`Unset domain field on ${unsetResult.modifiedCount} document(s).`);

    console.log('2. Inspecting indexes...');
    const indexes = await collection.indexes();
    const hasDomainIndex = indexes.some(i => i.name === 'domain_1');

    if (hasDomainIndex) {
        console.log('Dropping existing domain_1 index...');
        try {
            await collection.dropIndex('domain_1');
            console.log('Dropped domain_1 index.');
        } catch (e) {
            console.error('Error dropping domain_1 index:', e.message);
        }
    }

    console.log('3. Creating domain_1 index with partialFilterExpression { domain: { $type: "string" } }...');
    await collection.createIndex(
        { domain: 1 },
        {
            unique: true,
            partialFilterExpression: { domain: { $type: 'string' } },
            background: true
        }
    );

    const updatedIndexes = await collection.indexes();
    console.log('Updated indexes on restaurants:', updatedIndexes.map(i => ({
        name: i.name,
        key: i.key,
        unique: i.unique,
        partialFilterExpression: i.partialFilterExpression
    })));

    const remainingDocs = await collection.find({}).project({ _id: 1, barId: 1, name: 1, domain: 1 }).toArray();
    console.log('Current restaurant documents:', remainingDocs);

    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
}

fixDomainIndex().catch(console.error);
