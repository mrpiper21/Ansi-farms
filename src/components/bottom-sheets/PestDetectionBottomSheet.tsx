import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Animated, Easing, PanResponder, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import Loader from '../loader';

export interface PestDetectionBottomSheetRef {
  open: () => void;
  close: () => void;
}

interface PestDetectionBottomSheetProps {
  onClose?: () => void;
}

const PestDetectionBottomSheet = forwardRef<PestDetectionBottomSheetRef, PestDetectionBottomSheetProps>((props, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const screenHeight = Dimensions.get('window').height;
  const animatedValue = useRef(new Animated.Value(screenHeight)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          animatedValue.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          close();
        } else {
          Animated.spring(animatedValue, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const open = () => {
    setIsVisible(true);
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const close = () => {
    Animated.timing(animatedValue, {
      toValue: screenHeight,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
      if (props.onClose) {
        props.onClose();
      }
    });
  };

  useImperativeHandle(ref, () => ({
    open,
    close,
  }));

  const pickImage = async (fromCamera: boolean) => {
    const action = fromCamera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    const permission = fromCamera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== 'granted') {
      alert(`Permission to access ${fromCamera ? 'camera' : 'gallery'} is required!`);
      return;
    }

    let result = await action({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAnalysisResult("Detected: Early Blight. Recommendation: Apply copper-based fungicide.");
    setIsLoading(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return <Loader />;
    }

    if (analysisResult) {
      return (
        <View style={styles.contentContainer}>
          <MaterialIcons name="check-circle" size={60} color={Colors.light.primary} />
          <Text style={styles.resultTitle}>Analysis Complete</Text>
          <Text style={styles.resultText}>{analysisResult}</Text>
          <TouchableOpacity style={styles.resetButton} onPress={() => {
            setSelectedImage(null);
            setAnalysisResult(null);
          }}>
            <Text style={styles.buttonText}>Scan Another Plant</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (selectedImage) {
      return (
        <View style={styles.contentContainer}>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze}>
            <Text style={styles.buttonText}>Analyze Plant</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.changePhotoButton} onPress={() => setSelectedImage(null)}>
            <Text style={styles.changePhotoText}>Choose a different photo</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
         <Text style={styles.title}>Detect Pest or Disease</Text>
        <Text style={styles.description}>Upload a photo of the affected plant to get an analysis and recommended actions.</Text>
        <TouchableOpacity style={styles.button} onPress={() => pickImage(true)}>
            <MaterialIcons name="camera-alt" size={24} color="white" />
            <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => pickImage(false)}>
            <MaterialIcons name="photo-library" size={24} color="white" />
            <Text style={styles.buttonText}>Upload from Gallery</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      transparent
      visible={isVisible}
      onRequestClose={close}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[styles.bottomSheetContainer, { transform: [{ translateY: animatedValue }] }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.handle} />
          {renderContent()}
        </Animated.View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    minHeight: '50%',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 10,
  },
  contentContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 24,
  },
  analyzeButton: {
    backgroundColor: Colors.light.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  changePhotoButton: {
    marginTop: 16,
  },
  changePhotoText: {
    color: Colors.light.primary,
    fontSize: 16,
  },
  resultContainer: {
    alignItems: 'center',
    padding: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  }
});

export default PestDetectionBottomSheet; 