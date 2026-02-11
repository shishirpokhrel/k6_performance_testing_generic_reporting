declare module 'k6-modern-report' {
    /**
     * Generates the test report using the modern HTML reporter package.
     * @param data - The k6 summary data object.
     * @param filename - The output filename for the HTML report (default: 'result.html').
     * @returns The summary object required by handleSummary.
     */
    export function generateReport(data: any, filename?: string): { [key: string]: string } | { stdout: string };
}
