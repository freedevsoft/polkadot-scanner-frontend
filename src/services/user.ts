import { post, put, get } from "../utils/request";

export const register = async (param) => post("/api/users/register", { param });
export const login = async (param) => post("/api/users/login", { param });
export const logout = async () => put(`/api/users/logout`);
export const loginWithToken = async () => get(`/api/users/me`);
