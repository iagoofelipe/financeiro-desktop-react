export interface AuthData {
  username: string;
  password: string;
  remember: boolean;
}

export interface PyWebViewAPI {
  authenticate: (data:AuthData) => Promise<boolean>
}

declare global {
  interface Window {
    pywebview?: {
      api: PyWebViewAPI;
    };
  }
}