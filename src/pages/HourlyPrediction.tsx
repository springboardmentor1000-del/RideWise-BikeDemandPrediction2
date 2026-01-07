import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Clock, 
  Thermometer, 
  Droplets, 
  Wind, 
  Cloud, 
  Sparkles, 
  TrendingUp, 
  Zap,
  Timer,
  Activity,
  Gauge
} from "lucide-react";

const seasons = ["Spring", "Summer", "Fall", "Winter"];
const weatherTypes = ["Clear", "Mist", "Light Rain/Snow", "Heavy Rain/Snow"];

const HourlyPrediction = () => {
  const [formData, setFormData] = useState({
    hour: [14],
    season: "Summer",
    workingDay: true,
    temperature: [22],
    humidity: [50],
    windspeed: [12],
    weatherSeverity: "Clear",
  });
  
  const [prediction, setPrediction] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Peak hour detection (typically 7-9 AM and 5-7 PM on working days)
  const isPeakHour = useMemo(() => {
    const hour = formData.hour[0];
    if (formData.workingDay) {
      return (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
    }
    return hour >= 11 && hour <= 16; // Weekend peak hours
  }, [formData.hour, formData.workingDay]);

  // Auto-calculated fields
  const comfortIndex = useMemo(() => {
    const temp = formData.temperature[0];
    const humidity = formData.humidity[0];
    const comfort = temp - 0.55 * (1 - humidity / 100) * (temp - 14.5);
    return Math.round(comfort * 10) / 10;
  }, [formData.temperature, formData.humidity]);

  const windChillEffect = useMemo(() => {
    const temp = formData.temperature[0];
    const wind = formData.windspeed[0];
    if (temp <= 10 && wind >= 4.8) {
      const windChill = 13.12 + 0.6215 * temp - 11.37 * Math.pow(wind, 0.16) + 0.3965 * temp * Math.pow(wind, 0.16);
      return Math.round(windChill * 10) / 10;
    }
    return temp;
  }, [formData.temperature, formData.windspeed]);

  const isWeekend = useMemo(() => {
    return !formData.workingDay;
  }, [formData.workingDay]);

  const formatHour = (hour: number) => {
    if (hour === 0) return "12:00 AM";
    if (hour === 12) return "12:00 PM";
    if (hour < 12) return `${hour}:00 AM`;
    return `${hour - 12}:00 PM`;
  };

  const handlePredict = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock prediction based on inputs
    const basePrediction = 200;
    const tempFactor = formData.temperature[0] > 15 && formData.temperature[0] < 30 ? 1.3 : 0.7;
    const humidityFactor = formData.humidity[0] < 70 ? 1.1 : 0.85;
    const weatherFactor = formData.weatherSeverity === "Clear" ? 1.4 : formData.weatherSeverity === "Heavy Rain/Snow" ? 0.4 : 0.9;
    const peakFactor = isPeakHour ? 1.8 : 1;
    const hourFactor = formData.hour[0] >= 6 && formData.hour[0] <= 22 ? 1 : 0.3;
    
    const result = Math.round(basePrediction * tempFactor * humidityFactor * weatherFactor * peakFactor * hourFactor + Math.random() * 50);
    
    setPrediction(result);
    setIsLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="slide-up relative">
          <div className="absolute -top-8 -left-8 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-accent to-primary shadow-lg shadow-accent/20">
                <Clock className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Hourly Prediction</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Timer className="h-4 w-4 text-accent" />
                  <span>Real-time Peak Detection</span>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground max-w-lg">
              Get precise hour-by-hour predictions with intelligent peak hour detection.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hour Selection */}
            <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent" />
                Time Selection
              </h3>
              
              {/* Hour Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Hour of Day</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-accent">{formatHour(formData.hour[0])}</span>
                    {isPeakHour && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                        <Zap className="h-3 w-3" />
                        Peak
                      </span>
                    )}
                  </div>
                </div>
                <Slider
                  value={formData.hour}
                  onValueChange={(v) => setFormData({ ...formData, hour: v })}
                  min={0}
                  max={23}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>12 AM</span>
                  <span>12 PM</span>
                  <span>11 PM</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Season</label>
                  <Select value={formData.season} onValueChange={(v) => setFormData({ ...formData, season: v })}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {seasons.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                  <div>
                    <p className="font-medium text-sm">Working Day</p>
                  </div>
                  <Switch
                    checked={formData.workingDay}
                    onCheckedChange={(checked) => setFormData({ ...formData, workingDay: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Weather Conditions */}
            <div className="rounded-2xl bg-card border border-border p-6 space-y-6">
              <h3 className="font-semibold flex items-center gap-2">
                <Cloud className="h-4 w-4 text-accent" />
                Weather Conditions
              </h3>
              
              {/* Temperature */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Temperature</span>
                  </div>
                  <span className="text-lg font-bold text-primary">{formData.temperature[0]}°C</span>
                </div>
                <Slider
                  value={formData.temperature}
                  onValueChange={(v) => setFormData({ ...formData, temperature: v })}
                  min={-10}
                  max={45}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>-10°C</span>
                  <span>45°C</span>
                </div>
              </div>

              {/* Humidity */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">Humidity</span>
                  </div>
                  <span className="text-lg font-bold text-accent">{formData.humidity[0]}%</span>
                </div>
                <Slider
                  value={formData.humidity}
                  onValueChange={(v) => setFormData({ ...formData, humidity: v })}
                  min={0}
                  max={100}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Windspeed */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Windspeed</span>
                  </div>
                  <span className="text-lg font-bold">{formData.windspeed[0]} km/h</span>
                </div>
                <Slider
                  value={formData.windspeed}
                  onValueChange={(v) => setFormData({ ...formData, windspeed: v })}
                  min={0}
                  max={70}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 km/h</span>
                  <span>70 km/h</span>
                </div>
              </div>

              {/* Weather Severity */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Weather Severity</label>
                <Select value={formData.weatherSeverity} onValueChange={(v) => setFormData({ ...formData, weatherSeverity: v })}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {weatherTypes.map((w) => (
                      <SelectItem key={w} value={w}>{w}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Predict Button */}
            <Button
              variant="gradient"
              size="xl"
              className="w-full"
              onClick={handlePredict}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Predict Hourly Rentals
                </>
              )}
            </Button>
          </div>

          {/* Auto-calculated & Results */}
          <div className="space-y-6">
            {/* Peak Hour Indicator */}
            <div className={`rounded-2xl p-6 ${isPeakHour ? "bg-success/10 border-2 border-success" : "bg-card border border-border"}`}>
              <div className="flex items-center gap-3 mb-2">
                <Zap className={`h-5 w-5 ${isPeakHour ? "text-success" : "text-muted-foreground"}`} />
                <span className="font-semibold">Peak Hour Status</span>
              </div>
              <p className={`text-lg font-bold ${isPeakHour ? "text-success" : "text-muted-foreground"}`}>
                {isPeakHour ? "🔥 Peak Hour!" : "Off-Peak"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isPeakHour 
                  ? "Higher demand expected during this hour"
                  : "Normal or lower demand expected"
                }
              </p>
            </div>

            {/* Auto-calculated Fields */}
            <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Auto-Calculated
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                  <span className="text-sm">Comfort Index</span>
                  <span className="font-bold text-primary">{comfortIndex}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                  <span className="text-sm">Wind Chill Effect</span>
                  <span className="font-bold text-accent">{windChillEffect}°C</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                  <span className="text-sm">Weekend</span>
                  <span className={`font-bold ${isWeekend ? "text-success" : "text-muted-foreground"}`}>
                    {isWeekend ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>

            {/* Prediction Result */}
            {prediction !== null && (
              <div className={`rounded-2xl p-6 text-primary-foreground scale-in ${isPeakHour ? "bg-gradient-to-br from-success to-accent" : "gradient-primary"}`}>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">Prediction Result</span>
                  {isPeakHour && (
                    <span className="ml-auto flex items-center gap-1 px-2 py-1 rounded-full bg-primary-foreground/20 text-xs">
                      <Zap className="h-3 w-3" />
                      Peak
                    </span>
                  )}
                </div>
                
                <div className="text-center py-4">
                  <p className="text-5xl font-bold mb-2 counter-animation">
                    {prediction.toLocaleString()}
                  </p>
                  <p className="text-primary-foreground/80">
                    Predicted rentals for {formatHour(formData.hour[0])}
                  </p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-primary-foreground/20 text-sm text-primary-foreground/70">
                  {isPeakHour 
                    ? "⚡ Peak hour - expect higher than usual demand!" 
                    : `Based on ${formData.weatherSeverity.toLowerCase()} weather at ${formData.temperature[0]}°C`
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HourlyPrediction;
