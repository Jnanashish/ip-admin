/**
 * Centralized API configuration
 * Contains API endpoints, request timeouts, and other API-related constants
 */

// API endpoints from separate files
export { apiEndpoint } from "../Helpers/apiEndpoints";

// Request timeouts (in milliseconds)
export const requestTimeouts = {
    short: 5000,    // 5 seconds
    standard: 15000, // 15 seconds
    long: 30000,    // 30 seconds
};

// Status codes
export const statusCodes = {
    success: 200,
    created: 201,
    badRequest: 400,
    unauthorized: 401,
    forbidden: 403,
    notFound: 404,
    serverError: 500,
};

// API keys (these should be moved to environment variables in production)
export const apiKeys = {
    // References to environment variables
    BOT_API_KEY: process.env.REACT_APP_BOT_API_KEY,
    MY_CHANNEL_NAME: process.env.REACT_APP_MY_CHANNEL_NAME,
    TOKEN: process.env.REACT_APP_TOKEN,
}; 