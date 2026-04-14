import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CharacterProvider, useCharacter } from "./contexts/CharacterContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Layout from "./components/layout/Layout";
import { Toaster } from "sonner";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import CharacterSheet from "./pages/CharacterSheet";
import Spells from "./pages/Spells";
import Equipment from "./pages/Equipment";
import DMDashboard from "./pages/DMDashboard";
import Social from "./pages/Social";
import CampaignDetails from "./pages/CampaignDetails";
import Auth from "./pages/Auth";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useCharacter();
  
  if (loading) return (
    <div className="min-h-screen bg-midnight flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
    </div>
  );
  
  if (!user) return <Navigate to="/auth" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <div className="magic-bg" />
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(10, 10, 15, 0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(242, 125, 38, 0.2)',
            color: '#f5f5dc',
          },
        }}
      />
      <Router>
        <CharacterProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/character" element={<CharacterSheet />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/equipment" element={<Equipment />} />
                    <Route path="/spells" element={<Spells />} />
                    <Route path="/dm" element={<DMDashboard />} />
                    <Route path="/social" element={<Social />} />
                    <Route path="/campaign" element={<CampaignDetails />} />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </CharacterProvider>
      </Router>
    </ErrorBoundary>
  );
}
