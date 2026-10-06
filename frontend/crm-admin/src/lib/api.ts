import type {
  Customer,
  Conversation,
  Message,
  Lead,
  LeadScore,
  CustomerConversationSummary,
  CustomerHistoryResponse,
  TimelineEvent,
  LeadScoreStats,
  PaginatedResponse,
  ApiResponse,
} from "./types";

const API_BASE = "/api/v1";

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json();
  
  if (!response.ok) {
    return {
      success: false,
      message: data.message || "خطای سرور",
    };
  }

  return data;
}

export const crmApi = {
  // Dashboard
  getLeadStats: () => fetchApi<LeadScoreStats>("/crm/dashboard/lead-stats"),

  // Lead Scoring
  calculateLeadScore: (customerId: string, leadId?: string) =>
    fetchApi<LeadScore>("/crm/lead-score/calculate", {
      method: "POST",
      body: JSON.stringify({ customerId, leadId }),
    }),

  getLeadScore: (customerId: string) =>
    fetchApi<LeadScore>(`/crm/lead-score/${customerId}`),

  getLeadsByTemperature: (temperature: "COLD" | "WARM" | "HOT") =>
    fetchApi<LeadScore[]>(`/crm/lead-score/temperature/${temperature}`),

  // Customer Conversations
  getCustomerConversations: (customerId: string, page = 1, limit = 20) =>
    fetchApi<PaginatedResponse<CustomerConversationSummary>>(
      `/crm/customers/${customerId}/conversations?page=${page}&limit=${limit}`
    ),

  getCustomerHistory: (customerId: string) =>
    fetchApi<CustomerHistoryResponse>(`/crm/customers/${customerId}/history`),

  getCustomerTimeline: (customerId: string, page = 1, limit = 50) =>
    fetchApi<PaginatedResponse<TimelineEvent>>(
      `/crm/customers/${customerId}/timeline?page=${page}&limit=${limit}`
    ),

  getCustomerProfile: (customerId: string) =>
    fetchApi<CustomerHistoryResponse & { timeline: TimelineEvent[]; leadScore: LeadScore | null }>(
      `/crm/customers/${customerId}/profile`
    ),

  // Conversation Details
  getConversationDetails: (conversationId: string) =>
    fetchApi<{
      conversation: Conversation;
      customer: Customer | null;
      leadScore: LeadScore | null;
      messages: Message[];
    }>(`/crm/conversations/${conversationId}`),

  getConversationMessages: (conversationId: string, page = 1, limit = 50) =>
    fetchApi<PaginatedResponse<Message>>(
      `/crm/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    ),
};

// Customer API
export const customerApi = {
  getCustomers: (page = 1, limit = 20, search = "") =>
    fetchApi<PaginatedResponse<Customer>>(
      `/customers?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}`
    ),

  getCustomer: (id: string) =>
    fetchApi<Customer>(`/customers/${id}`),

  createCustomer: (data: Partial<Customer>) =>
    fetchApi<Customer>("/customers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    fetchApi<{ user: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => fetchApi<any>("/auth/me"),
};