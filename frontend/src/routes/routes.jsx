import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../pages/dashboard/dashboard";
import CameraCapture from "../components/cameraCapture/CameraCapture";

export const ROUTES = {
  DASHBOARD: "/dashboard",
  CAMERA: "/",
};

export const router = createBrowserRouter([
  {
    path: ROUTES.DASHBOARD,
    element: <Dashboard />,
  },
  {
    path: ROUTES.CAMERA,
    element: <CameraCapture />,
  },
]);
