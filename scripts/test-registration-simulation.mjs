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
const { getRestaurantModel, getUserModel } = await import('../lib/db/models.js');
const { hashPassword } = await import('../lib/auth-service.js');

async function testRegistrationSimulation() {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected.');

    const Restaurant = getRestaurantModel();
    const User = getUserModel();

    const timestamp = Date.now();
    const barId1 = `tenant_${timestamp}_${Math.random().toString(36).substring(7)}`;
    const businessName1 = `Test Bistro 1 ${timestamp}`;
    const slug1 = `test-bistro-1-${timestamp}`;

    const timestamp2 = Date.now() + 10;
    const barId2 = `tenant_${timestamp2}_${Math.random().toString(36).substring(7)}`;
    const businessName2 = `Test Bistro 2 ${timestamp2}`;
    const slug2 = `test-bistro-2-${timestamp2}`;

    console.log(`\nSimulating multiple Restaurant.create calls WITHOUT custom domain:`);
    try {
        const restaurant1 = await Restaurant.create({
            barId: barId1,
            name: businessName1,
            slug: slug1,
            customDomains: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        console.log('✅ Created restaurant 1 successfully (no domain):', restaurant1._id, restaurant1.id, restaurant1.barId);

        const restaurant2 = await Restaurant.create({
            barId: barId2,
            name: businessName2,
            slug: slug2,
            customDomains: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        console.log('✅ Created restaurant 2 successfully (no domain):', restaurant2._id, restaurant2.id, restaurant2.barId);

        console.log('\nSimulating Restaurant.create WITH custom domain:');
        const timestamp3 = Date.now() + 20;
        const customDom = `mycustom-${timestamp3}.com`;
        const restaurant3 = await Restaurant.create({
            barId: `tenant_${timestamp3}_${Math.random().toString(36).substring(7)}`,
            name: `Test Bistro 3 ${timestamp3}`,
            slug: `test-bistro-3-${timestamp3}`,
            customDomains: [customDom],
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        console.log('✅ Created restaurant 3 successfully (with domain):', restaurant3._id, restaurant3.customDomains);

        // Cleanup
        await Restaurant.deleteOne({ _id: restaurant1._id });
        await Restaurant.deleteOne({ _id: restaurant2._id });
        await Restaurant.deleteOne({ _id: restaurant3._id });
        console.log('Cleaned up test restaurants.');

        console.log('\n🎉 TEST PASSED! No E11000 duplicate key error.');
    } catch (err) {
        console.error('❌ Insertion failed:', err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

testRegistrationSimulation().catch(err => {
    console.error('Test run error:', err);
    process.exit(1);
});
