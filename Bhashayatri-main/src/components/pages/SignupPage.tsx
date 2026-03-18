import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, Lock, MapPin, Sparkles, UserPlus, Navigation, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner@2.0.3';

interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    country?: string;
  } | null;
}

interface SignupPageProps {
  onSignup: (userData: any) => Promise<boolean>;
  onSwitchToLogin: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSignup, onSwitchToLogin }) => {
  const [formData, setFormData] = useState<SignupData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    location: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SignupData, string>>>({});
  const [locationError, setLocationError] = useState<string>('');

  const handleInputChange = (field: keyof SignupData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
    setErrors({ ...errors, [field]: undefined });
  };

  const getLocation = async () => {
    setIsGettingLocation(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocoding to get address
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await response.json();

        setFormData({
          ...formData,
          location: {
            latitude,
            longitude,
            address: data.display_name,
            city: data.address?.city || data.address?.town || data.address?.village,
            country: data.address?.country,
          },
        });

        toast.success('Location captured successfully! 📍');
      } catch (error) {
        // Fallback: just save coordinates
        setFormData({
          ...formData,
          location: {
            latitude,
            longitude,
          },
        });
        toast.success('Location captured! 📍');
      }
    } catch (error: any) {
      let errorMessage = 'Failed to get location';

      if (error.code === 1) {
        errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable. Please check your device settings.';
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out. Please try again.';
      }

      setLocationError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SignupData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.location) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { confirmPassword, ...signupData } = formData;
      await onSignup(signupData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#FF9933]/10 via-white to-[#138808]/10">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF9933]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#138808]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#000080]/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-block"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#FF9933] via-white to-[#138808] p-0.5">
                <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-[#FF9933]" />
                </div>
              </div>
            </motion.div>
            <h1 className="text-[#000080] mb-2">Join BhashaYatri</h1>
            <p className="text-gray-600">Create your account and start exploring</p>
          </div>

          {/* Signup Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="backdrop-blur-xl bg-white/70 rounded-3xl p-8 shadow-2xl border border-white/20"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700">
                    Full Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange('name')}
                      className="pl-10 bg-white/50 border-gray-200 focus:border-[#FF9933] focus:ring-[#FF9933]"
                      placeholder="Your Name"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      className="pl-10 bg-white/50 border-gray-200 focus:border-[#FF9933] focus:ring-[#FF9933]"
                      placeholder="your@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700">
                    Phone Number *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange('phone')}
                      className="pl-10 bg-white/50 border-gray-200 focus:border-[#FF9933] focus:ring-[#FF9933]"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm">{errors.phone}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">
                    Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange('password')}
                      className="pl-10 bg-white/50 border-gray-200 focus:border-[#FF9933] focus:ring-[#FF9933]"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700">
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange('confirmPassword')}
                      className="pl-10 bg-white/50 border-gray-200 focus:border-[#FF9933] focus:ring-[#FF9933]"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Location Section */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <Label className="text-gray-700">Location *</Label>
                <div className="flex flex-col gap-3">
                  <Button
                    type="button"
                    onClick={getLocation}
                    disabled={isGettingLocation}
                    className="w-full bg-gradient-to-r from-[#138808] to-[#0a5505] hover:opacity-90 text-white"
                  >
                    {isGettingLocation ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Getting Location...</span>
                      </div>
                    ) : formData.location ? (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        <span>Update Location</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Navigation className="w-5 h-5" />
                        <span>Capture Current Location</span>
                      </div>
                    )}
                  </Button>

                  {formData.location && (
                    <Alert className="bg-green-50 border-green-200">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700">
                        <p>Location captured successfully!</p>
                        {formData.location.address && (
                          <p className="text-sm mt-1">{formData.location.address}</p>
                        )}
                        <p className="text-sm mt-1">
                          📍 {formData.location.latitude.toFixed(4)}, {formData.location.longitude.toFixed(4)}
                        </p>
                      </AlertDescription>
                    </Alert>
                  )}

                  {locationError && (
                    <Alert className="bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700">
                        {locationError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {errors.location && (
                    <p className="text-red-500 text-sm">{errors.location}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#FF9933] via-[#000080] to-[#138808] hover:opacity-90 text-white py-6 rounded-xl mt-6"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    <span>Create Account</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/70 text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Switch to Login */}
            <Button
              type="button"
              onClick={onSwitchToLogin}
              variant="outline"
              className="w-full border-[#138808] text-[#138808] hover:bg-[#138808]/10"
            >
              Login to Your Account
            </Button>
          </motion.div>

          {/* Footer */}
          <p className="text-center text-gray-500 text-sm mt-6">
            By creating an account, you agree to our Terms & Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  );
};
