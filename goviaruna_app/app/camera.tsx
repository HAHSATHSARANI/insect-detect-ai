import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, Modal, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions, CameraType, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Fonts, getFontStyle } from '@/constants/Fonts';
import { useTranslation } from 'react-i18next';
import PagerView from 'react-native-pager-view';

const { width, height } = Dimensions.get('window');

export default function CameraScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'si' | 'en';
  
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [permission, requestPermission] = useCameraPermissions();
  const [helpVisible, setHelpVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const cameraRef = useRef<CameraView>(null);
  const pagerRef = useRef<PagerView>(null);

  if (!permission) {
    return <View />; // Camera permissions are still loading.
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={[styles.permissionText, getFontStyle('regular', 18, lang)]}>{t('camera.permission_title')}</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={[styles.permissionButtonText, getFontStyle('semiBold', 16, lang)]}>{t('camera.grant_permission')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };
  
  const toggleFlash = () => {
    setFlash(current => (current === 'off' ? 'on' : 'off'));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        console.log('Captured photo:', photo);
        if (photo && photo.uri) {
          // Navigate to the details screen with the image URI
          router.push({
            pathname: '/insect-details',
            params: { imageUri: photo.uri }
          });
        }
      } catch (error) {
        console.error('Failed to take picture:', error);
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        router.push({
          pathname: '/insect-details',
          params: { imageUri: result.assets[0].uri }
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <CameraView style={styles.camera} facing={facing} flash={flash} ref={cameraRef}>
        {/* Top Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="x" size={30} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={toggleFlash} style={{ marginRight: 20 }}>
              <Feather name={flash === 'on' ? 'zap' : 'zap-off'} size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleCameraFacing}>
              <Feather name="rotate-cw" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Center Focus Frame */}
        <View style={styles.focusFrameContainer}>
          <View style={styles.focusFrame} />
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
           <Text style={[styles.instructionText, getFontStyle('regular', 16, lang)]}>{t('camera.instruction')}</Text>
           <View style={styles.bottomButtons}>
              <TouchableOpacity onPress={pickImage}>
                <Feather name="image" size={32} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.shutterButton} onPress={takePicture}>
                <View style={styles.shutterButtonInner} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.helpButton} onPress={() => setHelpVisible(true)}>
                <Feather name="help-circle" size={32} color="#FFFFFF" />
              </TouchableOpacity>
           </View>
        </View>
      </CameraView>

      {/* Help Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={helpVisible}
        onRequestClose={() => setHelpVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setHelpVisible(false)}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
            
            <Text style={StyleSheet.flatten([styles.modalTitle, getFontStyle('bold', 22, lang)])}>
              {t('camera.help_modal_title')}
            </Text>

            <PagerView 
              style={styles.pager} 
              initialPage={0} 
              ref={pagerRef}
              onPageSelected={e => setCurrentPage(e.nativeEvent.position)}
            >
              {/* Page 1: Centered */}
              <View style={styles.page} key="1">
                <View style={[styles.imageExample, styles.imageCorrect]}>
                  <Image source={require('@/assets/images/butterfly.png')} style={styles.exampleImage} />
                  <View style={styles.focusFrameSmall} />
                  <View style={[styles.statusIcon, styles.statusCorrect]}>
                    <Feather name="check" size={20} color="white" />
                  </View>
                </View>
                <View style={[styles.imageExample, styles.imageIncorrect]}>
                  <Image source={require('@/assets/images/butterfly.png')} style={[styles.exampleImage, styles.exampleImageOffCenter]} />
                  <View style={styles.focusFrameSmall} />
                   <View style={[styles.statusIcon, styles.statusIncorrect]}>
                    <Feather name="x" size={20} color="white" />
                  </View>
                </View>
              </View>
              {/* Page 2: Too Far */}
              <View style={styles.page} key="2">
                <View style={[styles.imageExample, styles.imageCorrect]}>
                  <Image source={require('@/assets/images/butterfly.png')} style={[styles.exampleImage, { transform: [{ scale: 1.2 }] }]} />
                  <View style={styles.focusFrameSmall} />
                  <View style={[styles.statusIcon, styles.statusCorrect]}>
                    <Feather name="check" size={20} color="white" />
                  </View>
                </View>
                <View style={[styles.imageExample, styles.imageIncorrect]}>
                  <Image source={require('@/assets/images/butterfly.png')} style={[styles.exampleImage, { transform: [{ scale: 0.5 }] }]} />
                  <View style={styles.focusFrameSmall} />
                   <View style={[styles.statusIcon, styles.statusIncorrect]}>
                    <Feather name="x" size={20} color="white" />
                  </View>
                </View>
              </View>
              {/* Page 3: Blurry */}
              <View style={styles.page} key="3">
                <View style={[styles.imageExample, styles.imageCorrect]}>
                  <Image source={require('@/assets/images/butterfly.png')} style={styles.exampleImage} />
                  <View style={styles.focusFrameSmall} />
                  <View style={[styles.statusIcon, styles.statusCorrect]}>
                    <Feather name="check" size={20} color="white" />
                  </View>
                </View>
                <View style={[styles.imageExample, styles.imageIncorrect]}>
                  <Image source={require('@/assets/images/butterfly.png')} style={[styles.exampleImage, { opacity: 0.5 }]} />
                  <View style={styles.focusFrameSmall} />
                   <View style={[styles.statusIcon, styles.statusIncorrect]}>
                    <Feather name="x" size={20} color="white" />
                  </View>
                </View>
              </View>
            </PagerView>
            
            <Text style={StyleSheet.flatten([styles.mainText, getFontStyle('semiBold', 18, lang)])}>
              {currentPage === 0 && t('camera.help_modal_main_text')}
              {currentPage === 1 && t('camera.help_modal_p2_main')}
              {currentPage === 2 && t('camera.help_modal_p3_main')}
            </Text>
            <Text style={StyleSheet.flatten([styles.subText, getFontStyle('regular', 15, lang)])}>
              {currentPage === 0 && t('camera.help_modal_sub_text')}
              {currentPage === 1 && t('camera.help_modal_p2_sub')}
              {currentPage === 2 && t('camera.help_modal_p3_sub')}
            </Text>

            <View style={styles.dotsContainer}>
                {[...Array(3)].map((_, i) => (
                  <View key={i} style={[styles.dot, currentPage === i && styles.dotActive]} />
                ))}
            </View>

            <TouchableOpacity 
              style={styles.nextButton} 
              onPress={() => {
                if (currentPage < 2) {
                  pagerRef.current?.setPage(currentPage + 1);
                } else {
                  setHelpVisible(false);
                }
              }}
            >
              <Text style={StyleSheet.flatten([styles.nextButtonText, getFontStyle('bold', 16, lang)])}>
                {currentPage === 2 ? t('camera.help_modal_finish') : t('camera.help_modal_next')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#222' },
  permissionText: { fontSize: 18, color: 'white', textAlign: 'center', marginBottom: 20 },
  permissionButton: { backgroundColor: '#3A8A55', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  permissionButtonText: { color: 'white', fontSize: 16 },
  camera: { flex: 1 },
  topControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: 60, left: 20, right: 20, zIndex: 1 },
  focusFrameContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  focusFrame: { width: 250, height: 250, borderWidth: 2, borderColor: '#FFFFFF', borderRadius: 10, borderStyle: 'dashed' },
  bottomControls: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#3A8A55', paddingTop: 15, paddingBottom: 40 },
  instructionText: { fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 20 },
  bottomButtons: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 30 },
  shutterButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'transparent', borderWidth: 4, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  shutterButtonInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF' },
  helpButton: { alignItems: 'center' },
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 40, // Space for the close button
    alignItems: 'center',
    height: height * 0.8,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    left: 15,
  },
  modalTitle: {
    marginBottom: 15,
  },
  pager: {
    width: '100%',
    height: 250, // Adjust as needed
    marginBottom: 20,
  },
  page: {
    width: '100%',
    alignItems: 'center',
  },
  imageExample: {
    width: '80%',
    height: 110,
    borderRadius: 16,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  imageCorrect: {
    backgroundColor: '#E8F5E9', // Light green
  },
  imageIncorrect: {
    backgroundColor: '#FFEBEE', // Light red
  },
  exampleImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  exampleImageOffCenter: {
    transform: [{ translateX: 40 }, { translateY: -20 }],
  },
  focusFrameSmall: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 10,
    borderStyle: 'dashed',
    position: 'absolute',
  },
  statusIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 10,
    right: 10,
  },
  statusCorrect: {
    backgroundColor: '#4CAF50', // Green
  },
  statusIncorrect: {
    backgroundColor: '#F44336', // Red
  },
  mainText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#3A8A55',
  },
  nextButton: {
    backgroundColor: '#3A8A55',
    borderRadius: 25,
    paddingVertical: 14,
    width: '80%',
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
  },
});
