import { BrowserRouter , Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import { AuthPage } from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Reservations from "./pages/Reservations";
import Profile from "./pages/Profile";
import DayPredict from "./pages/DayPredict";
import HourPrediction from "./pages/HourlyPrediction";
import GlobalAIChatbot from "./components/AIChatbot";
import Review from "./pages/ReviewPage";
import ChatBot from "./pages/ChatBotPage";
import UploadPDF from "./pages/UploadPDF";
function App() {
    return <BrowserRouter>
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/Auth" element={<AuthPage />} />
            <Route path="/home" element={<HomePage />} />
            {/* <Route path="/predict" element={<Predict />} /> */}
            <Route path="/predict/hour" element={<HourPrediction />} />
            <Route path="/predict/day" element={<DayPredict />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/aboutus" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/reserve" element={<Reservations />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/review" element={<Review />} />
            <Route path="/chatbot" element={<ChatBot />} />
            <Route path="/upload-pdf" element={<UploadPDF />} />

        </Routes>
        <GlobalAIChatbot context={null} />
    </BrowserRouter>
}

export default App;
