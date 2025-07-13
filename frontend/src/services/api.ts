import type { CrawlResult } from '../App';

const API_BASE_URL = 'http://localhost:3000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || 'Request failed',
          details: data.details,
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Get all crawl results
  async getCrawlResults(): Promise<ApiResponse<CrawlResult[]>> {
    return this.request<CrawlResult[]>('/urls');
  }

  // Add URL to database
  async addURL(url: string): Promise<ApiResponse<CrawlResult>> {
    return this.request<CrawlResult>('/urls', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  // Run crawler for a URL
  async runCrawler(url: string): Promise<ApiResponse<CrawlResult>> {
    return this.request<CrawlResult>('/urls/crawl', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  // Delete a single URL
  async deleteURL(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/urls/${id}`, {
      method: 'DELETE',
    });
  }

  // Delete multiple URLs
  async deleteMultipleURLs(ids: number[]): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/urls', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request<{ status: string }>('/health');
  }
}

export const apiService = new ApiService(); 