import { message, notification } from "antd";
import axios from "axios";
import type { AxiosRequestConfig, AxiosInstance, AxiosResponse } from "axios";
import { IOption, ApiReturnType } from "../types";
import { RequestEnum } from "../enums/httpEnum";

const instance: AxiosInstance = axios.create({
  baseURL: "http://localhost:3000",
});
instance.defaults.headers.common['Content-Type'] = 'application/json';
instance.defaults.headers.common['Access-Control-Allow-Origin'] = "*";
/**
 * @description
 * @param url
 * @param options
 * @param config
 */
const fetch = (url: string, options: IOption, config?: AxiosRequestConfig) => {
  const { method = "get", param } = options;
  switch (method.toLowerCase()) {
    case "get":
      return instance.get(url, config);
    case "delete":
      return instance.delete(url, config);
    case "head":
      return instance.head(url, config);
    case "post":
      return instance.post(url, param, config);
    case "put":
      return instance.put(url, param, config);
    case "patch":
      return instance.patch(url, param, config);
    default:
      return instance(options);
  }
};

/**
 * @description
 * @param result
 */
const handleData = (
  result: AxiosResponse<ApiReturnType>
): ApiReturnType | never => {
  if (result) {
    const {
      status,
      data,
      config: { url },
    } = result;

    if (!status) {
      throw new Error("Network Error");
    }

    if (status >= 200 && status < 300) {
      return { ...data, success: data?.code === 200 };
    }

    return { ...data, success: false };
  }
  throw new Error("Unknown Error");
};

/**
 * @description
 * @param url
 * @param options
 * @param config
 */
const request = async (
  url: string,
  options: IOption,
  config?: AxiosRequestConfig
): Promise<ApiReturnType> => handleData(await fetch(url, options, config));

/**
 * @description
 * @param url
 * @param param
 * @param config
 */
export const get = (
  url: string,
  param?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<ApiReturnType> =>
  request(url, { ...param, method: RequestEnum.GET }, config);

/**
 * @description
 * @param url
 * @param param
 * @param config
 */
export const post = (
  url: string,
  param?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<ApiReturnType> =>
  request(url, { ...param, method: RequestEnum.POST }, config);

/**
 * @description
 * @param url
 * @param param
 * @param config
 */
export const put = (
  url: string,
  param?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<ApiReturnType> =>
  request(url, { ...param, method: RequestEnum.PUT }, config);

/**
 * @description
 * @param url
 * @param param
 * @param config
 */
export const del = (
  url: string,
  param?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<ApiReturnType> =>
  request(url, { ...param, method: RequestEnum.DELETE }, config);

instance.interceptors.request.use(
  (config) => {
    const csrfToken = localStorage.getItem("csrf-token");
    const token = localStorage.getItem("token");
    if(csrfToken) config.headers.common["csrf-token"]=csrfToken;
    if(token) config.headers.common["token"]=token;

    return config;
  },
  (err) => {
    message.error("request timed out");
    return Promise.reject(err);
  }
);

axios.interceptors.response.use(
  (result) => result,
  (err) => {
    if (err && err.response) {
      const {
        response: { data, status, statusText },
      } = err;
      if (process.env.NODE_ENV === "development") {
       notification.error({
          message: `${status}:${statusText}`,
          description: "",
        });
      } else if (process.env.NODE_ENV === "production") {
        notification.error({
          message: "system information",
          description:
            "The system is busy and cannot get the return value of the interface correctly. Please try again later!",
        });
      } else {
        notification.error({
          message: "system information",
          description: "process.env.NODE_ENV should not be empty",
        });
      }
      return Promise.reject(err);
    }
    return null;
  }
);
