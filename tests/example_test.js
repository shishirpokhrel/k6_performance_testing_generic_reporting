import { api } from '../utils/generic-requests.js';
import { generateReport } from '../utils/reporting.js';
import { userConfig } from '../config/user_config.js';

// Load Scenarios
const scenarios = JSON.parse(open('../config/scenarios.json'));

// Select scenario based on environment variable, default to 'smoke'
const selectedScenario = __ENV.SCENARIO || 'smoke';

export const options = {
    scenarios: {
        [selectedScenario]: scenarios[selectedScenario]
    },
    thresholds: {
        http_req_failed: ['rate<0.05'], // http errors should be less than 5%
        http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2000ms
    },
};

export default function () {
    const baseUrl = userConfig.baseUrl;
    const headers = userConfig.headers;

    // --- Example usage using the new Simplified API ---
    // User only needs to call api.get, api.post etc.
    
    // GET Request example
    // api.get(`${baseUrl}${userConfig.endpoints.get}`, headers, { tags: { name: 'GetCrocodiles' } });

    // POST Request example
    // api.post(`${baseUrl}${userConfig.endpoints.post}`, userConfig.payloads.post, headers, { tags: { name: 'RegisterUser' } });
    
    console.log(`Running ${selectedScenario} test on ${baseUrl}`);
    
    // Simple verification request
    api.get('https://test.k6.io', {}, { tags: { name: 'SimpleDemo' } });
}

export function handleSummary(data) {
    return generateReport(data, `reports/performance-test-report.html`);
}
