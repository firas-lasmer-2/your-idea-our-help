import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import ResumeBuilder from "./pages/ResumeBuilder";
import WebsiteBuilder from "./pages/WebsiteBuilder";
import PublicWebsite from "./pages/PublicWebsite";
import TemplatePreviewLab from "./pages/TemplatePreviewLab";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminResumes from "./pages/admin/AdminResumes";
import AdminWebsites from "./pages/admin/AdminWebsites";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminContacts from "./pages/admin/AdminContacts";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resume/new" element={<ResumeBuilder />} />
            <Route path="/resume/edit" element={<ResumeBuilder />} />
            <Route path="/website/new" element={<WebsiteBuilder />} />
            <Route path="/website/edit" element={<WebsiteBuilder />} />
            <Route path="/site/:id" element={<PublicWebsite />} />
            <Route path="/__preview/templates" element={<TemplatePreviewLab />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/resumes" element={<AdminResumes />} />
            <Route path="/admin/websites" element={<AdminWebsites />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/contacts" element={<AdminContacts />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
