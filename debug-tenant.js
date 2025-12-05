
const { getRestaurantModel } = require('./lib/db/models');
const connectDB = require('./lib/db/mongodb-connection').default;

async function run() {
    try {
        await connectDB();
        const Restaurant = getRestaurantModel();
        const tenantId = 'tenant_1764731432995_9f1qdu';
        console.log(`Fetching tenant: ${tenantId}`);
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
