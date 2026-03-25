import { Suspense, lazy } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppStateProvider } from "@/contexts/AppStateContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";

const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Discover = lazy(() => import("./pages/Discover"));
const ProfileDetail = lazy(() => import("./pages/ProfileDetail"));
const Contacts = lazy(() => import("./pages/Contacts"));
const RequestDetail = lazy(() => import("./pages/RequestDetail"));
const Chats = lazy(() => import("./pages/Chats"));
const ChatDetail = lazy(() => import("./pages/ChatDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Legal = lazy(() => import("./pages/Legal"));
const About = lazy(() => import("./pages/About"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const SuspenseFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppStateProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <a href="#main-content" className="skip-link">
                Zum Hauptinhalt springen
              </a>
              <Suspense fallback={<SuspenseFallback />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/legal" element={<Legal />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/unsubscribe" element={<Unsubscribe />} />
                  <Route path="/login" element={<Navigate to="/auth" replace />} />
                  
                  {/* Onboarding */}
                  <Route 
                    path="/onboarding" 
                    element={
                      <ProtectedRoute requireOnboarding={false}>
                        <Onboarding />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Main app routes */}
                  <Route 
                    element={
                      <ProtectedRoute>
                        <AppShell />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="/discover" element={<Discover />} />
                    <Route path="/discover/profile/:userId" element={<ProfileDetail />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/contacts/request/:connectionId" element={<RequestDetail />} />
                    <Route path="/chats" element={<Chats />} />
                    <Route path="/chats/:connectionId" element={<ChatDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AppStateProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
