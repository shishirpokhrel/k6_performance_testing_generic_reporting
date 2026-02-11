import http from 'k6/http';
import { check } from 'k6';
import { generateReport } from 'k6-modern-report';

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
