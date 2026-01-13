import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Speech from 'expo-speech';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as ImageManipulator from 'expo-image-manipulator';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [history, setHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);
  const recognitionInterval = useRef(null);

  // Replace with your Gemini API key
  const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

  useEffect(() => {
    return () => {
      if (recognitionInterval.current) {
        clearInterval(recognitionInterval.current);
      }
    };
  }, []);

  if (!permission) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need camera permission to recognize ASL signs</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const captureAndRecognize = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);
      
      // Capture photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
      });

      // Resize image for faster processing
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      // Send to Gemini API
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const prompt = `You are an ASL (American Sign Language) recognition expert. 
Analyze this image and identify the ASL sign being shown. 
- If it's a letter (fingerspelling), return just the letter (A-Z)
- If it's a word/phrase sign, return the word or phrase
- If no clear ASL sign is detected, return "No sign detected"
- Be concise, return ONLY the recognized sign, nothing else.`;

      const imagePart = {
        inlineData: {
          data: manipulatedImage.base64,
          mimeType: 'image/jpeg',
        },
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text().trim();

      if (text && text !== 'No sign detected') {
        setRecognizedText(text);
        
        // Add to history
        const timestamp = new Date().toLocaleTimeString();
        setHistory(prev => [{
          text,
          timestamp,
          id: Date.now()
        }, ...prev.slice(0, 19)]); // Keep last 20 items

        // Speak the recognized text
        Speech.speak(text, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.9,
        });
      }
    } catch (error) {
      console.error('Recognition error:', error);
      Alert.alert('Error', 'Failed to recognize sign. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecognition = () => {
    setIsRecognizing(true);
    setRecognizedText('');
    
    // Capture and recognize every 2 seconds
    recognitionInterval.current = setInterval(() => {
      captureAndRecognize();
    }, 2000);
  };

  const stopRecognition = () => {
    setIsRecognizing(false);
    if (recognitionInterval.current) {
      clearInterval(recognitionInterval.current);
      recognitionInterval.current = null;
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setRecognizedText('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ASL Translator</Text>
        <Text style={styles.subtitle}>Real-time Sign Language Recognition</Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
        />
        {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.processingText}>Recognizing...</Text>
          </View>
        )}
      </View>

      <View style={styles.resultContainer}>
        <Text style={styles.resultLabel}>Recognized:</Text>
        <Text style={styles.resultText}>
          {recognizedText || 'Show an ASL sign...'}
        </Text>
      </View>

      <View style={styles.controls}>
        {!isRecognizing ? (
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={startRecognition}
          >
            <Text style={styles.buttonText}>Start Recognition</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={stopRecognition}
          >
            <Text style={styles.buttonText}>Stop Recognition</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>History</Text>
          {history.length > 0 && (
            <TouchableOpacity onPress={clearHistory}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView style={styles.historyScroll}>
          {history.length === 0 ? (
            <Text style={styles.emptyHistory}>No signs recognized yet</Text>
          ) : (
            history.map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <Text style={styles.historyText}>{item.text}</Text>
                <Text style={styles.historyTime}>{item.timestamp}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#16213e',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 5,
  },
  cameraContainer: {
    height: 300,
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  resultContainer: {
    backgroundColor: '#16213e',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  resultLabel: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 5,
  },
  resultText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4ecca3',
    textAlign: 'center',
  },
  controls: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4ecca3',
  },
  stopButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyContainer: {
    flex: 1,
    backgroundColor: '#16213e',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 15,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  clearButton: {
    color: '#e74c3c',
    fontSize: 14,
  },
  historyScroll: {
    flex: 1,
  },
  emptyHistory: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  historyText: {
    fontSize: 18,
    color: '#4ecca3',
    fontWeight: '600',
  },
  historyTime: {
    fontSize: 12,
    color: '#888',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 20,
    color: '#fff',
    fontSize: 16,
  },
});
