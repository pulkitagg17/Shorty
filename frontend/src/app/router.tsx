import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./layout";

import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardPage from "@/pages/dashboard";
import CreatePage from "@/pages/create";
import LinksPage from "@/pages/links";

export const router = createBrowserRouter([
    {
        element: <AppLayout />,
        children: [
            { path: "/", element: <DashboardPage /> },
            { path: "/login", element: <LoginPage /> },
            { path: "/register", element: <RegisterPage /> },
            { path: "/dashboard", element: <DashboardPage /> },
            { path: "/create", element: <CreatePage /> },
            { path: "/links", element: <LinksPage /> },
        ],
    },
]);
