import { lazy } from "react";

const BasicLayout = lazy(() => import("../layouts/BasicLayout"));
const welcome = lazy(() => import("../routes/IndexPage/IndexPage"));
const tableList = lazy(() => import("../routes/List/TableList"));
const login = lazy(() => import("../routes/User/Login"));
const userLayout = lazy(() => import("../layouts/UserLayout"));

const data = [
  {
    component: BasicLayout,
    layout: "BasicLayout",
    name: "Basic",
    path: "",
    children: [
      {
        name: "Dashboard",
        icon: "DashboardOutlined",
        path: "dashboard",
        children: [
          {
            name: "welcome",
            path: "welcome",
            component: welcome,
          },
        ],
      },
      {
        name: "List",
        path: "list",
        icon: "TableOutlined",
        children: [
          {
            name: "Event List",
            path: "table-list",
            component: tableList,
          },
        ],
      }, 
    ],
  },
  {
    component: userLayout,
    layout: "UserLayout",
    children: [
      {
        name: "Accounts",
        icon: "UserOutlined",
        path: "user",
        type: "link",
        children: [
          {
            name: "Sign In",
            path: "login",
            component: login,
          },
        ],
      },
    ],
  },
];

export function getNavData() {
  return data;
}

export default data;
