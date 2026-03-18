import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Navigation as NavIcon, Utensils, MapPinned, Star, Phone, Globe, AlertCircle, Info, Edit2, Check, HelpCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { Input } from "../ui/input";
import { toast } from "sonner@2.0.3";
import { LocationPermissionGuide } from "../LocationPermissionGuide";
import {
  getCurrentLocation,
  getNearbyRecommendations,
  LocationData,
  PlaceRecommendation,
  calculateDistance,
} from "../../utils/location";
import { useAuth } from "../../contexts/AuthContext";

export function LocationPage() {
  const { user } = useAuth();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [recommendations, setRecommendations] = useState<PlaceRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [manualLocation, setManualLocation] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    // Use user's signup location as initial location if available
    if (user?.location) {
      const userLoc: LocationData = {
        latitude: user.location.latitude,
        longitude: user.location.longitude,
        accuracy: 100,
        timestamp: Date.now(),
        city: user.location.city,
        state: undefined,
        country: user.location.country,
      };
      setLocation(userLoc);
      loadRecommendations(userLoc);
    }
  }, [user]);

  const loadLocation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
      
      const recs = await getNearbyRecommendations(loc);
      setRecommendations(recs);
      
      toast.success('📍 Location detected successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to get your location';
      console.error('Location error:', errorMessage);
      setError(errorMessage);
      
      // Show different toast based on error type
      if (errorMessage.includes('denied')) {
        toast.error('Location permission denied', {
          description: 'Please enable location access or enter your location manually'
        });
      } else if (errorMessage.includes('unavailable')) {
        toast.error('Location unavailable', {
          description: 'Please check your device settings or enter location manually'
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecommendations = async (loc: LocationData) => {
    try {
      const recs = await getNearbyRecommendations(loc);
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const handleManualLocation = async () => {
    if (!manualLocation.trim()) {
      toast.error('Please enter a location');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Call geocoding API to convert location name to coordinates
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLocation)}&limit=1`,
        {
          headers: {
            'User-Agent': 'BhashaYatri/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const geocodedLocation: LocationData = {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          accuracy: 1000, // Manual entry has lower accuracy
          timestamp: Date.now(),
          city: result.display_name.split(',')[0],
          state: result.display_name.split(',')[1]?.trim(),
          country: 'India'
        };
        
        setLocation(geocodedLocation);
        const recs = await getNearbyRecommendations(geocodedLocation);
        setRecommendations(recs);
        setShowManualInput(false);
        setManualLocation('');
        
        toast.success(`📍 Location set to ${result.display_name}`);
      } else {
        toast.error('Location not found. Please try a different search.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Failed to find location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterRecommendations = () => {
    if (selectedType === 'all') return recommendations;
    return recommendations.filter((r) => r.type === selectedType);
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1564507592333-c60657eea523?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWolMjBtYWhhbCUyMGluZGlhfGVufDF8fHx8MTc2MDE2MzUyNHww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="India"
          className="w-full h-full object-cover opacity-5 blur-sm"
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="mb-2">📍 Location & Recommendations</h1>
          <p className="text-gray-600">Discover nearby places with language assistance</p>
        </motion.div>

        {/* Error Alert with Solutions */}
        {error && !location && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <p className="mb-3">{error}</p>
                
                <div className="space-y-3 text-sm">
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      size="sm" 
                      onClick={() => setShowGuide(true)}
                      className="bg-[#ff6b35] hover:bg-[#ff8c5a] text-white rounded-full"
                    >
                      <HelpCircle className="w-3 h-3 mr-1" />
                      How to Enable Location
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setError(null);
                        setShowManualInput(true);
                      }}
                      className="rounded-full border-[#138808] text-[#138808] hover:bg-[#138808]/10"
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Enter Location Manually
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Manual Location Input */}
        <AnimatePresence>
          {showManualInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="p-6 glass border-[#FF9933]/30">
                <h4 className="mb-3 flex items-center gap-2 text-[#000080]">
                  <Edit2 className="w-5 h-5 text-[#FF9933]" />
                  Enter Location Manually
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Enter any city, landmark, or address to find nearby recommendations
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Taj Mahal, Mumbai Central, Jaipur..."
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualLocation()}
                    className="rounded-full border-[#FF9933]/30 focus:border-[#FF9933]"
                  />
                  <Button
                    onClick={handleManualLocation}
                    disabled={isLoading || !manualLocation.trim()}
                    className="gradient-india text-white rounded-full px-8"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Finding...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Location Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-6 mb-6 border-white/30"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-[#000080]">
              <MapPin className="w-5 h-5 text-[#FF9933]" />
              Your Current Location
            </h3>
            <div className="flex gap-2">
              <Button
                onClick={loadLocation}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="rounded-full border-[#138808] text-[#138808] hover:bg-[#138808]/10"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh GPS
                  </>
                )}
              </Button>
            </div>
          </div>

          {location ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 bg-white/50 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">City</p>
                  <p>{location.city || 'Unknown'}</p>
                </div>
                {location.state && (
                  <div className="p-3 bg-white/50 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">State</p>
                    <p>{location.state}</p>
                  </div>
                )}
                <div className="p-3 bg-white/50 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">Country</p>
                  <p>{location.country || 'India'}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#FF9933]/10 to-[#138808]/10 rounded-xl">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-[#000080]" />
                  <span className="text-gray-700">
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </span>
                </div>
                <Badge variant="outline" className="border-[#138808] text-[#138808]">
                  ±{location.accuracy.toFixed(0)}m
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <NavIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {isLoading ? 'Getting your location...' : error ? 'Unable to get location' : 'Enable GPS to discover nearby places'}
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={loadLocation}
                  className="gradient-india text-white rounded-full px-8"
                  disabled={isLoading}
                >
                  <NavIcon className="w-4 h-4 mr-2" />
                  Enable GPS Location
                </Button>
                <Button
                  onClick={() => setShowManualInput(true)}
                  variant="outline"
                  className="rounded-full border-[#138808] text-[#138808] hover:bg-[#138808]/10"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Enter Manually
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Filter Tabs */}
        {location && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { type: 'all', icon: '🗺️', label: 'All' },
              { type: 'restaurant', icon: '🍽️', label: 'Food' },
              { type: 'attraction', icon: '🏛️', label: 'Attractions' },
              { type: 'hotel', icon: '🏨', label: 'Hotels' },
              { type: 'transport', icon: '🚌', label: 'Transport' }
            ].map(({ type, icon, label }) => (
              <Button
                key={type}
                onClick={() => setSelectedType(type)}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                className={`rounded-full whitespace-nowrap ${
                  selectedType === type ? 'gradient-india text-white' : 'border-gray-300'
                }`}
              >
                {icon} {label}
              </Button>
            ))}
          </div>
        )}

        {/* Recommendations Grid */}
        {location && recommendations.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterRecommendations().map((place, index) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 glass border-white/30 hover:border-[#FF9933]/50 hover:shadow-lg transition-all h-full flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-[#000080] mb-2">{place.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>{place.rating}</span>
                        <span>•</span>
                        <MapPin className="w-3 h-3" />
                        <span>{formatDistance(place.distance)}</span>
                      </div>
                    </div>
                    <Badge className="gradient-india text-white shrink-0">
                      {place.type}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 flex-grow">{place.description}</p>

                  {/* Languages Supported */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">🌐 Languages Available:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {place.languages.map((lang) => (
                        <Badge key={lang} variant="outline" className="text-xs border-[#138808]/30">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <Button
                      size="sm"
                      className="gradient-india text-white rounded-full"
                      onClick={() => {
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}`;
                        window.open(url, '_blank');
                      }}
                    >
                      <NavIcon className="w-3 h-3 mr-1" />
                      Navigate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full border-[#138808]/30"
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {location && filterRecommendations().length === 0 && (
          <div className="text-center py-16 glass rounded-3xl">
            <MapPinned className="w-20 h-20 mx-auto mb-4 text-gray-400" />
            <h3 className="text-[#000080] mb-2">No places found</h3>
            <p className="text-gray-600">
              {selectedType === 'all'
                ? 'No recommendations available for this location'
                : `No ${selectedType}s found nearby`}
            </p>
            <Button
              onClick={() => setSelectedType('all')}
              variant="outline"
              className="mt-4 rounded-full"
            >
              Show All Categories
            </Button>
          </div>
        )}

        {/* API Info */}
        <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900 mb-1">
                <strong>🔌 Python Backend Integration</strong>
              </p>
              <p className="text-xs text-blue-700 font-mono">
                GET /api/recommendations?lat={location?.latitude.toFixed(4) || 'XX'}&lng={location?.longitude.toFixed(4) || 'XX'}&type={selectedType}&radius=5000
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Location Permission Guide Modal */}
      <LocationPermissionGuide open={showGuide} onOpenChange={setShowGuide} />
    </div>
  );
}
