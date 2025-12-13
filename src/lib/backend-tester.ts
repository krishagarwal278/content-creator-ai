/**
 * Backend Connection Tester
 * A simple utility to test if the backend is reachable
 */

import { apiClient } from '@/lib/api-client';

export interface ConnectionStatus {
  connected: boolean;
  message: string;
  latency?: number;
  error?: string;
}

/**
 * Test the connection to the backend
 */
export async function testBackendConnection(): Promise<ConnectionStatus> {
  const startTime = performance.now();

  try {
    // Try to fetch projects (or any endpoint)
    await apiClient.get('/api/projects');
    
    const endTime = performance.now();
    const latency = Math.round(endTime - startTime);

    return {
      connected: true,
      message: 'Successfully connected to backend',
      latency,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      connected: false,
      message: 'Failed to connect to backend',
      error: errorMessage,
    };
  }
}

/**
 * Get the backend URL from environment
 */
export function getBackendUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
}

/**
 * Check if backend URL is configured
 */
export function isBackendConfigured(): boolean {
  const url = getBackendUrl();
  return url !== '' && url !== undefined;
}
