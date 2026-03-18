import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    country?: string;
  };
  joinedDate: string;
  preferences?: {
    language: string;
    notifications: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: SignupData) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    country?: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Create demo user if no users exist
    const storedUsers = JSON.parse(localStorage.getItem('bhashayatri_users') || '[]');
    if (storedUsers.length === 0) {
      const demoUser = {
        id: 'user_demo123',
        name: 'Demo User',
        email: 'demo@bhashayatri.com',
        phone: '+91 9876543210',
        password: 'demo123',
        location: {
          latitude: 28.6139,
          longitude: 77.2090,
          city: 'New Delhi',
          country: 'India'
        },
        joinedDate: new Date().toISOString(),
        preferences: {
          language: 'en',
          notifications: true
        }
      };
      localStorage.setItem('bhashayatri_users', JSON.stringify([demoUser]));
      console.log('✅ Demo user created! Email: demo@bhashayatri.com | Password: demo123');
    }

    // Check for existing session
    const storedUser = localStorage.getItem('bhashayatri_user');
    const storedToken = localStorage.getItem('bhashayatri_token');
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('✅ Session restored for:', parsedUser.email);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('bhashayatri_user');
        localStorage.removeItem('bhashayatri_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔐 Login attempt:', email);
    
    try {
      // Call Python backend API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData: User = data.user;
        const token = data.token;

        console.log('✅ Backend login successful:', userData.email);
        localStorage.setItem('bhashayatri_user', JSON.stringify(userData));
        localStorage.setItem('bhashayatri_token', token);
        setUser(userData);
        
        // Small delay to ensure state propagates
        await new Promise(resolve => setTimeout(resolve, 100));
        
        toast.success(`Welcome back, ${userData.name}! 🎉`);
        console.log('🚀 Login complete, redirecting to dashboard...');
        return true;
      } else {
        const error = await response.json();
        console.log('❌ Backend login failed:', error);
        toast.error(error.message || 'Invalid credentials');
        return false;
      }
    } catch (error) {
      console.log('⚠️ Backend unavailable, using local storage fallback');
      
      // Fallback for development/testing
      const storedUsers = JSON.parse(localStorage.getItem('bhashayatri_users') || '[]');
      console.log('📦 Found users in storage:', storedUsers.length);
      
      const foundUser = storedUsers.find((u: any) => u.email === email && u.password === password);

      if (foundUser) {
        const { password: _, ...userData } = foundUser;
        console.log('✅ Local login successful:', userData.email);
        
        // Set user in state and storage
        localStorage.setItem('bhashayatri_user', JSON.stringify(userData));
        localStorage.setItem('bhashayatri_token', 'dev_token_' + Date.now());
        setUser(userData);
        
        // Small delay to ensure state propagates
        await new Promise(resolve => setTimeout(resolve, 100));
        
        toast.success(`Welcome back, ${userData.name}! 🎉`);
        console.log('🚀 Login complete, redirecting to dashboard...');
        return true;
      }
      
      console.log('❌ Invalid credentials');
      toast.error('Invalid email or password');
      return false;
    }
  };

  const signup = async (userData: SignupData): Promise<boolean> => {
    try {
      // Call Python backend API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        const newUser: User = data.user;
        const token = data.token;

        localStorage.setItem('bhashayatri_user', JSON.stringify(newUser));
        localStorage.setItem('bhashayatri_token', token);
        setUser(newUser);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        toast.success(`Welcome to BhashaYatri, ${newUser.name}! 🚀`);
        return true;
      } else {
        const error = await response.json();
        toast.error(error.message || 'Signup failed');
        return false;
      }
    } catch (error) {
      // Fallback for development/testing
      const storedUsers = JSON.parse(localStorage.getItem('bhashayatri_users') || '[]');
      
      // Check if email already exists
      if (storedUsers.some((u: any) => u.email === userData.email)) {
        toast.error('Email already registered');
        return false;
      }

      const newUser: User = {
        id: 'user_' + Date.now(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        location: userData.location,
        joinedDate: new Date().toISOString(),
        preferences: {
          language: 'en',
          notifications: true,
        },
      };

      storedUsers.push({ ...newUser, password: userData.password });
      localStorage.setItem('bhashayatri_users', JSON.stringify(storedUsers));
      localStorage.setItem('bhashayatri_user', JSON.stringify(newUser));
      localStorage.setItem('bhashayatri_token', 'dev_token_' + Date.now());
      
      setUser(newUser);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      toast.success(`Welcome to BhashaYatri, ${newUser.name}! 🚀`);
      return true;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bhashayatri_user');
    localStorage.removeItem('bhashayatri_token');
    toast.success('Logged out successfully');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('bhashayatri_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
