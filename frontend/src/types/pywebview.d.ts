export interface AuthData {
  username: string;
  password: string;
  remember: boolean;
}

export interface CreateAccountData {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface PyWebViewAPI {
  authenticate: (data:AuthData) => Promise<boolean>;
  createAccount: (data:CreateAccountData) => Promise<{success:boolean, error:string}>;
  isAuthenticated: () => Promise<boolean>;
  isServerAvailable: () => Promise<boolean>;
}

declare global {
  interface Window {
    pywebview?: {
      api: PyWebViewAPI;
    };
  }
}