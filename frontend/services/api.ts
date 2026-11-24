import axios from 'axios';
import {
  User,
  UserPublic,
  Project,
  ProjectListResponse,
  Comment,
  Category,
  DashboardStats,
  AdminStats,
  ProjectReport,
} from '../types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach bearer token if stored locally
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('projecthub_token');
      if (token && config.headers && !config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error normalization
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Format image URL helper
export function getAssetUrl(url?: string | null): string {
  if (!url) return '/placeholder-project.png';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
  return `${API_BASE_URL}/${url}`;
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------
export const authApi = {
  register: async (payload: { name: string; email: string; password: string }) => {
    const res = await apiClient.post<{ access_token: string; token_type: string; user: User }>('/auth/register', payload);
    return res.data;
  },
  login: async (payload: { email: string; password: string }) => {
    const res = await apiClient.post<{ access_token: string; token_type: string; user: User }>('/auth/login', payload);
    return res.data;
  },
  logout: async () => {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },
};

// ---------------------------------------------------------------------------
// Projects API
// ---------------------------------------------------------------------------
export interface ProjectQuery {
  page?: number;
  page_size?: number;
  search?: string;
  category?: string;
  technology?: string;
  sort?: 'newest' | 'oldest' | 'title' | 'likes';
  is_featured?: boolean;
}

export const projectsApi = {
  list: async (params?: ProjectQuery) => {
    const res = await apiClient.get<ProjectListResponse>('/projects', { params });
    return res.data;
  },
  getFeatured: async (limit: number = 6) => {
    const res = await apiClient.get<Project[]>('/projects/featured', { params: { limit } });
    return res.data;
  },
  getById: async (id: number) => {
    const res = await apiClient.get<Project>(`/projects/${id}`);
    return res.data;
  },
  create: async (data: Partial<Project>) => {
    const res = await apiClient.post<Project>('/projects', data);
    return res.data;
  },
  update: async (id: number, data: Partial<Project>) => {
    const res = await apiClient.put<Project>(`/projects/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await apiClient.delete(`/projects/${id}`);
    return res.data;
  },
  like: async (id: number) => {
    const res = await apiClient.post<{ project_id: number; is_liked: boolean; likes_count: number }>(`/projects/${id}/like`);
    return res.data;
  },
  unlike: async (id: number) => {
    const res = await apiClient.delete<{ project_id: number; is_liked: boolean; likes_count: number }>(`/projects/${id}/like`);
    return res.data;
  },
  favorite: async (id: number) => {
    const res = await apiClient.post<{ project_id: number; is_favorited: boolean; favorites_count: number }>(`/projects/${id}/favorite`);
    return res.data;
  },
  unfavorite: async (id: number) => {
    const res = await apiClient.delete<{ project_id: number; is_favorited: boolean; favorites_count: number }>(`/projects/${id}/favorite`);
    return res.data;
  },
  report: async (id: number, reason: string) => {
    const res = await apiClient.post<ProjectReport>(`/projects/${id}/report`, { reason });
    return res.data;
  },
};

// ---------------------------------------------------------------------------
// Students & Dashboard API
// ---------------------------------------------------------------------------
export const studentsApi = {
  getProfile: async (userId: number) => {
    const res = await apiClient.get<UserPublic>(`/students/${userId}`);
    return res.data;
  },
  getProjects: async (userId: number) => {
    const res = await apiClient.get<Project[]>(`/students/${userId}/projects`);
    return res.data;
  },
  getMyProfile: async () => {
    const res = await apiClient.get<User>('/students/me/profile');
    return res.data;
  },
  updateProfile: async (data: Partial<User>) => {
    const res = await apiClient.put<User>('/students/me/profile', data);
    return res.data;
  },
  getDashboardStats: async () => {
    const res = await apiClient.get<DashboardStats>('/dashboard/stats');
    return res.data;
  },
  getDashboardProjects: async () => {
    const res = await apiClient.get<Project[]>('/dashboard/projects');
    return res.data;
  },
  getFavorites: async () => {
    const res = await apiClient.get<Project[]>('/favorites');
    return res.data;
  },
};

// ---------------------------------------------------------------------------
// Comments API
// ---------------------------------------------------------------------------
export const commentsApi = {
  list: async (projectId: number) => {
    const res = await apiClient.get<Comment[]>(`/projects/${projectId}/comments`);
    return res.data;
  },
  create: async (projectId: number, content: string) => {
    const res = await apiClient.post<Comment>(`/projects/${projectId}/comments`, { content });
    return res.data;
  },
  delete: async (commentId: number) => {
    const res = await apiClient.delete(`/comments/${commentId}`);
    return res.data;
  },
};

// ---------------------------------------------------------------------------
// Categories API
// ---------------------------------------------------------------------------
export const categoriesApi = {
  list: async () => {
    const res = await apiClient.get<Category[]>('/categories');
    return res.data;
  },
};

// ---------------------------------------------------------------------------
// Upload API
// ---------------------------------------------------------------------------
export const uploadApi = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<{ url: string; filename: string }>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};

// ---------------------------------------------------------------------------
// Admin API
// ---------------------------------------------------------------------------
export const adminApi = {
  getStats: async () => {
    const res = await apiClient.get<AdminStats>('/admin/stats');
    return res.data;
  },
  getAllProjects: async (status?: string) => {
    const res = await apiClient.get<Project[]>('/admin/projects', { params: { status } });
    return res.data;
  },
  moderateProject: async (projectId: number, payload: { is_hidden?: boolean; is_featured?: boolean }) => {
    const res = await apiClient.patch<Project>(`/admin/projects/${projectId}/moderate`, payload);
    return res.data;
  },
  getAllUsers: async () => {
    const res = await apiClient.get<User[]>('/admin/users');
    return res.data;
  },
  updateUserStatus: async (userId: number, payload: { is_active?: boolean; role?: string }) => {
    const res = await apiClient.patch<User>(`/admin/users/${userId}/status`, payload);
    return res.data;
  },
  getReports: async () => {
    const res = await apiClient.get<ProjectReport[]>('/admin/reports');
    return res.data;
  },
  updateReportStatus: async (reportId: number, status: 'pending' | 'reviewed' | 'dismissed') => {
    const res = await apiClient.patch<ProjectReport>(`/admin/reports/${reportId}`, { status });
    return res.data;
  },
  createCategory: async (category: { name: string; slug: string; description?: string; icon?: string }) => {
    const res = await apiClient.post<Category>('/categories', category);
    return res.data;
  },
  deleteCategory: async (categoryId: number) => {
    const res = await apiClient.delete(`/categories/${categoryId}`);
    return res.data;
  },
};
