import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { RequireAuth } from "./components/RequireAuth";
import { RequireGuest } from "./components/RequireGuest";
import { LoginPage } from "./pages/LoginPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { SetNewPasswordPage } from "./pages/SetNewPasswordPage";
import { AppShell } from "./pages/AppShell";
import { MiniSitesPage } from "./pages/MiniSitesPage";
import { MiniSiteEditorPage } from "./pages/MiniSiteEditorPage";
import { LayoutPage } from "./pages/LayoutPage";
import { MediaPlaceholderPage } from "./pages/MediaPlaceholderPage";
import { SettingsPlaceholderPage } from "./pages/SettingsPlaceholderPage";
import { UsersPage } from "./pages/UsersPage";
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
          <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
          <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
          {/* Sem RequireGuest/RequireAuth de propósito: a própria página
              decide (sem sessão -> /login; sem troca pendente -> painel) —
              ver SetNewPasswordPage.tsx. Evita qualquer risco de loop com
              o redirect que RequireAuth já faz PARA aqui. */}
          <Route path="/definir-senha" element={<SetNewPasswordPage />} />

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
            <Route path="minisites/:id/editar" element={<MiniSiteEditorPage />} />
            <Route path="minisites/:id/layout" element={<LayoutPage />} />
            <Route path="midia" element={<MediaPlaceholderPage />} />
            <Route path="configuracoes" element={<SettingsPlaceholderPage />} />
            <Route path="configuracoes/usuarios" element={<UsersPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/app/minisites" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
