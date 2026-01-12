import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation, Bike, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Sample bike stations data (in a real app, this would come from an API)
const bikeStations = [
  { id: 1, name: "Central Park Station", bikes: 12, lat: 0, lng: 0, distance: "0.5 km" },
  { id: 2, name: "Downtown Hub", bikes: 8, lat: 0, lng: 0, distance: "0.8 km" },
  { id: 3, name: "Riverside Rentals", bikes: 15, lat: 0, lng: 0, distance: "1.2 km" },
  { id: 4, name: "University Station", bikes: 6, lat: 0, lng: 0, distance: "1.5 km" },
  { id: 5, name: "Market Square", bikes: 10, lat: 0, lng: 0, distance: "2.0 km" },
];

interface BikeStationsMapProps {
  className?: string;
}

const BikeStationsMap: React.FC<BikeStationsMapProps> = ({ className = "" }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [stations, setStations] = useState(bikeStations);
  const [selectedStation, setSelectedStation] = useState<typeof bikeStations[0] | null>(null);

  // Generate stations around user location
  const generateNearbyStations = (userLat: number, userLng: number) => {
    const offsets = [
      { lat: 0.005, lng: 0.003 },
      { lat: -0.003, lng: 0.006 },
      { lat: 0.007, lng: -0.002 },
      { lat: -0.006, lng: -0.005 },
      { lat: 0.002, lng: 0.008 },
    ];

    return bikeStations.map((station, index) => ({
      ...station,
      lat: userLat + offsets[index].lat,
      lng: userLng + offsets[index].lng,
    }));
  };

  const getUserLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        const nearbyStations = generateNearbyStations(latitude, longitude);
        setStations(nearbyStations);
        setIsLoadingLocation(false);
      },
      (error) => {
        setLocationError("Unable to get your location. Please enable location services.");
        setIsLoadingLocation(false);
        // Set default location (New York City)
        const defaultLat = 40.7128;
        const defaultLng = -74.006;
        setUserLocation({ lat: defaultLat, lng: defaultLng });
        const nearbyStations = generateNearbyStations(defaultLat, defaultLng);
        setStations(nearbyStations);
      }
    );
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim()) {
      setIsTokenSet(true);
      getUserLocation();
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !isTokenSet || !userLocation) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [userLocation.lng, userLocation.lat],
      zoom: 14,
      pitch: 45,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add user location marker
    const userMarkerEl = document.createElement('div');
    userMarkerEl.className = 'user-marker';
    userMarkerEl.innerHTML = `
      <div class="w-6 h-6 bg-blue-500 rounded-full border-3 border-white shadow-lg animate-pulse flex items-center justify-center">
        <div class="w-2 h-2 bg-white rounded-full"></div>
      </div>
    `;

    new mapboxgl.Marker({ element: userMarkerEl })
      .setLngLat([userLocation.lng, userLocation.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<p class="font-semibold text-black">Your Location</p>'))
      .addTo(map.current);

    // Add station markers
    stations.forEach((station) => {
      const markerEl = document.createElement('div');
      markerEl.className = 'station-marker cursor-pointer';
      markerEl.innerHTML = `
        <div class="relative">
          <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </div>
          <div class="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
            ${station.bikes}
          </div>
        </div>
      `;

      markerEl.addEventListener('click', () => {
        setSelectedStation(station);
      });

      new mapboxgl.Marker({ element: markerEl })
        .setLngLat([station.lng, station.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <h3 class="font-bold text-black">${station.name}</h3>
              <p class="text-sm text-gray-600">${station.bikes} bikes available</p>
              <p class="text-xs text-gray-500">${station.distance} away</p>
            </div>
          `)
        )
        .addTo(map.current!);
    });

    return () => {
      map.current?.remove();
    };
  }, [isTokenSet, userLocation, mapboxToken, stations]);

  if (!isTokenSet) {
    return (
      <div className={`bg-card rounded-2xl border border-border p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl gradient-primary">
            <MapPin className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Nearby Bike Stations</h3>
            <p className="text-sm text-muted-foreground">Enter your Mapbox token to view the map</p>
          </div>
        </div>

        <div className="bg-secondary/30 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              To use the map, you need a Mapbox public token. Get one free at{' '}
              <a 
                href="https://mapbox.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                mapbox.com
              </a>
              {' '}→ Sign up → Dashboard → Tokens
            </p>
          </div>
        </div>

        <form onSubmit={handleTokenSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter your Mapbox public token..."
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" className="gradient-primary">
            Load Map
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-2xl border border-border overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl gradient-primary">
            <MapPin className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-bold">Nearby Bike Stations</h3>
            <p className="text-xs text-muted-foreground">
              {stations.length} stations found near you
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={getUserLocation}
          disabled={isLoadingLocation}
          className="gap-2"
        >
          {isLoadingLocation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          Refresh Location
        </Button>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div ref={mapContainer} className="h-[400px] w-full" />
        
        {isLoadingLocation && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Getting your location...</p>
            </div>
          </div>
        )}

        {locationError && (
          <div className="absolute top-4 left-4 right-4 bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">{locationError}</p>
          </div>
        )}
      </div>

      {/* Stations List */}
      <div className="p-4 border-t border-border max-h-[250px] overflow-y-auto custom-scrollbar">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Bike className="h-4 w-4 text-primary" />
          Available Stations
        </h4>
        <div className="space-y-2">
          {stations.map((station) => (
            <div
              key={station.id}
              onClick={() => setSelectedStation(station)}
              className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 ${
                selectedStation?.id === station.id 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border bg-secondary/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    station.bikes > 10 
                      ? 'bg-success/20 text-success' 
                      : station.bikes > 5 
                        ? 'bg-warning/20 text-warning' 
                        : 'bg-destructive/20 text-destructive'
                  }`}>
                    <span className="font-bold text-sm">{station.bikes}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{station.name}</p>
                    <p className="text-xs text-muted-foreground">{station.distance} away</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-xs">
                  Reserve
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BikeStationsMap;
