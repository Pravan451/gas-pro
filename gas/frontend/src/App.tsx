import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SensorProvider } from "@/contexts/SensorContext";
import EmergencyAlertSystem from "@/components/EmergencyAlert";
import Navigation from "@/components/Navigation";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ValveControl from "./pages/ValveControl";
import AIAssistant from "./pages/AIAssistant";
import Logs from "./pages/Logs";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);

  // Simulate emergency alerts based on sensor data
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkForEmergencies = () => {
      // This would integrate with real sensor data
      const dangerousLevels = Math.random() > 0.95; // 5% chance of alert
      
      if (dangerousLevels) {
        const newAlert = {
          id: `alert_${Date.now()}`,
          message: "Danger! Gas leak detected. Evacuate immediately!",
          level: 'critical' as const,
          location: "Production Floor A",
          timestamp: new Date()
        };
        
        setAlerts(prev => [...prev, newAlert]);
        
        // Auto-dismiss after 10 seconds for demo
        setTimeout(() => {
          setAlerts(prev => prev.filter(a => a.id !== newAlert.id));
        }, 10000);
      }
    };

    const interval = setInterval(checkForEmergencies, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  return (
    <>
      <EmergencyAlertSystem alerts={alerts} onDismiss={dismissAlert} />
      {isAuthenticated && <Navigation />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/valve-control" element={<ProtectedRoute><ValveControl /></ProtectedRoute>} />
        <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
        <Route path="/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <SensorProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </SensorProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
