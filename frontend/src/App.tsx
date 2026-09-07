import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "@/pages/LoginPage";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import AdminLayout from "@/components/layout/AdminLayout";

import DashboardPage from "@/pages/DashboardPage";
import IOCPage from "@/pages/IOCPage";
import SourcesPage from "@/pages/SourcesPage";
import SyncLogsPage from "@/pages/SyncLogsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================================================
            PUBLIC ROUTES
        ================================================== */}

        <Route
          path="/login"
          element={<LoginPage />}
        />

        {/* ==================================================
            PROTECTED ADMIN ROUTES
        ================================================== */}

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />

            <Route
              path="/iocs"
              element={<IOCPage />}
            />

            <Route
              path="/sources"
              element={<SourcesPage />}
            />

            <Route
              path="/sync-logs"
              element={<SyncLogsPage />}
            />
          </Route>
        </Route>

        {/* ==================================================
            DEFAULT ROUTE
        ================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;