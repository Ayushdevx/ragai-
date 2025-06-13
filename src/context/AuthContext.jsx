// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock users for development
const mockUsers = [
  {
    id: '1',
    email: 'test@docuai.com',
    password: 'TestUser123',
    full_name: 'Test User',
    avatar_url: null,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    email: 'admin@docuai.com',
    password: 'AdminUser123',
    full_name: 'Admin User',
    avatar_url: null,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    email: 'user@docuai.com',
    password: 'RegularUser123',
    full_name: 'Regular User',
    avatar_url: null,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    email: 'demo@docuai.com',
    password: 'DemoUser123',
    full_name: 'Demo User',
    avatar_url: null,
    created_at: new Date().toISOString()
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('auth_user');
    const storedProfile = localStorage.getItem('auth_profile');
    
    if (storedUser && storedProfile) {
      setUser(JSON.parse(storedUser));
      setProfile(JSON.parse(storedProfile));
    }
    
    setLoading(false);
  }, []);

  const signUp = async (email, password, metadata = {}) => {
    setAuthLoading(true);
    try {
      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email,
        password, // In real app, this would be hashed
        full_name: metadata.full_name || email.split('@')[0],
        avatar_url: null,
        created_at: new Date().toISOString()
      };

      // Add to mock users (in real app, this would be saved to database)
      mockUsers.push(newUser);

      // Create user session
      const { password: _, ...userWithoutPassword } = newUser;
      const userProfile = {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        avatar_url: newUser.avatar_url,
        created_at: newUser.created_at,
        updated_at: newUser.created_at
      };

      setUser(userWithoutPassword);
      setProfile(userProfile);

      // Store in localStorage
      localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('auth_profile', JSON.stringify(userProfile));

      return { user: userWithoutPassword };
    } catch (error) {
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setAuthLoading(true);
    try {
      // Find user in mock users
      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }

      // Create user session
      const { password: _, ...userWithoutPassword } = foundUser;
      const userProfile = {
        id: foundUser.id,
        email: foundUser.email,
        full_name: foundUser.full_name,
        avatar_url: foundUser.avatar_url,
        created_at: foundUser.created_at,
        updated_at: foundUser.created_at
      };

      setUser(userWithoutPassword);
      setProfile(userProfile);

      // Store in localStorage
      localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('auth_profile', JSON.stringify(userProfile));

      return { user: userWithoutPassword };
    } catch (error) {
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const signInWithOAuth = async (provider) => {
    setAuthLoading(true);
    try {
      // Mock OAuth flow - just sign in as demo user for now
      const demoUser = mockUsers.find(u => u.email === 'demo@docuai.com');
      if (demoUser) {
        const { password: _, ...userWithoutPassword } = demoUser;
        const userProfile = {
          id: demoUser.id,
          email: demoUser.email,
          full_name: `${provider} User`,
          avatar_url: null,
          created_at: demoUser.created_at,
          updated_at: demoUser.created_at
        };

        setUser(userWithoutPassword);
        setProfile(userProfile);

        localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
        localStorage.setItem('auth_profile', JSON.stringify(userProfile));

        return { user: userWithoutPassword };
      }
      throw new Error(`${provider} authentication not available in demo mode`);
    } catch (error) {
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    setAuthLoading(true);
    try {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_profile');
    } catch (error) {
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const resetPassword = async (email) => {
    setAuthLoading(true);
    try {
      // Mock password reset
      const foundUser = mockUsers.find(u => u.email === email);
      if (!foundUser) {
        throw new Error('No account found with this email address');
      }
      
      // In a real app, this would send an email
      console.log(`Password reset email would be sent to ${email}`);
      return { data: 'Password reset email sent' };
    } catch (error) {
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const updatedProfile = { ...profile, ...updates, updated_at: new Date().toISOString() };
      setProfile(updatedProfile);
      localStorage.setItem('auth_profile', JSON.stringify(updatedProfile));
      return updatedProfile;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    profile,
    loading,
    authLoading,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};