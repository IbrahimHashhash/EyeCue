import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../pages/dashboard/dashboard";
import CameraCapture from "../pages/cameraCapture/cameraCapture";

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
