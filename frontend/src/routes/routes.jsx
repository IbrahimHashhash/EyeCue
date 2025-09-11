import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../pages/dashboard/dashboard";
import CameraCapture from "../pages/cameraCapture/cameraCapture";
import AuthPage from "../pages/authentication/auth";

export const ROUTES = {
  LOGIN: "/",
  DASHBOARD: "/dashboard",
  CAMERA: "/camera-capture",
};

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <AuthPage />,
  },
  {
    path: ROUTES.DASHBOARD,
    element: <Dashboard />,
  },
  {
    path: ROUTES.CAMERA,
    element: <CameraCapture />,
  },
]);