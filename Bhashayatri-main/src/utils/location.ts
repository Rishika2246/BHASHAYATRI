/**
 * GPS & Location Services
 * Handles real-time location tracking and recommendations
 */

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  state?: string;
  city?: string;
  country?: string;
}

export interface PlaceRecommendation {
  id: string;
  name: string;
  type: 'restaurant' | 'attraction' | 'hotel' | 'transport';
  distance: number; // in meters
  rating: number;
  description: string;
  languages: string[];
  coordinates: { lat: number; lng: number };
}

let watchId: number | null = null;
let currentLocation: LocationData | null = null;

/**
 * Get current GPS location
 */
export async function getCurrentLocation(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
          };

          // Reverse geocode to get state/city
          const geocoded = await reverseGeocode(
            locationData.latitude,
            locationData.longitude
          );
          
          currentLocation = { ...locationData, ...geocoded };
          
          // Save to offline storage
          saveLocationToHistory(currentLocation);
          
          resolve(currentLocation);
        } catch (error) {
          // Even if geocoding fails, return basic location data
          const basicLocation: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
            city: 'Unknown',
            state: 'Unknown',
            country: 'Unknown',
          };
          currentLocation = basicLocation;
          resolve(basicLocation);
        }
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions in your browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please try again.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = error.message || 'An unknown error occurred';
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Start watching location changes
 */
export function startLocationTracking(
  callback: (location: LocationData) => void,
  onError?: (error: Error) => void
): void {
  if (!navigator.geolocation) {
    const error = new Error('Geolocation is not supported by your browser');
    console.error(error.message);
    if (onError) onError(error);
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    async (position) => {
      try {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        };

        const geocoded = await reverseGeocode(
          locationData.latitude,
          locationData.longitude
        );
        
        currentLocation = { ...locationData, ...geocoded };
        saveLocationToHistory(currentLocation);
        callback(currentLocation);
      } catch (error) {
        console.error('Location processing error:', error);
        if (onError && error instanceof Error) onError(error);
      }
    },
    (error) => {
      let errorMessage = 'Location tracking failed';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out';
          break;
      }
      
      const locationError = new Error(errorMessage);
      console.error('Location tracking error:', locationError);
      if (onError) onError(locationError);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
}

/**
 * Stop watching location
 */
export function stopLocationTracking(): void {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}

/**
 * Reverse geocode coordinates to location name
 */
async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ state?: string; city?: string; country?: string }> {
  try {
    // Using Nominatim API (OpenStreetMap) with proper headers
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'User-Agent': 'BhashaYatri/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      state: data.address?.state || 'Unknown',
      city: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
      country: data.address?.country || 'Unknown',
    };
  } catch (error) {
    console.warn('Reverse geocoding error:', error);
    // Return default values instead of empty object
    return {
      state: 'Unknown',
      city: 'Unknown',
      country: 'Unknown',
    };
  }
}

/**
 * Get recommendations based on current location
 */
export async function getNearbyRecommendations(
  location: LocationData,
  type?: string,
  radius: number = 5000 // 5km default
): Promise<PlaceRecommendation[]> {
  try {
    // In production, call your Python backend
    // const response = await fetch('/api/recommendations', { ... });
    
    // Mock data for now
    const mockRecommendations: PlaceRecommendation[] = [
      {
        id: '1',
        name: 'Spice Garden Restaurant',
        type: 'restaurant',
        distance: 450,
        rating: 4.5,
        description: 'Authentic local cuisine with multilingual menu',
        languages: ['Hindi', 'English', 'Tamil'],
        coordinates: { lat: location.latitude + 0.004, lng: location.longitude + 0.002 }
      },
      {
        id: '2',
        name: 'Heritage Museum',
        type: 'attraction',
        distance: 1200,
        rating: 4.8,
        description: 'Cultural heritage site with audio guides in 12 languages',
        languages: ['Hindi', 'English', 'Bengali', 'Tamil'],
        coordinates: { lat: location.latitude - 0.008, lng: location.longitude + 0.005 }
      },
      {
        id: '3',
        name: 'Local Food Market',
        type: 'restaurant',
        distance: 800,
        rating: 4.3,
        description: 'Street food paradise with translation assistance',
        languages: ['Hindi', 'English'],
        coordinates: { lat: location.latitude + 0.006, lng: location.longitude - 0.003 }
      },
    ];

    return mockRecommendations.filter(
      (rec) => !type || rec.type === type
    );
  } catch (error) {
    console.error('Recommendations error:', error);
    return [];
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Save location to history for offline access
 */
function saveLocationToHistory(location: LocationData): void {
  try {
    const history = getLocationHistory();
    history.unshift(location);
    
    // Keep only last 50 locations
    const trimmed = history.slice(0, 50);
    
    localStorage.setItem('location_history', JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving location:', error);
  }
}

/**
 * Get location history
 */
export function getLocationHistory(): LocationData[] {
  try {
    const history = localStorage.getItem('location_history');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    return [];
  }
}

/**
 * Get current cached location
 */
export function getCachedLocation(): LocationData | null {
  return currentLocation;
}

/**
 * Get Indian state avatar emoji based on location
 */
export function getStateAvatar(state?: string): string {
  const avatarMap: Record<string, string> = {
    'Kerala': '🥥',
    'Tamil Nadu': '🏛️',
    'Karnataka': '🌸',
    'Maharashtra': '🏙️',
    'Rajasthan': '🐪',
    'Gujarat': '🦁',
    'Delhi': '🏛️',
    'Goa': '🏖️',
    'Punjab': '🌾',
    'Uttar Pradesh': '🕌',
    'West Bengal': '🐟',
    'Himachal Pradesh': '⛰️',
  };

  return avatarMap[state || ''] || '🗺️';
}

/**
 * Check if location permission is granted
 */
export async function checkLocationPermission(): Promise<'granted' | 'denied' | 'prompt'> {
  if (!navigator.permissions) {
    return 'prompt';
  }
  
  try {
    const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    return result.state as 'granted' | 'denied' | 'prompt';
  } catch (error) {
    return 'prompt';
  }
}

/**
 * Get location permission status with user-friendly message
 */
export async function getLocationPermissionStatus(): Promise<{
  status: 'granted' | 'denied' | 'prompt';
  message: string;
  canRequest: boolean;
}> {
  const status = await checkLocationPermission();
  
  const messages = {
    granted: 'Location access is enabled',
    denied: 'Location access is blocked. Please enable it in your browser settings.',
    prompt: 'Location access not yet requested'
  };
  
  return {
    status,
    message: messages[status],
    canRequest: status !== 'denied'
  };
}
