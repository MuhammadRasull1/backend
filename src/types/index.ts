import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: { telegramId: string; [key: string]: any };
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export interface TelegramWebAppInitData {
  query_id?: string;
  user?: any;
  auth_date?: number | string;
  hash?: string;
}

export interface CreateProjectDto {
  name: string;
  address: string;
  area: number;
  ceilingHeight: number;
  currency: string;
  commissionType: string;
  commissionValue: number;
  materials?: any[];
  workers?: any[];
  volumes?: any[];
}

export interface UpdateProjectDto {
  name?: string;
  address?: string;
  status?: string;
  area?: number;
  ceilingHeight?: number;
  currency?: string;
  commissionType?: string;
  commissionValue?: number;
  finalQuote?: number | null;
}