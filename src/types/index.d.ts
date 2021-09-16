interface NormalReturnType {
  data?: unknown;
  code?: number;
  msg?: string;
}

interface BaseReturnType {
  success: boolean;
}

declare type ApiReturnType = NormalReturnType & BaseReturnType;

export interface IOption {
  method: "GET" | "DELETE" | "HEAD" | "POST" | "PUT" | "PATCH";
  param?: Record<string, unknown>;
}
