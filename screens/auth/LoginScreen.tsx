import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { GraduationCap, ArrowRight, User } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://kids-attendance-production.up.railway.app';

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [rollNumber, setRollNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  
  // School Branding States
  const [schoolName, setSchoolName] = useState('Student Attendance\n& Engagement');
  const [schoolLogo, setSchoolLogo] = useState('');

  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null)
  ];

  // Fetch School Branding Details on Mount
  useEffect(() => {
    const fetchSchoolBranding = async () => {
      try {
        const res = await fetch(`${API_URL}/settings/school`);
        if (res.ok) {
          const data = await res.json();
          if (data.name) setSchoolName(data.name);
          if (data.logo) setSchoolLogo(data.logo);
        }
      } catch (err) {
        console.log('Using default school branding due to connection/fallback.', err);
      }
    };
    fetchSchoolBranding();
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only keep the single digit
    setOtp(newOtp);

    // Auto-focus next input field if digit is filled
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Move to previous input field on Backspace press if current value is empty
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleLoginSubmit = async () => {
    const otpValue = otp.join('');
    if (!rollNumber.trim()) {
      Alert.alert('Missing Field', 'Please enter your Roll Number.');
      return;
    }
    if (otpValue.length < 4) {
      Alert.alert('Missing OTP', 'Please enter the full 4-digit Magic Code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roll_number: rollNumber, otp: otpValue }),
      });

      if (res.ok) {
        await AsyncStorage.setItem('studentRoll', rollNumber);
        // Clean OTP entries
        setOtp(['', '', '', '']);
        setIsLoading(false);
        navigation.navigate('WellnessScreen');
      } else {
        const errorData = await res.json().catch(() => ({}));
        Alert.alert('Invalid Code', errorData.message || '❌ Invalid Magic Code! Please ask your teacher for today\'s code.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Connection Issue', 'Could not connect to the school server. Please verify your connection.');
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ede9fe', '#fdf2f8', '#e0f2fe']}
        style={StyleSheet.absoluteFillObject}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Top Logo / School Brand Banner */}
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 100 }}
            style={styles.brandContainer}
          >
            {schoolLogo ? (
              <Image source={{ uri: schoolLogo }} style={styles.logoImage} resizeMode="contain" />
            ) : (
              <View style={styles.logoPlaceholder}>
                <GraduationCap size={40} color="#8b5cf6" />
              </View>
            )}
            <Text style={styles.schoolNameText}>{schoolName}</Text>
          </MotiView>

          {/* Glassmorphic Card Entry Portal */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 200 }}
            style={styles.loginCard}
          >
            <Text style={styles.welcomeText}>Welcome Back! ✨</Text>
            <Text style={styles.instructionText}>Enter your Roll Number and today's 4-digit Magic Code to record your attendance.</Text>

            {/* Roll Number Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <User size={20} color="#8b5cf6" />
              </View>
              <TextInput
                placeholder="Roll Number (e.g. STU101)"
                value={rollNumber}
                onChangeText={setRollNumber}
                style={styles.rollInput}
                autoCapitalize="characters"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* separate 4-digit OTP Inputs */}
            <Text style={styles.otpLabel}>TODAY'S MAGIC CODE</Text>
            <View style={styles.otpInputGroup}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={inputRefs[index]}
                  value={digit}
                  onChangeText={(val) => handleOtpChange(val, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  secureTextEntry={true}
                  style={styles.otpBox}
                  textAlign="center"
                  placeholder="●"
                  placeholderTextColor="#cbd5e1"
                />
              ))}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleLoginSubmit}
              disabled={isLoading}
              style={styles.submitButton}
            >
              <LinearGradient
                colors={['#8b5cf6', '#db2777']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <View style={styles.submitRow}>
                    <Text style={styles.submitText}>Enter Classroom</Text>
                    <ArrowRight size={18} color="#fff" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

          </MotiView>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoImage: {
    width: 90,
    height: 90,
    borderRadius: 24,
    marginBottom: 16,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  schoolNameText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e293b',
    textAlign: 'center',
    lineHeight: 28,
  },
  loginCard: {
    width: width - 48,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 30,
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  inputIconContainer: {
    marginRight: 12,
  },
  rollInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
  },
  otpLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 12,
  },
  otpInputGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 12,
  },
  otpBox: {
    flex: 1,
    height: 56,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 15,
  },
});
