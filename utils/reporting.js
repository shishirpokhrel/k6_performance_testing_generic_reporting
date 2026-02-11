import { generateReport as reportingPackage } from 'k6-html-reporter-generic';

/**
 * Generates the test report using the modern HTML reporter package.
 * @param {object} data - The k6 summary data object.
 * @param {string} [filename='result.html'] - The output filename for the HTML report.
 * @returns {object} The summary object required by handleSummary.
 */
export function generateReport(data, filename = 'result.html') {
    return reportingPackage(data, filename);
}

export function generateReportWithName(data, testName) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `reports/${testName}-${timestamp}.html`;
    return {
        [filename]: htmlReport(data),
        stdout: textSummary(data, { indent: " ", enableColors: true }),
    };
}
