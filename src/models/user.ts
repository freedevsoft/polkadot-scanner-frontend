import { message } from "antd";
import { routerRedux } from "dva/router";
import { register, login, logout, loginWithToken } from "../services/user";

export default {
  namespace: "user",
  state: {
    loading: false,
    loginData: {
      username: {
        value: "",
      },
      password: {
        value: "",
      },
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (pathname === "/user/login") {
          // empty
        }
      });
    },
  },
  effects: {
    *login({ payload }, { call, put }) {
      try {
        yield put({
          type: "querySuccess",
          payload: { loading: true },
        });
        const {isSuccess, csrfToken, detail, token} = yield call(login, payload);
        if(isSuccess){
          localStorage.setItem("csrf-token", csrfToken);
          localStorage.setItem("token", token);
          message.success(detail);
          yield put(routerRedux.push("/dashboard/welcome"));
        }
      }  catch(e) {
        console.log(e);
      } finally {
        yield put({
          type: "querySuccess",
          payload: { loading: false },
        });
      }
    },
    *register({ payload }, { call, put }) {
      try {
        yield put({
          type: "querySuccess",
          payload: { loading: true },
        });
        const {isSuccess, csrfToken, detail, token} = yield call(register, payload);
        if(isSuccess){
          localStorage.setItem("csrf-token", csrfToken);
          localStorage.setItem("token", token);
          message.success(detail);
          yield put(routerRedux.push("/dashboard/welcome"));
        }
      }  catch(e) {
        console.log(e);
      } finally {
        yield put({
          type: "querySuccess",
          payload: { loading: false },
        });
      }
    },
    *loginWithToken({},{ call, put }) {
      try {
        const {isSuccess} = yield call(loginWithToken);
        if(isSuccess){
          yield put(routerRedux.push("/dashboard/welcome"));
        }
      } catch(e) {
        // console.log(e);
      } finally {
        //empty
      }
    },
    *logout({},{ call, put }) {
      try {
        const {isSuccess} = yield call(logout);
        if(isSuccess){
          localStorage.removeItem("token");
          yield put(routerRedux.push("/user/login"));
        }
      } catch(e) {
        console.log(e);
      } finally {
        //empty
      }
    },
  },
  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        loginData: {
          ...state.loginData,
          ...payload,
        },
      };
    },
    querySuccess(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
