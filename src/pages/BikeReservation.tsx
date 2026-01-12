import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Bike, 
  Calendar, 
  Clock, 
  MapPin,
  IndianRupee,
  Sparkles,
  CheckCircle2,
  Zap,
  Crown,
  Timer,
  Receipt,
  ArrowRight,
  Shield,
  Star,
  AlertCircle,
  Copy,
  Download
} from "lucide-react";

interface BikeType {
  id: string;
  name: string;
  icon: React.ReactNode;
  pricePerHour: number;
  description: string;
  color: string;
  features: string[];
}

const bikeTypes: BikeType[] = [
  {
    id: "standard",
    name: "Standard",
    icon: <Bike className="h-6 w-6" />,
    pricePerHour: 20,
    description: "Perfect for casual city rides",
    color: "from-blue-500 to-blue-600",
    features: ["Comfortable seat", "Bell", "Front basket"]
  },
  {
    id: "electric",
    name: "Electric",
    icon: <Zap className="h-6 w-6" />,
    pricePerHour: 35,
    description: "Effortless riding with motor assist",
    color: "from-green-500 to-emerald-600",
    features: ["Motor assist", "LED display", "USB charging"]
  },
  {
    id: "premium",
    name: "Premium",
    icon: <Crown className="h-6 w-6" />,
    pricePerHour: 50,
    description: "Luxury experience with top features",
    color: "from-purple-500 to-violet-600",
    features: ["Carbon frame", "GPS tracking", "Premium gears"]
  }
];

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return { value: `${hour}:00`, label: `${hour}:00` };
});

interface Reservation {
  id: string;
  bikeType: BikeType;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  quantity: number;
  location: string;
  totalCost: number;
}

