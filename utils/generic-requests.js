import http from 'k6/http';
import { check } from 'k6';

/**
 * Simplified Generic API Helper
 * Usage:
 *   api.get(url, headers, params)
 *   api.post(url, body, headers, params)
 */
export const api = {
    /**
     * Generic GET request
     * @param {string} url - Request URL
     * @param {object} [headers={}] - Request headers
     * @param {object} [params={}] - Additional k6 params (tags, timeouts, etc.)
     */
    get: (url, headers = {}, params = {}) => {
        const requestParams = { ...params, headers: { ...headers, ...(params.headers || {}) } };
        const res = http.get(url, requestParams);
        check(res, { 'status is 200': (r) => r.status === 200 });
        return res;
    },

    /**
     * Generic POST request
     * @param {string} url - Request URL
     * @param {any} body - Request body (automatically JSON stringified if object)
     * @param {object} [headers={}] - Request headers
     * @param {object} [params={}] - Additional k6 params
     */
    post: (url, body, headers = {}, params = {}) => {
        const payload = typeof body === 'object' ? JSON.stringify(body) : body;
        const requestParams = { ...params, headers: { ...headers, ...(params.headers || {}) } };
        const res = http.post(url, payload, requestParams);
        check(res, { 'status is 2xx': (r) => r.status >= 200 && r.status < 300 });
        return res;
    },

    /**
     * Generic PUT request
     * @param {string} url - Request URL
     * @param {any} body - Request body
     * @param {object} [headers={}] - Request headers
     * @param {object} [params={}] - Additional k6 params
     */
    put: (url, body, headers = {}, params = {}) => {
        const payload = typeof body === 'object' ? JSON.stringify(body) : body;
        const requestParams = { ...params, headers: { ...headers, ...(params.headers || {}) } };
        const res = http.put(url, payload, requestParams);
        check(res, { 'status is 2xx': (r) => r.status >= 200 && r.status < 300 });
        return res;
    },

    /**
     * Generic UPDATE (PATCH) request
     * @param {string} url - Request URL
     * @param {any} body - Request body
     * @param {object} [headers={}] - Request headers
     * @param {object} [params={}] - Additional k6 params
     */
    update: (url, body, headers = {}, params = {}) => {
        const payload = typeof body === 'object' ? JSON.stringify(body) : body;
        const requestParams = { ...params, headers: { ...headers, ...(params.headers || {}) } };
        const res = http.patch(url, payload, requestParams);
        check(res, { 'status is 2xx': (r) => r.status >= 200 && r.status < 300 });
        return res;
    }
};

// Keep old exports for backward compatibility if needed, using the new api
export const genericGet = (url, headers, tags) => api.get(url, headers, { tags });
export const genericPost = (url, body, headers, tags) => api.post(url, body, headers, { tags });
export const genericPut = (url, body, headers, tags) => api.put(url, body, headers, { tags });
export const genericUpdate = (url, body, headers, tags) => api.update(url, body, headers, { tags });

