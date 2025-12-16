import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/trio";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        const database = client.db('trio');
        const restaurants = database.collection('restaurants');

        const query = { slug: 'trio' };
        const tenant = await restaurants.findOne(query);

        if (tenant) {
            console.log(`Found tenant: ${tenant.name} (ID: ${tenant.barId}, Slug: ${tenant.slug})`);
        } else {
            console.log("Tenant with slug 'restaurant' NOT found.");
            // List all tenants to see what's available
            const allTenants = await restaurants.find({}, { projection: { name: 1, slug: 1, barId: 1 } }).toArray();
            console.log("Available tenants:", allTenants);
        }
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
