// src/features/auth/auth.api.ts
import { api } from "../../../lib/api/client";
import type { LoginRequest, LoginResponse } from './auth.types';

export type SignupRequest = {
  loginId: string;
  password: string;
  nickname: string;
};

export const authApiLayer = {
  login: async (payload: LoginRequest) => {
    const res = await api.post<LoginResponse>('/auth/login', payload);
    return res.data;
  },

   signup: async (payload: SignupRequest) => {
    const res = await api.post<LoginResponse>('/auth/signup', payload);
    return res.data; 
  },
};
