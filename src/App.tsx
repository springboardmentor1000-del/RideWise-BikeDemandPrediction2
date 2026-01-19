import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import DailyPrediction from "./pages/DailyPrediction";
import HourlyPrediction from "./pages/HourlyPrediction";
import ChatPage from "./pages/ChatPage";
import Profile from "./pages/Profile";
import Reviews from "./pages/Reviews";
import BikeReservation from "./pages/BikeReservation";
import PDFUpload from "./pages/PDFUpload";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/daily" element={<DailyPrediction />} />
          <Route path="/dashboard/hourly" element={<HourlyPrediction />} />
          <Route path="/dashboard/reservation" element={<BikeReservation />} />
          <Route path="/dashboard/reviews" element={<Reviews />} />
          <Route path="/dashboard/upload" element={<PDFUpload />} />
          <Route path="/dashboard/chat" element={<ChatPage />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
