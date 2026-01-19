import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileUp, 
  Upload, 
  File, 
  CheckCircle2, 
  Sparkles, 
  ThermometerSun,
  Droplets,
  Wind,
  Calendar,
  Clock,
  Loader2,
  ArrowRight,
  X,
  FileText,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ExtractedData {
  temperature?: number;
  humidity?: number;
  windspeed?: number;
  season?: string;
  hour?: number;
  date?: string;
  weatherSeverity?: string;
}

const PDFUpload = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [progress, setProgress] = useState(0);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
      processFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);

    // Simulate processing with progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate API call to backend for PDF parsing
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    clearInterval(progressInterval);
    setProgress(100);

    // Simulated extracted data
    const mockExtractedData: ExtractedData = {
      temperature: 28.5,
      humidity: 0.65,
      windspeed: 0.21,
      season: "Summer",
      hour: 9,
      date: "2025-01-15",
      weatherSeverity: "Clear"
    };

    setExtractedData(mockExtractedData);
    setIsProcessing(false);
  };

  const handleReset = () => {
    setFile(null);
    setExtractedData(null);
    setProgress(0);
  };

  const handleUseDailyPrediction = () => {
    // In real implementation, pass data via state or context
    navigate("/dashboard/daily");
  };

  const handleUseHourlyPrediction = () => {
    navigate("/dashboard/hourly");
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-success/10 rounded-3xl blur-3xl" />
          <div className="relative bg-card/50 backdrop-blur-sm rounded-3xl p-8 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-2xl gradient-primary shadow-lg shadow-primary/30">
                <FileUp className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">PDF Upload</h1>
                <p className="text-muted-foreground">Upload weather reports to auto-fill prediction inputs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        {!file && (
          <Card className="border-border/50 overflow-hidden">
            <CardContent className="p-0">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative p-12 border-2 border-dashed rounded-2xl m-6 transition-all duration-300 ${
                  isDragging 
                    ? "border-primary bg-primary/5 scale-[1.02]" 
                    : "border-border hover:border-primary/50 hover:bg-secondary/30"
                }`}
              >
                <div className="flex flex-col items-center justify-center text-center space-y-6">
                  <div className={`p-6 rounded-3xl transition-all duration-300 ${
                    isDragging ? "bg-primary/20 scale-110" : "bg-secondary"
                  }`}>
                    <Upload className={`h-12 w-12 transition-colors ${
                      isDragging ? "text-primary" : "text-muted-foreground"
                    }`} />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {isDragging ? "Drop your PDF here" : "Drag & drop your PDF"}
                    </h3>
                    <p className="text-muted-foreground">
                      or click to browse from your computer
                    </p>
                  </div>

                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  <Button variant="outline" className="pointer-events-none">
                    <File className="h-4 w-4 mr-2" />
                    Select PDF File
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    Supported: PDF files with weather data, reports, or datasets
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing State */}
        {file && isProcessing && (
          <Card className="border-border/50 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Processing your PDF</h3>
                  <p className="text-muted-foreground">{file.name}</p>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-md">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Extracting data...</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full gradient-primary transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
                  <span className="px-3 py-1 bg-secondary rounded-full flex items-center gap-1">
                    <Zap className="h-3 w-3" /> AI-powered extraction
                  </span>
                  <span className="px-3 py-1 bg-secondary rounded-full flex items-center gap-1">
                    <FileText className="h-3 w-3" /> Parsing document
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Extracted Data */}
        {extractedData && !isProcessing && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Success Banner */}
            <div className="bg-success/10 border border-success/30 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-success">Data Extracted Successfully!</h3>
                <p className="text-sm text-muted-foreground">{file?.name}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleReset}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Extracted Values */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Extracted Values
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {extractedData.temperature !== undefined && (
                    <div className="p-4 bg-secondary/50 rounded-xl flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-orange-500/20">
                        <ThermometerSun className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Temperature</p>
                        <p className="text-xl font-bold">{extractedData.temperature}°C</p>
                      </div>
                    </div>
                  )}

                  {extractedData.humidity !== undefined && (
                    <div className="p-4 bg-secondary/50 rounded-xl flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-blue-500/20">
                        <Droplets className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Humidity</p>
                        <p className="text-xl font-bold">{(extractedData.humidity * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  )}

                  {extractedData.windspeed !== undefined && (
                    <div className="p-4 bg-secondary/50 rounded-xl flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-teal-500/20">
                        <Wind className="h-5 w-5 text-teal-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Windspeed</p>
                        <p className="text-xl font-bold">{extractedData.windspeed}</p>
                      </div>
                    </div>
                  )}

                  {extractedData.season && (
                    <div className="p-4 bg-secondary/50 rounded-xl flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-green-500/20">
                        <Calendar className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Season</p>
                        <p className="text-xl font-bold">{extractedData.season}</p>
                      </div>
                    </div>
                  )}

                  {extractedData.hour !== undefined && (
                    <div className="p-4 bg-secondary/50 rounded-xl flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-purple-500/20">
                        <Clock className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Hour</p>
                        <p className="text-xl font-bold">{extractedData.hour}:00</p>
                      </div>
                    </div>
                  )}

                  {extractedData.weatherSeverity && (
                    <div className="p-4 bg-secondary/50 rounded-xl flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-yellow-500/20">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Weather</p>
                        <p className="text-xl font-bold">{extractedData.weatherSeverity}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card 
                className="cursor-pointer hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border-border/50 hover:border-primary/30 group"
                onClick={handleUseDailyPrediction}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-4 rounded-2xl gradient-primary shadow-lg group-hover:scale-110 transition-transform">
                    <Calendar className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Use for Daily Prediction</h3>
                    <p className="text-sm text-muted-foreground">Auto-fill daily prediction form</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-xl hover:shadow-accent/10 transition-all duration-300 border-border/50 hover:border-accent/30 group"
                onClick={handleUseHourlyPrediction}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-accent to-accent/80 shadow-lg group-hover:scale-110 transition-transform">
                    <Clock className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Use for Hourly Prediction</h3>
                    <p className="text-sm text-muted-foreground">Auto-fill hourly prediction form</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>
            </div>

            {/* Upload Another */}
            <div className="text-center">
              <Button variant="outline" onClick={handleReset}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Another PDF
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PDFUpload;
