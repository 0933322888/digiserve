// Test with explicit AUTH_SECRET
process.env.AUTH_SECRET = 'test-secret-key-for-jwt-signing-12345';

console.log('Testing signToken with explicit AUTH_SECRET...');
console.log('AUTH_SECRET:', process.env.AUTH_SECRET);

const { signToken } = await import('../lib/auth-edge.js');

try {
    const token = await signToken({
        userId: 'test123',
        email: 'test@test.com',
        name: 'Test User',
        role: 'admin',
        tenantIds: ['bar_1']
    });

    console.log('✅ Token created successfully!');
    console.log('Token preview:', token.substring(0, 50) + '...');

    // Now test verification
    const { verifySessionToken } = await import('../lib/auth-edge.js');
    const payload = await verifySessionToken(token);

    if (payload) {
        console.log('✅ Token verified successfully!');
        console.log('Payload:', payload);
    } else {
        console.log('❌ Token verification failed');
    }
} catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
}
