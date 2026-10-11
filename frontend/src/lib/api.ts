import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — inject Bearer token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — auto refresh on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = Cookies.get('refresh_token');
      if (!refreshToken) {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        window.location.href = '/auth/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
        Cookies.set('access_token', data.accessToken, { expires: 1 / 96 }); // 15 min
        api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: unknown) => api.post('/api/auth/register', data),
  login: (data: unknown) => api.post('/api/auth/login', data),
  refresh: (refreshToken: string) => api.post('/api/auth/refresh', { refreshToken }),
  logout: () => api.post('/api/auth/logout'),
};

// Products API
export const productApi = {
  getAll: (params?: unknown) => api.get('/api/products', { params }),
  getById: (id: number) => api.get(`/api/products/${id}`),
  search: (q: string, params?: unknown) => api.get('/api/products/search', { params: { q, ...params as object } }),
  topSelling: () => api.get('/api/products/top-selling'),
  create: (data: unknown) => api.post('/api/products', data),
  update: (id: number, data: unknown) => api.put(`/api/products/${id}`, data),
  delete: (id: number) => api.delete(`/api/products/${id}`),
};

// Categories API
export const categoryApi = {
  getAll: () => api.get('/api/categories'),
  create: (nom: string, description?: string, parentId?: number) =>
    api.post('/api/categories', null, { params: { nom, description, parentId } }),
  delete: (id: number) => api.delete(`/api/categories/${id}`),
};

// Cart API
export const cartApi = {
  get: () => api.get('/api/cart'),
  addItem: (data: unknown) => api.post('/api/cart/items', data),
  updateItem: (itemId: number, data: unknown) => api.put(`/api/cart/items/${itemId}`, data),
  removeItem: (itemId: number) => api.delete(`/api/cart/items/${itemId}`),
  applyCoupon: (code: string) => api.post('/api/cart/coupon', null, { params: { code } }),
  removeCoupon: () => api.delete('/api/cart/coupon'),
};

// Orders API
export const orderApi = {
  place: (data: unknown) => api.post('/api/orders', data),
  getById: (id: number) => api.get(`/api/orders/${id}`),
  myOrders: (params?: unknown) => api.get('/api/orders/my', { params }),
  getAll: (params?: unknown) => api.get('/api/orders', { params }),
  sellerOrders: (params?: unknown) => api.get('/api/orders/seller', { params }),
  updateStatus: (id: number, statut: string) => api.put(`/api/orders/${id}/status`, { statut }),
  cancel: (id: number) => api.put(`/api/orders/${id}/cancel`),
};

// Reviews API
export const reviewApi = {
  create: (data: unknown) => api.post('/api/reviews', data),
  getByProduct: (productId: number, params?: unknown) =>
    api.get(`/api/reviews/product/${productId}`, { params }),
  approve: (id: number) => api.put(`/api/reviews/${id}/approve`),
  getPending: () => api.get('/api/reviews/pending'),
  delete: (id: number) => api.delete(`/api/reviews/${id}`),
};

// Dashboard API
export const dashboardApi = {
  admin: () => api.get('/api/dashboard/admin'),
  seller: () => api.get('/api/dashboard/seller'),
};

// Coupons API
export const couponApi = {
  getAll: () => api.get('/api/coupons'),
  create: (data: unknown) => api.post('/api/coupons', data),
  delete: (id: number) => api.delete(`/api/coupons/${id}`),
  validate: (code: string) => api.get(`/api/coupons/validate/${code}`),
};


// Addresses API
export const addressApi = {
  getAll: () => api.get('/api/addresses'),
  create: (data: unknown) => api.post('/api/addresses', data),
  update: (id: number, data: unknown) => api.put(`/api/addresses/${id}`, data),
  delete: (id: number) => api.delete(`/api/addresses/${id}`),
  setPrimary: (id: number) => api.put(`/api/addresses/${id}/primary`),
};

// User Admin API
export const userAdminApi = {
  getAll: (params?: unknown) => api.get('/api/admin/users', { params }),
  activate: (id: number) => api.put(`/api/admin/users/${id}/activate`),
  deactivate: (id: number) => api.put(`/api/admin/users/${id}/deactivate`),
};

export default api;
