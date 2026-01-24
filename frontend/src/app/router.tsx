import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./layout";

import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardPage from "@/pages/dashboard";
import CreatePage from "@/pages/create";
import LinksPage from "@/pages/links";
import { ProtectedRoute } from "@/components/protected-route";

export const router = createBrowserRouter([
    {
        element: <AppLayout />,
        children: [
            { path: "/", element: <DashboardPage /> },
            { path: "/login", element: <LoginPage /> },
            { path: "/register", element: <RegisterPage /> },
            { path: "/dashboard", element: <ProtectedRoute><DashboardPage /></ProtectedRoute> },
            { path: "/create", element: <ProtectedRoute><CreatePage /></ProtectedRoute> },
            { path: "/links", element: <ProtectedRoute><LinksPage /></ProtectedRoute> },
        ],
    },
]);
