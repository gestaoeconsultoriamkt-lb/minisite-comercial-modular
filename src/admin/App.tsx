import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { RequireAuth } from "./components/RequireAuth";
import { RequireGuest } from "./components/RequireGuest";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { AppShell } from "./pages/AppShell";
import { MiniSitesPage } from "./pages/MiniSitesPage";
import { MiniSiteEditorPlaceholderPage } from "./pages/MiniSiteEditorPlaceholderPage";
import { MediaPlaceholderPage } from "./pages/MediaPlaceholderPage";
import { SettingsPlaceholderPage } from "./pages/SettingsPlaceholderPage";
import { ToastProvider } from "./lib/toast";

export function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <RequireGuest>
                <LoginPage />
              </RequireGuest>
            }
          />
          <Route
            path="/cadastro"
            element={
              <RequireGuest>
                <SignUpPage />
              </RequireGuest>
            }
          />
          <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
          <Route path="/redefinir-senha" element={<ResetPasswordPage />} />

          <Route
            path="/app"
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="minisites" replace />} />
            <Route path="minisites" element={<MiniSitesPage />} />
            <Route path="minisites/:id/editar" element={<MiniSiteEditorPlaceholderPage />} />
            <Route path="midia" element={<MediaPlaceholderPage />} />
            <Route path="configuracoes" element={<SettingsPlaceholderPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/app/minisites" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
