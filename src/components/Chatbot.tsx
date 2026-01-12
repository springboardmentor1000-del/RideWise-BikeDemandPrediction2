import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  ThermometerSun,
  Clock,
  Calendar,
  TrendingUp,
  HelpCircle,
  Mic,
  MicOff,
  Volume2
} from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const suggestions = [
  "How does daily prediction work?",
  "What affects bike rentals?",
  "What is comfort index?",
  "How accurate are predictions?",
  "Tell me about peak hours",
  "What is RideWise?",
];

// Intelligent response generator based on keywords
const generateResponse = (input: string): string => {
  const lowerInput = input.toLowerCase();
  
  // Greetings
  if (lowerInput.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/)) {
    return "Hello! 👋 Welcome to RideWise Assistant! I'm here to help you understand our bike rental prediction platform. You can ask me about daily predictions, hourly forecasts, weather factors, or how to use the platform. What would you like to know?";
  }
  
  // How are you
  if (lowerInput.match(/(how are you|how're you|how do you do|what's up)/)) {
    return "I'm doing great, thank you for asking! 🚴 I'm always ready to help you with bike rental predictions. Is there anything specific about RideWise you'd like to know?";
  }
  
  // About RideWise / What is this
  if (lowerInput.match(/(what is ridewise|about ridewise|what does ridewise do|tell me about|this website|this platform|this app)/)) {
    return "🚲 **RideWise** is an AI-powered bike rental prediction platform! We help bike rental businesses forecast demand using machine learning.\n\n**Key Features:**\n• **Daily Predictions** - Forecast full-day rentals\n• **Hourly Predictions** - Hour-by-hour forecasts with peak detection\n• **Weather-Aware** - Factors in temperature, humidity, wind\n• **Smart Analytics** - Track accuracy and trends\n\nWould you like to know more about any specific feature?";
  }
  
  // Daily prediction
  if (lowerInput.match(/(daily prediction|daily forecast|predict daily|day prediction|full day|entire day)/)) {
    return "📅 **Daily Prediction** forecasts total bike rentals for an entire day!\n\n**How it works:**\n1. Select the **season** (Spring, Summer, Fall, Winter)\n2. Choose the **month** and **year**\n3. Set if it's a **working day** or weekend\n4. Adjust **weather conditions** (temperature, humidity, wind)\n5. Select **weather severity** (Clear, Mist, Rain, etc.)\n\nThe ML model analyzes all factors and predicts total expected rentals. The **comfort index** and **wind chill** are auto-calculated!\n\nWant to try it? Go to Daily Prediction from the sidebar! 🎯";
  }
  
  // Hourly prediction
  if (lowerInput.match(/(hourly prediction|hourly forecast|hour prediction|per hour|by hour|peak hour)/)) {
    return "⏰ **Hourly Prediction** gives you precise hour-by-hour forecasts!\n\n**Special Features:**\n• **Peak Hour Detection** - Automatically identifies high-demand hours\n• **Time Slider** - Select any hour (0-23)\n• **Real-time Updates** - Predictions adjust as you change inputs\n\n**Peak Hours Typically:**\n• 🌅 Working days: 7-9 AM and 5-7 PM\n• ☀️ Weekends: 11 AM - 4 PM\n\nPeak hours usually see **1.5-2x more rentals** than off-peak times!";
  }
  
  // Weather factors / What affects rentals
  if (lowerInput.match(/(weather|temperature|humidity|wind|rain|factors|affect|impact|influence)/)) {
    return "🌤️ **Weather Factors** have the biggest impact on bike rentals!\n\n**Key Factors:**\n• 🌡️ **Temperature** - Ideal range is 15-28°C. Too hot or cold reduces rentals\n• 💧 **Humidity** - Lower humidity (<70%) is better for cycling\n• 💨 **Wind Speed** - High winds (>30 km/h) discourage riders\n• 🌧️ **Weather Severity** - Clear weather = more rentals, rain = fewer\n\n**Impact Ranking:**\n1. Temperature (highest)\n2. Weather conditions\n3. Season\n4. Day of week\n5. Time of day";
  }
  
  // Comfort index
  if (lowerInput.match(/(comfort index|comfort level|feels like|apparent temperature)/)) {
    return "😊 **Comfort Index** measures how comfortable the weather feels for cycling!\n\n**Calculation:**\nIt combines temperature and humidity to give a 'feels like' value.\n\n**Formula:**\n`Comfort = Temp - 0.55 × (1 - Humidity/100) × (Temp - 14.5)`\n\n**Interpretation:**\n• 18-24: 🌟 Ideal cycling weather\n• 14-18 or 24-28: ✅ Good conditions\n• Below 14 or above 28: ⚠️ Less comfortable\n\nThe comfort index updates automatically as you adjust the sliders!";
  }
  
  // Wind chill
  if (lowerInput.match(/(wind chill|wind effect|cold wind|feels colder)/)) {
    return "🌬️ **Wind Chill Effect** shows how cold it feels with wind!\n\nWind makes temperatures feel colder than they actually are, especially below 10°C.\n\n**When it applies:**\n• Temperature ≤ 10°C\n• Wind speed ≥ 4.8 km/h\n\n**Impact:**\nA 5°C day with 20 km/h wind can feel like -1°C!\n\nThis is auto-calculated in both Daily and Hourly prediction forms.";
  }
  
  // Accuracy
  if (lowerInput.match(/(accuracy|accurate|reliable|how good|precision|correct)/)) {
    return "🎯 **Prediction Accuracy** is one of our top priorities!\n\n**Our ML Model achieves:**\n• **87.5% average accuracy** on daily predictions\n• **85-90% accuracy** on hourly predictions\n• Continuous improvement with new data\n\n**What makes it accurate:**\n• Historical rental data analysis\n• Weather pattern recognition\n• Seasonal trend modeling\n• Peak hour detection algorithms\n\nThe more you use it, the smarter it gets! 📈";
  }
  
  // Season
  if (lowerInput.match(/(season|spring|summer|fall|autumn|winter|seasonal)/)) {
    return "🍂 **Seasons** significantly affect bike rental patterns!\n\n**Seasonal Impact:**\n• ☀️ **Summer** - Highest rentals, ideal weather\n• 🌸 **Spring** - Increasing demand, pleasant temps\n• 🍁 **Fall** - Moderate demand, cooler temps\n• ❄️ **Winter** - Lowest rentals, cold weather\n\n**Rental Difference:**\nSummer can see **2-3x more rentals** than winter!\n\nThe prediction model automatically adjusts for seasonal patterns.";
  }
  
  // Working day / weekend
  if (lowerInput.match(/(working day|weekend|weekday|holiday|work day)/)) {
    return "📊 **Working Days vs Weekends** show different patterns!\n\n**Working Days:**\n• Peak hours: 7-9 AM and 5-7 PM (commuters)\n• More predictable patterns\n• Higher morning/evening spikes\n\n**Weekends:**\n• Peak hours: 11 AM - 4 PM (leisure)\n• More spread-out demand\n• Weather has bigger impact\n\nOur model detects and adjusts for these patterns automatically!";
  }
  
  // How to use / Getting started
  if (lowerInput.match(/(how to use|how do i|getting started|start|begin|tutorial|guide)/)) {
    return "🚀 **Getting Started with RideWise:**\n\n**Step 1:** Choose prediction type\n• Daily → Full day forecast\n• Hourly → Hour-by-hour forecast\n\n**Step 2:** Set your parameters\n• Season, date, working day\n• Weather conditions (temp, humidity, wind)\n\n**Step 3:** Click 'Predict'\n• Watch auto-calculated fields update\n• Get your rental prediction!\n\n**Pro Tips:**\n💡 Start with current conditions\n💡 Compare different scenarios\n💡 Use hourly for peak planning";
  }
  
  // Features
  if (lowerInput.match(/(features|what can|capabilities|functions|options)/)) {
    return "✨ **RideWise Features:**\n\n📅 **Daily Prediction**\n• Full-day rental forecasting\n• Season & weather-based analysis\n\n⏰ **Hourly Prediction**\n• Hour-by-hour forecasts\n• Automatic peak hour detection\n\n🤖 **AI Chatbot** (That's me!)\n• Platform guidance\n• Feature explanations\n\n🌓 **Dark/Light Mode**\n• Comfortable viewing anytime\n\n📱 **Responsive Design**\n• Works on all devices\n\nWhat feature would you like to explore?";
  }
  
  // Thanks / Appreciation
  if (lowerInput.match(/(thank|thanks|appreciate|helpful|great|awesome|good job)/)) {
    return "You're welcome! 😊 I'm glad I could help! If you have any more questions about RideWise predictions, weather factors, or how to use the platform, feel free to ask anytime. Happy predicting! 🚴‍♂️";
  }
  
  // Bye / Goodbye
  if (lowerInput.match(/(bye|goodbye|see you|take care|later)/)) {
    return "Goodbye! 👋 Thanks for using RideWise Assistant. Come back anytime you need help with bike rental predictions. Ride safe! 🚲";
  }
  
  // ML / Machine Learning
  if (lowerInput.match(/(machine learning|ml|algorithm|model|ai|artificial intelligence)/)) {
    return "🤖 **Our ML Technology:**\n\nRideWise uses advanced machine learning to predict bike rentals!\n\n**How it works:**\n• Trained on historical rental data\n• Analyzes weather patterns\n• Learns seasonal trends\n• Detects peak hour patterns\n\n**Key Algorithms:**\n• Regression models for predictions\n• Feature engineering (comfort index, wind chill)\n• Pattern recognition for peaks\n\nThe model continuously improves with new data!";
  }

  // Default response for unknown queries
  return "I'd be happy to help! 🚴 Here are some topics I can assist with:\n\n• **Daily Predictions** - How full-day forecasting works\n• **Hourly Predictions** - Hour-by-hour forecasts & peak detection\n• **Weather Factors** - Temperature, humidity, wind impacts\n• **Comfort Index** - What it means and how it's calculated\n• **Accuracy** - How reliable our predictions are\n• **Getting Started** - How to use RideWise\n\nJust ask about any of these topics, or try the quick questions below!";
};

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hi! 👋 I'm the RideWise Assistant. I can help you understand how our bike rental predictions work, explain weather factors, guide you through the platform, and answer any questions you have. You can type or use the 🎤 microphone button to speak! What would you like to know?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Voice recognition hook
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    isSupported: isVoiceSupported,
    error: voiceError 
  } = useSpeechRecognition();

  // Update input when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Auto-send when voice recording stops and we have a transcript
  useEffect(() => {
    if (!isListening && transcript && transcript.trim()) {
      handleSend(transcript);
    }
  }, [isListening]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay for natural feel
    const typingDelay = Math.min(1000 + content.length * 20, 2000);
    
    setTimeout(() => {
      const response = generateResponse(content);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, typingDelay);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full gradient-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:scale-110 group ${isOpen ? "hidden" : "flex"}`}
      >
        <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] h-[550px] max-h-[calc(100vh-6rem)] bg-card border border-border rounded-2xl shadow-xl flex flex-col overflow-hidden scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border gradient-primary relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent animate-shimmer" />
            <div className="flex items-center gap-3 relative">
              <div className="p-2.5 rounded-xl bg-primary-foreground/20 shadow-inner">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-primary-foreground flex items-center gap-2">
                  RideWise Assistant
                  <Sparkles className="h-4 w-4 text-primary-foreground/80" />
                </h3>
                <p className="text-xs text-primary-foreground/70 flex items-center gap-1">
                  <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  Online • Ask me anything
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20 relative"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-secondary/20 to-transparent">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""} animate-fade-in`}
              >
                <div
                  className={`p-2 rounded-xl flex-shrink-0 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-accent/20 text-accent"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] p-3.5 rounded-2xl shadow-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-md"
                      : "bg-card border border-border text-card-foreground rounded-tl-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                  <span className="text-[10px] opacity-50 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 animate-fade-in">
                <div className="p-2 rounded-xl bg-accent/20 text-accent">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-card border border-border p-4 rounded-2xl rounded-tl-md shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 border-t border-border/50 pt-3 bg-secondary/30">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <HelpCircle className="h-3 w-3" />
                Quick questions:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 4).map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSend(suggestion)}
                    className="text-xs px-3 py-1.5 rounded-full bg-card border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:shadow-md"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border bg-card">
            {/* Voice indicator */}
            {isListening && (
              <div className="mb-3 flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex gap-1">
                  <span className="w-1.5 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-6 bg-primary rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                  <span className="w-1.5 h-5 bg-primary rounded-full animate-pulse" style={{ animationDelay: "450ms" }} />
                </div>
                <span className="text-xs text-primary font-medium">Listening... Speak now</span>
              </div>
            )}
            
            {voiceError && (
              <div className="mb-2 text-xs text-destructive bg-destructive/10 p-2 rounded-lg">
                Voice error: {voiceError}. Please try again.
              </div>
            )}
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Ask about predictions, weather, features..."}
                className="flex-1 bg-secondary/50"
                disabled={isTyping || isListening}
              />
              
              {/* Voice Button */}
              {isVoiceSupported && (
                <Button
                  type="button"
                  size="icon"
                  variant={isListening ? "destructive" : "outline"}
                  onClick={isListening ? stopListening : startListening}
                  disabled={isTyping}
                  className={`transition-all ${isListening ? 'animate-pulse' : 'hover:bg-primary/10 hover:text-primary hover:border-primary'}`}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              )}
              
              <Button 
                type="submit" 
                size="icon" 
                className="gradient-primary shadow-md shadow-primary/20 hover:shadow-primary/40 transition-shadow"
                disabled={isTyping || !input.trim() || isListening}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            
            {!isVoiceSupported && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Voice input not supported in this browser
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
