/**
 * Centralized API Client & Service Abstraction
 * Handles base URL configuration, bearer auth tokens, offline fallbacks, and typed responses
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  timestamp: string;
}

class ApiClient {
  private token: string | null = null;
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('cc_auth_token');
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('cc_auth_token', token);
      else localStorage.removeItem('cc_auth_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public async request<T>(
    endpoint: string, 
    options: RequestInit = {},
    mockFallback?: () => Promise<T>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    };

    try {
      // In development / prototype phase where backend is not yet spun up, gracefully use mockFallback
      const res = await fetch(url, { ...options, headers });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const json = await res.json();
      return json.data ?? json;
    } catch {
      // If network fails or backend isn't reachable, utilize mock fallback if provided
      if (mockFallback) {
        return await mockFallback();
      }
      throw new Error(`Unable to complete API request to ${endpoint}`);
    }
  }
}

export const apiClient = new ApiClient();
