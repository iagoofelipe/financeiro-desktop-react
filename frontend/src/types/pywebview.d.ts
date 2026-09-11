export interface CreateAccountData {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface UserData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

export interface ConnectionRestoredData {
  authenticationRequired: boolean;
}

export interface PyWebViewAPI {
  logout: () => Promise<void>;
  authenticate: (username: string, password: string, remember: boolean) => Promise<{success:boolean, error:string}>;
  isAuthenticated: () => Promise<boolean>;
  createAccount: (data:CreateAccountData) => Promise<{success:boolean, error:string}>;
  getUser: () => Promise<UserData|undefined>;
  getDefaultYearMonth: () => Promise<string>;
}

declare global {
  interface Window {
    pywebview?: {
      api: PyWebViewAPI;
    };
  }
}