const BikeReservation = () => {
  const [selectedBikeType, setSelectedBikeType] = useState<string>("standard");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isReserving, setIsReserving] = useState(false);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedBike = bikeTypes.find(b => b.id === selectedBikeType)!;
  
  // Calculate duration in hours
  const calculateDuration = () => {
    if (!startTime || !endTime) return 0;
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    if (end <= start) return 0;
    return end - start;
  };

  const duration = calculateDuration();
  const totalCost = duration * selectedBike.pricePerHour * quantity;

  const handleCheckAvailability = async () => {
    setIsChecking(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsAvailable(Math.random() > 0.2); // 80% chance available
    setIsChecking(false);
  };

  const handleReserve = async () => {
    setIsReserving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newReservation: Reservation = {
      id: `RW-${Date.now().toString().slice(-8)}`,
      bikeType: selectedBike,
      date,
      startTime,
      endTime,
      duration,
      quantity,
      location: location || "Main Station",
      totalCost
    };
    
    setReservation(newReservation);
    setIsReserving(false);
  };

  const handleCopyId = () => {
    if (reservation) {
      navigator.clipboard.writeText(reservation.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNewReservation = () => {
    setReservation(null);
    setIsAvailable(null);
    setDate("");
    setStartTime("");
    setEndTime("");
    setQuantity(1);
    setLocation("");
  };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  if (reservation) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <Card className="border-success/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-transparent to-primary/10 pointer-events-none" />
            <CardContent className="p-8 relative">
              <div className="text-center space-y-6">
                {/* Success Animation */}
                <div className="relative inline-flex">
                  <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center animate-in zoom-in duration-500">
                    <CheckCircle2 className="h-12 w-12 text-success" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-success/30 animate-ping" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-success">Reservation Confirmed!</h2>
                  <p className="text-muted-foreground mt-2">Your bike is ready for pickup</p>
                </div>

                {/* Reservation ID */}
                <div className="bg-secondary/50 rounded-2xl p-4 inline-flex items-center gap-3">
                  <Receipt className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg font-mono font-bold">{reservation.id}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyId}
                    className="ml-2"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Reservation Details */}
                <div className="bg-card border border-border rounded-2xl p-6 text-left space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${reservation.bikeType.color} shadow-lg`}>
                      {reservation.bikeType.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{reservation.bikeType.name} Bike</p>
                      <p className="text-sm text-muted-foreground">x{reservation.quantity} bikes</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="font-medium">{new Date(reservation.date).toLocaleDateString('en-IN', { 
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Time</p>
                        <p className="font-medium">{reservation.startTime} - {reservation.endTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Pickup Location</p>
                        <p className="font-medium">{reservation.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Timer className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="font-medium">{reservation.duration} hours</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-lg font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold gradient-text flex items-center gap-1">
                      <IndianRupee className="h-6 w-6" />
                      {reservation.totalCost}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button variant="outline" className="flex-1 gap-2">
                    <Download className="h-4 w-4" />
                    Download Receipt
                  </Button>
                  <Button onClick={handleNewReservation} className="flex-1 gap-2">
                    <Bike className="h-4 w-4" />
                    New Reservation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-success/10 rounded-3xl blur-3xl" />
          <div className="relative bg-card/50 backdrop-blur-sm rounded-3xl p-8 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-2xl gradient-primary shadow-lg shadow-primary/30">
                <Bike className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Bike Reservation</h1>
                <p className="text-muted-foreground">Reserve your bike in advance based on predictions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Bike Type Selection */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Select Bike Type
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {bikeTypes.map((bike) => (
                  <Card 
                    key={bike.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                      selectedBikeType === bike.id 
                        ? "ring-2 ring-primary shadow-lg shadow-primary/20" 
                        : "hover:shadow-lg"
                    }`}
                    onClick={() => setSelectedBikeType(bike.id)}
                  >
                    <CardContent className="p-5">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${bike.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                        {bike.icon}
                      </div>
                      <h3 className="font-bold text-lg">{bike.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{bike.description}</p>
                      <div className="flex items-center gap-1 text-2xl font-bold gradient-text">
                        <IndianRupee className="h-5 w-5" />
                        {bike.pricePerHour}
                        <span className="text-sm font-normal text-muted-foreground">/hr</span>
                      </div>
                      <div className="mt-4 space-y-2">
                        {bike.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 text-success" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Reservation Form */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Reservation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Date
                    </label>
                    <Input
                      type="date"
                      min={today}
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setIsAvailable(null);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      Pickup Location (Optional)
                    </label>
                    <Input
                      placeholder="e.g., Main Station, Park Gate"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Start Time
                    </label>
                    <Select 
                      value={startTime} 
                      onValueChange={(v) => {
                        setStartTime(v);
                        setIsAvailable(null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot.value} value={slot.value}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      End Time
                    </label>
                    <Select 
                      value={endTime} 
                      onValueChange={(v) => {
                        setEndTime(v);
                        setIsAvailable(null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.filter(slot => {
                          if (!startTime) return true;
                          return parseInt(slot.value) > parseInt(startTime);
                        }).map((slot) => (
                          <SelectItem key={slot.value} value={slot.value}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Bike className="h-4 w-4 text-muted-foreground" />
                      Number of Bikes
                    </label>
                    <Select 
                      value={quantity.toString()} 
                      onValueChange={(v) => setQuantity(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'bike' : 'bikes'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Availability Status */}
                {isAvailable !== null && (
                  <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in ${
                    isAvailable 
                      ? "bg-success/10 border border-success/30" 
                      : "bg-destructive/10 border border-destructive/30"
                  }`}>
                    {isAvailable ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        <span className="text-success font-medium">Bikes available for your selected time!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <span className="text-destructive font-medium">Sorry, no bikes available for this time. Try different hours.</span>
                      </>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCheckAvailability}
                    disabled={!date || !startTime || !endTime || isChecking}
                    className="flex-1"
                  >
                    {isChecking ? (
                      <>
                        <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Check Availability
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleReserve}
                    disabled={!isAvailable || isReserving}
                    className="flex-1"
                  >
                    {isReserving ? (
                      <>
                        <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                        Reserving...
                      </>
                    ) : (
                      <>
                        <Bike className="h-4 w-4 mr-2" />
                        Reserve Bike
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-border/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  Price Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-6">
                {/* Selected Bike */}
                <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${selectedBike.color} text-white shadow-lg`}>
                    {selectedBike.icon}
                  </div>
                  <div>
                    <p className="font-semibold">{selectedBike.name} Bike</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      {selectedBike.pricePerHour}/hr
                    </p>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{duration || 0} hours</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-medium">{quantity} {quantity === 1 ? 'bike' : 'bikes'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rate</span>
                    <span className="font-medium flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      {selectedBike.pricePerHour} × {duration || 0}h × {quantity}
                    </span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="text-3xl font-bold gradient-text flex items-center gap-1">
                      <IndianRupee className="h-6 w-6" />
                      {totalCost || 0}
                    </span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 text-success" />
                    Free cancellation before pickup
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 text-yellow-500" />
                    4.8/5 average customer rating
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Well-maintained bikes
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BikeReservation;
