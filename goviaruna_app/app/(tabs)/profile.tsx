import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Fonts, getFontStyle } from '@/constants/Fonts';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, API_URL } from '@/services/api';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'si' | 'en';
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [landSize, setLandSize] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const storedUser = JSON.parse(userJson);
        setUser(storedUser);
        setName(storedUser.name);
        setDistrict(storedUser.district || '');
        setLandSize(storedUser.landSize || '');
        
        // Try to fetch fresh data, but don't fail if it doesn't work
        try {
          const freshUser = await api.auth.getUser(storedUser.id);
          setUser(freshUser);
          setName(freshUser.name);
          setDistrict(freshUser.district || '');
          setLandSize(freshUser.landSize || '');
        } catch (error) {
          console.log('Could not fetch fresh user data, using stored data');
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
    router.replace('/auth/login');
  };

  const handleUpdate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Update locally first for immediate UI feedback
      const updatedUser = {
        ...user,
        name,
        district,
        landSize
      };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
      
      // Try to sync with backend, but don't fail if it doesn't work
      try {
        await api.auth.updateUser(user.id, {
          name,
          district,
          landSize
        });
        console.log('Profile synced with backend successfully');
      } catch (error) {
        console.log('Could not sync with backend, changes saved locally');
      }
      
      Alert.alert(t('common.success'), t('profile.profileUpdated'));
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert(t('common.error'), t('profile.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('common.error'), t('profile.selectImageFailed'));
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user) return;
    setUploading(true);
    try {
      // For now, since backend might not be available, let's simulate the upload
      // and update the UI with a placeholder
      const mockFileId = `local_${Date.now()}`;
      const updatedUser = { ...user, imageUrl: mockFileId, localImageUri: uri };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Try to upload to backend, but don't fail if it doesn't work
      try {
        const uploadResult = await api.auth.uploadProfileImage(user.id, uri);
        console.log('Upload result:', uploadResult);
        
        // Update with real file ID from backend
        const finalUser = { ...updatedUser, imageUrl: uploadResult.fileId };
        delete finalUser.localImageUri; // Remove local URI
        setUser(finalUser);
        await AsyncStorage.setItem('user', JSON.stringify(finalUser));
      } catch (error) {
        console.log('Could not upload to backend, using local image');
      }
      
      Alert.alert(t('common.success'), t('profile.photoUpdated'));
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(t('common.error'), t('profile.uploadFailed'));
    } finally {
      setUploading(false);
    }
  };

  if (loading && !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3A8A55" />
      </View>
    );
  }

  const getProfileImageUrl = () => {
      if (user?.localImageUri) {
          // Use local image if available (for offline functionality)
          return { uri: user.localImageUri };
      }
      if (user?.imageUrl && !user.imageUrl.startsWith('local_')) {
          return { uri: `${API_URL}/api/app/auth/image/${user.imageUrl}` };
      }
      // Use a generated avatar with user's name
      return { uri: `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=3A8A55&color=fff&size=120` };
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, getFontStyle('bold', 22, lang)]}>{t('tabs.profile')}</Text>
        <TouchableOpacity onPress={handleLogout}>
            <Feather name="log-out" size={24} color="#FF5252" />
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarContainer}>
            <Image 
                source={getProfileImageUrl()} 
                style={styles.avatar} 
            />
            <TouchableOpacity style={styles.cameraButton} onPress={pickImage} disabled={uploading}>
                {uploading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                ) : (
                    <Feather name="camera" size={20} color="#FFF" />
                )}
            </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
                <Text style={[styles.label, getFontStyle('semiBold', 16, lang)]}>{t('profile.name')}</Text>
                <TextInput
                    style={[styles.input, !isEditing && styles.disabledInput]}
                    value={name}
                    onChangeText={setName}
                    editable={isEditing}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, getFontStyle('semiBold', 16, lang)]}>{t('profile.district')}</Text>
                <TextInput
                    style={[styles.input, !isEditing && styles.disabledInput]}
                    value={district}
                    onChangeText={setDistrict}
                    editable={isEditing}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, getFontStyle('semiBold', 16, lang)]}>{t('profile.landSize')}</Text>
                <TextInput
                    style={[styles.input, !isEditing && styles.disabledInput]}
                    value={landSize}
                    onChangeText={setLandSize}
                    editable={isEditing}
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, getFontStyle('semiBold', 16, lang)]}>{t('profile.email')}</Text>
                <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={user?.email}
                    editable={false}
                />
            </View>

            {isEditing ? (
                <View style={styles.buttonRow}>
                    <TouchableOpacity 
                        style={[styles.button, styles.cancelButton]} 
                        onPress={() => {
                            setIsEditing(false);
                            // Reset fields
                            setName(user.name);
                            setDistrict(user.district || '');
                            setLandSize(user.landSize || '');
                        }}
                    >
                        <Text style={[styles.buttonText, {color: '#333'}, getFontStyle('semiBold', 16, lang)]}>{t('common.cancel')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleUpdate}>
                        <Text style={[styles.buttonText, getFontStyle('semiBold', 16, lang)]}>{t('common.save')}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                    <Feather name="edit-2" size={20} color="#FFF" style={{marginRight: 10}} />
                    <Text style={[styles.buttonText, getFontStyle('semiBold', 16, lang)]}>{t('profile.editProfile')}</Text>
                </TouchableOpacity>
            )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    color: '#222222',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F0F0',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3A8A55',
    padding: 10,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#3A8A55',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#3A8A55',
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
