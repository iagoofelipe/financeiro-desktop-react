import type { NewRegistryFormData } from "../components/NewRegistryForm";

export interface CreateAccountData {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface UserData {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

export interface ResponsableData {
  id: number;
  name: string;
}

export interface ConnectionRestoredData {
  authenticationRequired: boolean;
}

export interface CardData {
  id: number;
  name: string;
  closing_day: number;
  due_day: number;
  limit: number;
  closing_previous_month: boolean;
}

export interface RegistryData {
  id: number;
  title: string;
  value: number;
  status: 'LATE' | 'OK' | 'ACCOUNTED' | 'PENDING';
  occurrence: string;
  occurrence_formatted: string;
  description?: string;
  category: string;
  date_ref: string;
  type_in: boolean;
  card_name: string;
  responsable_id?: number;
  responsable_name: string;
  installment_formatted: string;
}

export interface BalanceData {
  total_in: number;
  total_in_progress: boolean;
  total_in_progress_description: string;
  total_out: number;
  total_out_progress: boolean;
  total_out_progress_description: string;
  prev_month_in: number;
  prev_month_out: number;
  current_balance: number;
}

export interface Response<T> {
  success:boolean;
  error:string;
  connectionError:boolean;
  data?:T;
}

export interface PyWebViewAPI {
  logout: () => Promise<void>;
  authenticate: (username: string, password: string, remember: boolean) => Promise<{success:boolean, error:string}>;
  isAuthenticated: () => Promise<boolean>;
  createAccount: (data:CreateAccountData) => Promise<Response<undefined>>;
  getUser: () => Promise<UserData|undefined>;
  getDefaultYearMonth: () => Promise<string>;
  getCards: () => Promise<Response<CardData[]>>;
  getRegistries: (params:{yearMonth?:string, cardId?:number}) => Promise<Response<RegistryData[]>>;
  getBalance: (params:{yearMonth?:string}) => Promise<Response<BalanceData>>;
  getSuggestionCategories: () => Promise<Response<string[]>>;
  deleteRegistryById: (id:number) => Promise<Response<null>>;
  addRegistry: (params:NewRegistryFormData) => Promise<Response<RegistryData>>;
  getResponsables: () => Promise<Response<ResponsableData[]>>;
  clearCache: () => Promise<void>;
}

declare global {
  interface Window {
    pywebview?: {
      api: PyWebViewAPI;
    };
  }
}