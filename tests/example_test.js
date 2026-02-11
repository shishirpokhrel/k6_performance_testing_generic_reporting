import http from 'k6/http';
import { check } from 'k6';
import { generateReport } from '../node_modules/k6-modern-report/src/index.js';

export const options = {
    scenarios: {
        spike: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '10s', target: 100 },
                { duration: '1m', target: 100 },
                { duration: '10s', target: 0 }
            ]
        }
    }
};

export default function () {
    const baseUrl = 'https://test.k6.io';

    // Simple GET request
    const res = http.get(baseUrl);
    
    check(res, {
        'status is 200': (r) => r.status === 200,
    });
}

export function handleSummary(data) {
    return generateReport(data, `reports/performance-test-report.html`);
}
