export const userConfig = {
    // Target Base URL
    baseUrl: 'https://test-api.k6.io',

    // Global Headers
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Optional
    },

    // Test specific configurations
    endpoints: {
        get: '/public/crocodiles/',
        post: '/user/register/',
        put: '/my/crocodiles/',
        update: '/my/crocodiles/'
    },

    // Payload for POST/PUT requests
    payloads: {
        post: {
            username: "test_user_001",
            first_name: "Test",
            last_name: "User",
            email: "test_user_001@example.com",
            password: "123"
        }
    }
};
