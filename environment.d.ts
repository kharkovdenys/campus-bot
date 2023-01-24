declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TELEGRAM_TOKEN: string;
      NODE_ENV?: "development" | "production";
      PORT?: number;
      CONNECTION_STRING: string;
      DATAYEAR: string;
      DATASEM: string;
    }
  }
}

export { };
