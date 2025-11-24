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
  },
  insects: {
    classify: async (imageUri: string) => {
      try {
        const formData = new FormData();
        const filename = imageUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        // @ts-ignore - FormData expects { uri, name, type } for React Native
        formData.append('file', {
          uri: imageUri,
          name: filename,
          type: type,
        });

        const response = await fetch(`${API_URL}/api/insects/classify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Classification failed');
        }

        return data;
      } catch (error) {
        throw error;
      }
    }
  },
  collections: {
    create: async (collectionData: any) => {
      try {
        const response = await fetch(`${API_URL}/api/collections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(collectionData),
        });
        if (!response.ok) throw new Error('Failed to create collection');
        return await response.json();
      } catch (error) { throw error; }
    },
    getUserCollections: async (userId: string) => {
      try {
        const response = await fetch(`${API_URL}/api/collections/user/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch collections');
        return await response.json();
      } catch (error) { throw error; }
    },
    getCollection: async (collectionId: string) => {
      try {
        const response = await fetch(`${API_URL}/api/collections/${collectionId}`);
        if (!response.ok) throw new Error('Failed to fetch collection');
        return await response.json();
      } catch (error) { throw error; }
    },
    addItem: async (collectionId: string, itemData: any) => {
      try {
        const response = await fetch(`${API_URL}/api/collections/${collectionId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData),
        });
        if (!response.ok) throw new Error('Failed to add item');
        return await response.json();
      } catch (error) { throw error; }
    },
    removeItem: async (collectionId: string, itemIndex: number) => {
      try {
        const response = await fetch(`${API_URL}/api/collections/${collectionId}/items/${itemIndex}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to remove item');
        return await response.json();
      } catch (error) { throw error; }
    },
    delete: async (collectionId: string) => {
      try {
        const response = await fetch(`${API_URL}/api/collections/${collectionId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete collection');
        return await response.json();
      } catch (error) { throw error; }
    },
    update: async (collectionId: string, updateData: any) => {
      try {
        const response = await fetch(`${API_URL}/api/collections/${collectionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });
        if (!response.ok) throw new Error('Failed to update collection');
        return await response.json();
      } catch (error) { throw error; }
    },
    uploadImage: async (imageUri: string) => {
      try {
        const formData = new FormData();
        const filename = imageUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        // @ts-ignore
        formData.append('file', {
          uri: imageUri,
          name: filename,
          type: type,
        });

        const response = await fetch(`${API_URL}/api/collections/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        if (!response.ok) {
            const errData = await response.text();
            throw new Error(`Image upload failed: ${errData}`);
        }
        return await response.json();
      } catch (error) { throw error; }
    }
  }
};

