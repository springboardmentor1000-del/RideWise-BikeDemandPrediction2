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
import { Calendar, Thermometer, Droplets, Wind, Cloud, Sparkles, TrendingUp } from "lucide-react";

const seasons = ["Spring", "Summer", "Fall", "Winter"];
const years = ["2024", "2025", "2026"];
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const weatherTypes = ["Clear", "Mist", "Light Rain/Snow", "Heavy Rain/Snow"];

const DailyPrediction = () => {
  const [formData, setFormData] = useState({
    season: "Summer",
    year: "2025",
    month: "June",
    workingDay: true,
    temperature: [22],
    humidity: [50],
    windspeed: [12],
    weatherSeverity: "Clear",
  });
  
  const [prediction, setPrediction] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-calculated fields
  const comfortIndex = useMemo(() => {
    const temp = formData.temperature[0];
    const humidity = formData.humidity[0];
    // Simple comfort index calculation
    const comfort = temp - 0.55 * (1 - humidity / 100) * (temp - 14.5);
    return Math.round(comfort * 10) / 10;
  }, [formData.temperature, formData.humidity]);

  const windChillEffect = useMemo(() => {
    const temp = formData.temperature[0];
    const wind = formData.windspeed[0];
    // Wind chill effect
    if (temp <= 10 && wind >= 4.8) {
      const windChill = 13.12 + 0.6215 * temp - 11.37 * Math.pow(wind, 0.16) + 0.3965 * temp * Math.pow(wind, 0.16);
      return Math.round(windChill * 10) / 10;
    }
    return temp;
  }, [formData.temperature, formData.windspeed]);

  const isWeekend = useMemo(() => {
    return !formData.workingDay;
  }, [formData.workingDay]);

  const handlePredict = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock prediction based on inputs
    const basePrediction = 4000;
    const tempFactor = formData.temperature[0] > 15 && formData.temperature[0] < 30 ? 1.2 : 0.8;
    const humidityFactor = formData.humidity[0] < 70 ? 1.1 : 0.9;
    const weatherFactor = formData.weatherSeverity === "Clear" ? 1.3 : formData.weatherSeverity === "Heavy Rain/Snow" ? 0.5 : 1;
    const workingDayFactor = formData.workingDay ? 1.1 : 1.2;
    
    const result = Math.round(basePrediction * tempFactor * humidityFactor * weatherFactor * workingDayFactor + Math.random() * 500);
    
    setPrediction(result);
    setIsLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="slide-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold">Daily Prediction</h1>
          </div>
          <p className="text-muted-foreground">
            Forecast total bike rentals for an entire day based on comprehensive factors.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date & Season */}
            <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Date & Season
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Year</label>
                  <Select value={formData.year} onValueChange={(v) => setFormData({ ...formData, year: v })}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {years.map((y) => (
                        <SelectItem key={y} value={y}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Month</label>
                  <Select value={formData.month} onValueChange={(v) => setFormData({ ...formData, month: v })}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {months.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="font-medium">Working Day</p>
                  <p className="text-sm text-muted-foreground">Is this a working day?</p>
                </div>
                <Switch
                  checked={formData.workingDay}
                  onCheckedChange={(checked) => setFormData({ ...formData, workingDay: checked })}
                />
              </div>
            </div>

            {/* Weather Conditions */}
            <div className="rounded-2xl bg-card border border-border p-6 space-y-6">
              <h3 className="font-semibold flex items-center gap-2">
                <Cloud className="h-4 w-4 text-primary" />
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
                  Predict Daily Rentals
                </>
              )}
            </Button>
          </div>

          {/* Auto-calculated & Results */}
          <div className="space-y-6">
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
              <div className="rounded-2xl gradient-primary p-6 text-primary-foreground scale-in">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">Prediction Result</span>
                </div>
                
                <div className="text-center py-4">
                  <p className="text-5xl font-bold mb-2 counter-animation">
                    {prediction.toLocaleString()}
                  </p>
                  <p className="text-primary-foreground/80">
                    Estimated daily bike rentals
                  </p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-primary-foreground/20 text-sm text-primary-foreground/70">
                  Based on {formData.season}, {formData.weatherSeverity.toLowerCase()} weather, 
                  {formData.temperature[0]}°C temperature.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DailyPrediction;
