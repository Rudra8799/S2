import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import Versions from "./Versions.jsx";
import "./index.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import { StatsProvider } from "./StatsContext"; // Import the provider

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<App />} />
      <Route path="/versions" element={<Versions />} />
    </>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <StatsProvider>
      <RouterProvider router={router} />
    </StatsProvider>
  </StrictMode>
);