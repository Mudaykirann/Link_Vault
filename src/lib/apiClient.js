import { config } from '../config';

/**
 * Wraps fetch requests with automatic token refresh on 401 responses
 * Automatically handles token refresh and request retry on authentication failure
 */
export const apiClient = async (url, options = {}, onUnauthorized = null) => {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const requestOptions = {
        ...options,
        headers,
    };

    let response = await fetch(url, requestOptions);

    // Handle 401 Unauthorized - attempt token refresh
    if (response.status === 401) {
        const refreshed = await refreshToken();

        if (refreshed) {
            // Retry the original request with the new token
            const newToken = localStorage.getItem('token');
            requestOptions.headers['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(url, requestOptions);
        } else {
            // Token refresh failed, notify caller
            if (onUnauthorized) {
                onUnauthorized();
            } else {
                // Default: clear auth and redirect to login
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
    }

    return response;
};

/**
 * Refreshes the auth token using the refresh token
 * Returns true if successful, false otherwise
 */
export const refreshToken = async () => {
    try {
        const refreshTokenValue = localStorage.getItem('refresh_token');

        if (!refreshTokenValue) {
            return false;
        }

        const response = await fetch(`${config.apiUrl}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshTokenValue }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);

            // Update refresh token if provided
            if (data.refresh_token) {
                localStorage.setItem('refresh_token', data.refresh_token);
            }

            return true;
        } else {
            // Refresh failed, clear tokens
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            return false;
        }
    } catch (error) {
        console.error('Token refresh error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        return false;
    }
};
