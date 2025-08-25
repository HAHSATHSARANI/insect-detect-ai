import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { CameraView, useCameraPermissions, CameraType, FlashMode } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Fonts } from '@/constants/Fonts';

const CAMERA_CONTENT = {
  permissionTitle: 'We need your permission to show the camera',
  grantPermission: 'Grant Permission',
  instruction: 'රාමුව තුල එක් කෘමියෙකු අල්ලා ගන්න',
  helpText: 'සහාය ඉල්ලන්න',
};

export default function CameraScreen() {
  const router = useRouter();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View />; // Camera permissions are still loading.
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>{CAMERA_CONTENT.permissionTitle}</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>{CAMERA_CONTENT.grantPermission}</Text>
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
      const photo = await cameraRef.current.takePictureAsync();
      console.log(photo);
      // TODO: Navigate to a preview screen with the photo
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
           <Text style={styles.instructionText}>{CAMERA_CONTENT.instruction}</Text>
           <View style={styles.bottomButtons}>
              <TouchableOpacity>
                <Feather name="image" size={32} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.shutterButton} onPress={takePicture}>
                <View style={styles.shutterButtonInner} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.helpButton}>
                <Feather name="help-circle" size={32} color="#FFFFFF" />
              </TouchableOpacity>
           </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#222' },
  permissionText: { ...Fonts.styles.regular, fontSize: 18, color: 'white', textAlign: 'center', marginBottom: 20 },
  permissionButton: { backgroundColor: '#3A8A55', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  permissionButtonText: { ...Fonts.styles.semiBold, color: 'white', fontSize: 16 },
  camera: { flex: 1 },
  topControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: 60, left: 20, right: 20, zIndex: 1 },
  focusFrameContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  focusFrame: { width: 250, height: 250, borderWidth: 2, borderColor: '#FFFFFF', borderRadius: 10, borderStyle: 'dashed' },
  bottomControls: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#3A8A55', paddingTop: 15, paddingBottom: 40 },
  instructionText: { ...Fonts.styles.regular, fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 20 },
  bottomButtons: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 30 },
  shutterButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'transparent', borderWidth: 4, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  shutterButtonInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF' },
  helpButton: { alignItems: 'center' },
});
