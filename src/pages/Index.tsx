import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FeatureCard } from "@/components/FeatureCard";
import { StepCard } from "@/components/StepCard";
import { Chatbot } from "@/components/Chatbot";
import { 
  Calendar, 
  Clock, 
  Brain, 
  Cloud, 
  TrendingUp, 
  MessageCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
        </div>
        
        {/* Animated Mesh */}
        <div className="absolute inset-0 animated-mesh opacity-50" />
        
        {/* Content */}
        <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 slide-up">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">ML-Powered Predictions</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 slide-up" style={{ animationDelay: "100ms" }}>
              <span className="gradient-text">Predict. Plan.</span>
              <br />
              <span className="text-foreground">Ride Smarter.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 slide-up" style={{ animationDelay: "200ms" }}>
              RideWise uses advanced machine learning to predict bike rental demand based on weather, 
              time, and seasonal patterns. Make data-driven decisions effortlessly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center slide-up" style={{ animationDelay: "300ms" }}>
              <Link to="/signup">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="heroOutline" size="xl" className="w-full sm:w-auto">
                  Login to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/50 flex justify-center pt-2">
            <div className="w-1.5 h-3 rounded-full bg-muted-foreground/50" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How RideWise Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to unlock powerful predictions for your bike rental operations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <StepCard 
              number={1} 
              title="Input Conditions" 
              description="Enter weather data, date, and time parameters for your prediction."
            />
            <StepCard 
              number={2} 
              title="ML Processing" 
              description="Our trained model analyzes patterns from historical rental data."
            />
            <StepCard 
              number={3} 
              title="Get Predictions" 
              description="Receive accurate rental forecasts for daily or hourly periods."
            />
          </div>
        </div>
      </section>

      {/* Why RideWise */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose RideWise?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built with cutting-edge technology to deliver the most accurate rental predictions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <FeatureCard 
              icon={Brain} 
              title="ML-Powered" 
              description="Advanced machine learning algorithms trained on extensive historical data."
              delay={0}
            />
            <FeatureCard 
              icon={Cloud} 
              title="Weather-Aware" 
              description="Integrates real-time weather factors for precision forecasting."
              delay={100}
            />
            <FeatureCard 
              icon={TrendingUp} 
              title="Smart Insights" 
              description="Understand peak hours, seasonal trends, and demand patterns."
              delay={200}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to optimize your bike rental predictions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <FeatureCard 
              icon={Calendar} 
              title="Daily Prediction" 
              description="Forecast total rentals for any given day based on comprehensive factors."
              delay={0}
            />
            <FeatureCard 
              icon={Clock} 
              title="Hourly Prediction" 
              description="Get hour-by-hour predictions for granular demand planning."
              delay={100}
            />
            <FeatureCard 
              icon={MessageCircle} 
              title="AI Assistant" 
              description="Chat with our intelligent assistant for instant help and insights."
              delay={200}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center glass-card rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 gradient-primary opacity-10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Ride Smarter?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                Join RideWise today and start making data-driven decisions for your bike rental operations.
              </p>
              <Link to="/signup">
                <Button variant="gradient" size="xl">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <Chatbot />
    </div>
  );
};

export default Index;
