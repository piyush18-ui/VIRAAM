import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LandingPage } from './pages/Landing/LandingPage';
import { WorkspaceLayout } from './pages/Workspace/WorkspaceLayout';
import { CommandCenter } from './pages/Workspace/CommandCenter';
import { CasesList } from './pages/Workspace/CasesList';
import { CaseDetail } from './pages/Workspace/CaseDetail';
import { MoneyTrail } from './pages/Workspace/MoneyTrail';
import { SimulatorView } from './pages/Workspace/SimulatorView';
import { AuditLedger } from './pages/Workspace/AuditLedger';
import { ModelInsights } from './pages/Workspace/ModelInsights';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* SecOps Workspace Protected Shell */}
          <Route path="/workspace" element={<WorkspaceLayout />}>
            <Route index element={<CommandCenter />} />
            <Route path="cases" element={<CasesList />} />
            <Route path="cases/:id" element={<CaseDetail />} />
            <Route path="graph" element={<MoneyTrail />} />
            <Route path="simulator" element={<SimulatorView />} />
            <Route path="audit" element={<AuditLedger />} />
            <Route path="model" element={<ModelInsights />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
