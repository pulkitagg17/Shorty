import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";

import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardPage from "@/pages/dashboard";
import CreatePage from "@/pages/create";
import LinksPage from "@/pages/links";
import NotFoundPage from "@/pages/not-found";
import { ProtectedRoute } from "@/components/protected-route";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <AppLayout />,
        children: [
            { path: "", element: <DashboardPage /> },
            { path: "dashboard", element: <ProtectedRoute><DashboardPage /></ProtectedRoute> },
            { path: "create", element: <ProtectedRoute><CreatePage /></ProtectedRoute> },
            { path: "links", element: <ProtectedRoute><LinksPage /></ProtectedRoute> },
        ],
    },
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },
    { path: "*", element: <NotFoundPage /> },
]);
