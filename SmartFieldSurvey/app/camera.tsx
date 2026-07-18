import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useSurvey } from '@/context/SurveyContext';
import AppHeader from '@/components/AppHeader';

export default function CameraScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { setCurrentSurvey, currentSurvey } = useSurvey();

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [photo, setPhoto] = useState<string | null>(null);
  const [captureTime, setCaptureTime] = useState<string>('');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const cameraRef = useRef<any>(null);

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Camera" />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Camera" />
        <View style={styles.centerContent}>
          <Ionicons name="camera-outline" size={80} color={colors.textSecondary} />
          <Text style={[styles.permissionTitle, { color: colors.text }]}>Camera Access Required</Text>
          <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
            We need your permission to access the camera for capturing site photos.
          </Text>
          <Pressable
            onPress={requestPermission}
            style={({ pressed }) => [
              styles.permissionButton,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Ionicons name="camera" size={20} color="#FFFFFF" />
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const savePhotoToGallery = async (uri: string) => {
    try {
      if (typeof MediaLibrary.requestPermissionsAsync === 'function') {
        const permission = await MediaLibrary.requestPermissionsAsync(true);
        if (permission.status === 'granted') {
          await MediaLibrary.createAssetAsync(uri);
          return true;
        }
      }
    } catch {}

    const fileName = `field-survey-${Date.now()}.jpg`;
    const destUri = `${FileSystem.documentDirectory}field-survey/`;
    await FileSystem.makeDirectoryAsync(destUri, { intermediates: true });
    const filePath = `${destUri}${fileName}`;
    await FileSystem.copyAsync({ from: uri, to: filePath });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath);
    }
    return true;
  };

  const handleCapture = async () => {
    if (!cameraRef.current || !isCameraReady || isCapturing) return;

    setIsCapturing(true);
    try {
      const result = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (result?.uri) {
        setPhoto(result.uri);
        setCaptureTime(formatTime(new Date()));

        try {
          const saved = await savePhotoToGallery(result.uri);
          if (saved) {
            Alert.alert('Saved', 'Photo has been saved successfully.');
          }
        } catch (saveError) {
          Alert.alert('Error', 'Photo was captured but could not be saved. Please try again.');
        }
      }
    } catch {
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    setPhoto(null);
    setCaptureTime('');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPhoto(null);
            setCaptureTime('');
            Alert.alert('Deleted', 'Photo has been deleted.');
          },
        },
      ]
    );
  };

  const handleAttachToSurvey = () => {
    if (photo) {
      setCurrentSurvey({ ...currentSurvey, photo });
      Alert.alert('Attached', 'Photo has been attached to the current survey.');
    }
  };

  const handleSaveToGallery = async () => {
    if (!photo || isSaving) return;

    setIsSaving(true);
    try {
      const saved = await savePhotoToGallery(photo);
      if (saved) {
        Alert.alert('Saved', 'Photo has been saved successfully.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save photo. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  if (photo) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Photo Preview" />
        <View style={styles.previewContainer}>
          <Image source={{ uri: photo }} style={styles.previewImage} resizeMode="cover" />

          <View style={[styles.captureTimeContainer, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
            <Ionicons name="time" size={16} color="#FFFFFF" />
            <Text style={styles.captureTimeText}>{captureTime}</Text>
          </View>
        </View>

        <View style={[styles.previewActions, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <Pressable
            onPress={handleRetake}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.primaryLight },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="refresh" size={22} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>Retake</Text>
          </Pressable>

          <Pressable
            onPress={handleSaveToGallery}
            disabled={isSaving}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.primaryLight },
              isSaving && { opacity: 0.55 },
              pressed && { opacity: 0.7 },
            ]}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="download" size={22} color={colors.primary} />
            )}
            <Text style={[styles.actionText, { color: colors.primary }]}>Save</Text>
          </Pressable>

          <Pressable
            onPress={handleAttachToSurvey}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.secondaryLight },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="attach" size={22} color={colors.secondary} />
            <Text style={[styles.actionText, { color: colors.secondary }]}>Attach</Text>
          </Pressable>

          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.dangerLight },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="trash" size={22} color={colors.danger} />
            <Text style={[styles.actionText, { color: colors.danger }]}>Delete</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Camera" subtitle="Capture site photos" />

      <View style={styles.cameraContainer}>
        {!isCameraReady && (
          <View style={[styles.loadingOverlay, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Opening camera...</Text>
          </View>
        )}

        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          onCameraReady={() => setIsCameraReady(true)}
        />

        {isCapturing && (
          <View style={styles.capturingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}
      </View>

      <View style={[styles.controls, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Pressable
          onPress={toggleFacing}
          style={({ pressed }) => [
            styles.controlButton,
            { backgroundColor: colors.background },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons name="camera-reverse" size={28} color={colors.text} />
        </Pressable>

        <Pressable
          onPress={handleCapture}
          disabled={!isCameraReady || isCapturing}
          style={({ pressed }) => [
            styles.captureButton,
            { borderColor: colors.primary },
            (!isCameraReady || isCapturing) && { opacity: 0.5 },
            pressed && { opacity: 0.7 },
          ]}
        >
          <View style={[styles.captureButtonInner, { backgroundColor: colors.primary }]} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.controlButton,
            { backgroundColor: colors.background },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons name="flash" size={28} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  capturingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderTopWidth: 1,
  },
  controlButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    flex: 1,
  },
  captureTimeContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  captureTimeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  previewActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  actionButton: {
    flexGrow: 1,
    flexBasis: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
