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
  value_formatted: string;
  status: 'LATE' | 'OK' | 'ACCOUNTED' | 'PENDING';
  occurrence: string;
  occurrence_formatted: string;
  description?: string;
  cateogry: string;
  date_ref: string;
  type_in: boolean;
  card_name: string;
  responsable_id?: number;
  responsable_name: string;
  installment_formatted: string;
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
  createAccount: (data:CreateAccountData) => Promise<{success:boolean, error:string}>;
  getUser: () => Promise<UserData|undefined>;
  getDefaultYearMonth: () => Promise<string>;
  getCards: () => Promise<Response<CardData[]>>;
  getRegistries: (params:{yearMonth?:string, cardId?:number}) => Promise<Response<RegistryData[]>>;
}

declare global {
  interface Window {
    pywebview?: {
      api: PyWebViewAPI;
    };
  }
}