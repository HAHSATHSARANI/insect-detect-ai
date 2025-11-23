import { Platform } from 'react-native';

// Helper to determine the base URL based on the environment
// For Android Emulator, use 10.0.2.2 to access host localhost
// For iOS Simulator, use 127.0.0.1
// For Physical Device, replace with your machine's local IP address (e.g., 192.168.1.x)
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.10.43.103:8000';
  }
  return 'http://10.10.43.103:8000';
};

export const API_URL = getBaseUrl();

export const api = {
  auth: {
    signup: async (userData: any) => {
      try {
        const response = await fetch(`${API_URL}/api/app/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.detail || 'Signup failed');
        }
        
        return data;
      } catch (error) {
        throw error;
      }
    },

    login: async (credentials: any) => {
      try {
        const response = await fetch(`${API_URL}/api/app/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.detail || 'Login failed');
        }
        
        return data;
      } catch (error) {
        throw error;
      }
    }
  }
};

