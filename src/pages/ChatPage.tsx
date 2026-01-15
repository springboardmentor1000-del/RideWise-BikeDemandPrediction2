import { DashboardLayout } from "@/components/DashboardLayout";
import { Chatbot } from "@/components/Chatbot";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const suggestions = [
  "How does daily prediction work?",
  "Which factors affect rentals most?",
  "What is comfort index?",
  "How accurate are predictions?",
  "What's the best time for high rentals?",
  "How does weather affect bike rentals?",
];

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm the RideWise Assistant. I can help you understand how our prediction system works, explain the factors that affect bike rentals, and guide you through using the platform. What would you like to know?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

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

    // Simulate bot response
    setTimeout(() => {
      const responses: Record<string, string> = {
        "How does daily prediction work?":
          "Daily prediction analyzes multiple factors including:\n\n" +
          "• Season – Different seasons have varying rental patterns\n" +
          "• Weather conditions – Temperature, humidity, and wind affect rider comfort\n" +
          "• Day type – Working days vs weekends show different patterns\n" +
          "• Weather severity – Clear weather increases rentals significantly\n\n" +
          "Our ML model combines these factors using historical data to predict total daily rentals.",

        "Which factors affect rentals most?":
          "Based on our analysis, the factors ranked by impact are:\n\n" +
          "1. Temperature – Optimal range is 15–28°C\n" +
          "2. Weather severity – Clear weather can increase rentals by 40%\n" +
          "3. Hour of day – Peak hours (5–7 PM) see 80% more rentals\n" +
          "4. Season – Summer typically has 50% more rentals than winter\n" +
          "5. Working day – Weekdays see more commuter usage",

        "What is comfort index?":
          "The Comfort Index represents how comfortable the weather feels for cycling.\n\n" +
          "It combines:\n" +
          "• Temperature\n" +
          "• Humidity\n\n" +
          "Formula:\n" +
          "comfort = temp - 0.55 × (1 - humidity/100) × (temp - 14.5)\n\n" +
          "A comfort index between 18 and 24 is ideal for biking.",

        "How accurate are predictions?":
          "Our ML model achieves:\n\n" +
          "• Daily predictions – about 87% accuracy\n" +
          "• Hourly predictions – about 85% accuracy\n\n" +
          "Accuracy may vary due to:\n" +
          "• Data quality\n" +
          "• Unusual weather events\n" +
          "• Holidays or special events\n\n" +
          "Models are continuously retrained to improve accuracy.",

        "What's the best time for high rentals?":
          "Based on historical patterns:\n\n" +
          "Weekdays:\n" +
          "• Morning peak – 7 to 9 AM\n" +
          "• Evening peak – 5 to 7 PM (highest demand)\n\n" +
          "Weekends:\n" +
          "• Late morning to afternoon – 11 AM to 4 PM\n\n" +
          "Best conditions:\n" +
          "• Temperature – 20 to 25°C\n" +
          "• Clear weather\n" +
          "• Low to moderate humidity",

        "How does weather affect bike rentals?":
          "Weather has a strong impact on bike rentals:\n\n" +
          "☀️ Clear weather – 30 to 40% increase\n" +
          "🌤️ Cloudy or mist – Normal demand\n" +
          "🌧️ Light rain – Around 40% decrease\n" +
          "⛈️ Heavy rain or snow – Up to 70% decrease\n\n" +
          "Temperature effects:\n" +
          "• Below 5°C – Very low demand\n" +
          "• 15–25°C – Optimal demand\n" +
          "• Above 35°C – Reduced demand (too hot)",
      };
      const response =
        responses[content] ||
        "I can help you with:\n\n• Understanding how predictions work\n• Explaining factors that affect rentals\n• Tips for using the platform\n• Weather and time patterns\n\nFeel free to ask anything about bike rental predictions!";

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)]">
        <div className="h-full flex flex-col rounded-2xl bg-card border border-border overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border gradient-primary">
            <div className="p-2 rounded-xl bg-primary-foreground/20">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-primary-foreground">
                RideWise Assistant
              </h2>
              <p className="text-sm text-primary-foreground/70">
                AI-powered help & insights
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`p-2 rounded-xl h-fit ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="h-5 w-5" />
                  ) : (
                    <Bot className="h-5 w-5" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] p-4 rounded-2xl ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-md"
                      : "bg-secondary text-secondary-foreground rounded-tl-md"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="p-2 rounded-xl bg-secondary text-secondary-foreground">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="bg-secondary text-secondary-foreground p-4 rounded-2xl rounded-tl-md">
                  <div className="flex gap-1.5">
                    <span
                      className="w-2.5 h-2.5 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2.5 h-2.5 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2.5 h-2.5 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">
                Suggested questions:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSend(suggestion)}
                    className="text-sm px-4 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex gap-3"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about bike rental predictions..."
                className="flex-1"
              />
              <Button type="submit" variant="hero" className="px-6">
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatPage;
