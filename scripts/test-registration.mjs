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

const { POST } = await import('../app/api/auth/register/route.js');
const { getRestaurantModel, getUserModel } = await import('../lib/db/models.js');

async function testRegistration() {
    console.log('Testing registration API with test tenant...');
    const testEmail = `testuser_${Date.now()}@example.com`;
    const testBusinessName = `Test Cafe ${Date.now()}`;
    const testSubdomain = `testcafe${Date.now()}`;

    const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: testEmail,
            password: 'password123',
            businessName: testBusinessName,
            subdomain: testSubdomain
        })
    });

    const response = await POST(request);
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);

    if (response.status !== 201) {
        console.error('Registration failed!');
        process.exit(1);
    }

    console.log('✅ Registration succeeded without duplicate key error!');

    // Cleanup test tenant and user
    const Restaurant = getRestaurantModel();
    const User = getUserModel();
    if (data.restaurant?.barId) {
        await Restaurant.deleteOne({ barId: data.restaurant.barId });
        await User.deleteOne({ email: testEmail });
        console.log('Cleaned up test tenant and test user.');
    }

    await mongoose.disconnect();
    process.exit(0);
}

testRegistration().catch(err => {
    console.error('Test error:', err);
    process.exit(1);
});
