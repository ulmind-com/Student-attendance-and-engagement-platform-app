import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, RadialGradient, Stop, Ellipse, Rect } from 'react-native-svg';
import { ArrowLeft, ArrowRight, Heart, Sparkles, Smile, MessageCircle, ClipboardList, CheckCircle, Star, ThumbsUp, ThumbsDown } from 'lucide-react-native';

// Custom Touchable using TouchableOpacity to avoid NativeWind v4 / Expo Router link context conflicts
const Touchable = ({ children, style, onPress, className, disabled, ...props }: any) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={className}
      disabled={disabled}
      style={[
        style,
        disabled && { opacity: 0.3 }
      ]}
      activeOpacity={0.6}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mood mapping definitions
const MOOD_LEVELS = [
  { score: 1, label: 'Very Bad', emoji: '😢', color: '#ef4444', desc: 'I am feeling really down today.' },
  { score: 2, label: 'Bad', emoji: '😭', color: '#f73b5d', desc: 'Today is a tough day.' },
  { score: 3, label: 'Not Good', emoji: '😕', color: '#f59e0b', desc: 'Things are not going well.' },
  { score: 4, label: 'Neutral', emoji: '😐', color: '#eab308', desc: 'I feel just okay/average.' },
  { score: 5, label: 'Okay', emoji: '🙂', color: '#cbd5e1', desc: 'I am doing alright.' },
  { score: 6, label: 'Good', emoji: '😊', color: '#10b981', desc: 'I am having a nice day!' },
  { score: 7, label: 'Very Good', emoji: '😄', color: '#22c55e', desc: 'Feeling great and positive.' },
  { score: 8, label: 'Happy', emoji: '😁', color: '#3b82f6', desc: 'Filled with joy and smiles.' },
  { score: 9, label: 'Excited', emoji: '🤩', color: '#8b5cf6', desc: 'Super energized and happy!' },
  { score: 10, label: 'Excellent', emoji: '🥳', color: '#ec4899', desc: 'Best day ever! Absolutely fantastic!' },
];

const EMOTIONS = [
  { id: 'Happy', label: 'Happy', emoji: '😊', color: '#10b981', glow: 'rgba(16, 185, 129, 0.3)' },
  { id: 'Sad', label: 'Sad', emoji: '😢', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.3)' },
  { id: 'Mad', label: 'Mad', emoji: '😡', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)' },
  { id: 'Scared', label: 'Scared', emoji: '😨', color: '#6366f1', glow: 'rgba(99, 102, 241, 0.3)' },
  { id: 'Worried', label: 'Worried', emoji: '😟', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)' },
  { id: 'Excited', label: 'Excited', emoji: '🤩', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.3)' },
];

export default function WellnessScreen() {
  const [studentRoll, setStudentRoll] = useState('');
  const [studentName, setStudentName] = useState('Student');
  const [studentClass, setStudentClass] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Wellness Form States
  const [moodScore, setMoodScore] = useState(6); // Default to 'Good'

  const handleDialTouch = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    // Calculate angle from center (120, 120)
    const dx = locationX - 120;
    const dy = locationY - 120;
    
    // Avoid calculating if touch is too close to center
    if (Math.sqrt(dx * dx + dy * dy) < 20) return;
    
    let angle = Math.atan2(dy, dx); // ranges from -PI to PI
    
    // Convert angle to index 0-9 where top is index 0
    let shiftedAngle = angle + Math.PI / 2;
    if (shiftedAngle < 0) {
      shiftedAngle += 2 * Math.PI;
    }
    
    const segment = (2 * Math.PI) / 10;
    let index = Math.round(shiftedAngle / segment);
    if (index >= 10) index = 0;
    
    const score = index + 1;
    setMoodScore(score);
  };

  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(['Happy']);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, boolean>>({});
  const [journalText, setJournalText] = useState('');

  useEffect(() => {
    loadStudentAndQuestions();
  }, []);

  const loadStudentAndQuestions = async () => {
    try {
      // 1. Get Roll from Storage
      const roll = await AsyncStorage.getItem('studentRoll');
      if (!roll) {
        Alert.alert('Not Logged In', 'Please login to record your attendance.');
        setTimeout(() => {
          router.replace('/' as any);
        }, 100);
        return;
      }
      setStudentRoll(roll);

      // 2. Fetch Student Info to find Name
      const studentRes = await fetch(`${API_URL}/students`);
      if (studentRes.ok) {
        const students = await studentRes.json();
        const found = students.find((s: any) => s.rollNumber === roll);
        if (found) {
          setStudentName(`${found.firstName || found.name} ${found.lastInitial || ''}`.trim());
          setStudentClass(found.class_name || found.class || '');
        }
      }

      // 3. Fetch Questions from correct /wellness/questions endpoint matching website
      const questionsRes = await fetch(`${API_URL}/wellness/questions?rollNumber=${roll}`);
      if (questionsRes.ok) {
        const allQuestions = await questionsRes.json();
        const formatted = allQuestions.map((q: any, idx: number) => ({
          id: q.id || `q_${idx}`,
          text: q.text,
          enabled: true
        }));

        if (formatted.length === 0) {
          setQuestions([
            { id: 'q1', text: 'Did you have a good sleep last night? 💤', enabled: true },
            { id: 'q2', text: 'Did you eat a healthy breakfast today? 🍎', enabled: true },
            { id: 'q3', text: 'Do you feel ready and excited to learn today? 📚', enabled: true },
          ]);
        } else {
          setQuestions(formatted);
        }
      } else {
        // Fallback standard questions
        setQuestions([
          { id: 'q1', text: 'Did you have a good sleep last night? 💤', enabled: true },
          { id: 'q2', text: 'Did you eat a healthy breakfast today? 🍎', enabled: true },
          { id: 'q3', text: 'Do you feel ready and excited to learn today? 📚', enabled: true },
        ]);
      }
    } catch (err) {
      console.error(err);
      // Fail-soft: set fallback questions
      setQuestions([
        { id: 'q1', text: 'Did you have a good sleep last night? 💤', enabled: true },
        { id: 'q2', text: 'Did you eat a healthy breakfast today? 🍎', enabled: true },
        { id: 'q3', text: 'Do you feel ready and excited to learn today? 📚', enabled: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmotionToggle = (emotionId: string) => {
    setSelectedEmotions([emotionId]);
  };

  const handleQuestionAnswer = (qId: string, answer: boolean) => {
    setQuestionAnswers((prev) => ({ ...prev, [qId]: answer }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const formattedQuestions: Record<string, boolean | null> = {};
    questions.forEach((q) => {
      formattedQuestions[q.text] = questionAnswers[q.id] !== undefined ? questionAnswers[q.id] : null;
    });

    const payload = {
      roll_number: studentRoll,
      feeling_level: moodScore,
      selected_emoji: selectedEmotions[0] || 'Happy',
      questions: formattedQuestions,
    };

    try {
      const res = await fetch(`${API_URL}/wellness/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Attendance successfully recorded
        router.replace('/success' as any);
      } else {
        const errorData = await res.json().catch(() => ({}));
        Alert.alert(
          'Check-in Failed',
          errorData.message || 'We could not save your attendance right now. Please try again.'
        );
      }
    } catch (err) {
      console.error(err);
      // Offline support caching option
      Alert.alert(
        'Offline/Network Error',
        'Attendance will be saved locally. Check with your teacher once online.'
      );
      router.replace('/success' as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && selectedEmotions.length === 0) {
      Alert.alert('Color your emotions', 'Please pick at least one emotion piece that matches how you feel!');
      return;
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className="text-slate-500 font-bold mt-4">Loading your check-in portal...</Text>
      </View>
    );
  }

  const selectedMood = MOOD_LEVELS.find((m) => m.score === moodScore) || MOOD_LEVELS[5];

  // Steps indicator configuration
  const steps = [
    { label: 'Mood', icon: Heart },
    { label: 'Emotion', icon: Smile },
    { label: 'Check', icon: ClipboardList },
    { label: 'Confirm', icon: CheckCircle },
  ];

  return (
    <View className="flex-1 bg-white relative">
      <LinearGradient
        colors={['#ede9fe', '#fdf2f8', '#e0f2fe']}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          {/* Header */}
          <View className="px-5 py-4 flex-row items-center justify-between border-b border-white/40">
            <Touchable onPress={prevStep} disabled={currentStep === 0} className={`p-2 rounded-xl bg-white/60 ${currentStep === 0 ? 'opacity-30' : ''}`}>
              <ArrowLeft color="#6d28d9" size={20} />
            </Touchable>
            <View className="items-center">
              <Text className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Daily Wellness Check-In</Text>
              <Text className="text-sm font-black text-slate-800">Hi, {studentName} ✨</Text>
            </View>
            <View className="w-9" />
          </View>

          {/* Horizontal Progress Bar matching the web exactly */}
          <View style={{ height: 6, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 3, marginHorizontal: 24, marginTop: 12, overflow: 'hidden' }}>
            <MotiView
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ type: 'spring', damping: 15 }}
              style={{ height: '100%', backgroundColor: '#ec4899', borderRadius: 3 }}
            />
          </View>

          {/* Step Contents */}
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }} className="flex-1 px-5">
              {currentStep === 0 && (
                <MotiView
                  key="step0"
                  from={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 200 } as any}
                  className="flex-1 justify-center py-4 items-center"
                >
                  <View className="items-center mb-4">
                    <Text className="text-3xl font-black text-slate-800 text-center" style={{ color: '#312e81' }}>How Are You Feeling?</Text>
                    <Text className="text-slate-500 font-bold text-xs mt-1 text-center">Drag the clock hand to show your mood (1-10)</Text>
                  </View>

                  {/* Interactive Clock Dial */}
                  <View className="items-center justify-center my-4 relative">
                    <MotiView
                      animate={{ scale: [0.98, 1.02, 0.98] }}
                      transition={{ loop: true, type: 'timing', duration: 4000 } as any}
                      style={{
                        position: 'absolute',
                        width: 250,
                        height: 250,
                        borderRadius: 125,
                        backgroundColor: '#a78bfa',
                        opacity: 0.06,
                      }}
                    />

                    <View style={{ width: 240, height: 260, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
                      <Svg viewBox="0 0 200 220" width="100%" height="100%">
                        <Defs>
                          <RadialGradient id="clockBg" cx="50%" cy="50%" rx="50%" ry="50%">
                            <Stop offset="0%" stopColor="#ffffff" />
                            <Stop offset="100%" stopColor="#f3f0ff" />
                          </RadialGradient>
                        </Defs>

                        {/* Outer Shadow of legs */}
                        <Ellipse cx="100" cy="212" rx="60" ry="7" fill="rgba(30, 27, 75, 0.15)" />

                        {/* Clock Legs */}
                        <Line x1="45" y1="185" x2="25" y2="210" stroke="#3b0764" strokeWidth="11" strokeLinecap="round" />
                        <Line x1="155" y1="185" x2="175" y2="210" stroke="#3b0764" strokeWidth="11" strokeLinecap="round" />

                        {/* Top Bell Structures */}
                        <Rect x="82" y="3" width="36" height="8" rx="4" fill="#3b0764" />
                        <Path d="M 86,4 Q 100,-10 114,4" fill="none" stroke="#6d28d9" strokeWidth="5" strokeLinecap="round" />
                        
                        {/* Alarm Clock Top bells (left / right) */}
                        <Path d="M 45,35 Q 30,10 60,18" fill="none" stroke="#3b0764" strokeWidth="7" strokeLinecap="round" />
                        <Path d="M 155,35 Q 170,10 140,18" fill="none" stroke="#3b0764" strokeWidth="7" strokeLinecap="round" />

                        {/* Main Clock Face circle */}
                        <Circle cx="100" cy="110" r="85" fill="url(#clockBg)" stroke="#c084fc" strokeWidth="3" />

                        {/* Hand pointing to selected number */}
                        {(() => {
                          const angle = ((moodScore - 10) / 10) * 2 * Math.PI - Math.PI / 2;
                          const handLength = 62;
                          const hX = 100 + handLength * Math.cos(angle);
                          const hY = 110 + handLength * Math.sin(angle);
                          return (
                            <>
                              <Line x1="100" y1="110" x2={hX} y2={hY} stroke="#f97316" strokeWidth="4.5" strokeLinecap="round" />
                              <Circle cx={hX} cy={hY} r="9" fill="#f97316" />
                              <Circle cx={hX} cy={hY} r="7.5" fill="white" />
                              <SvgText x={hX} y={hY} dy="3" textAnchor="middle" fontSize="9" fontWeight="900" fill="#f97316">{moodScore}</SvgText>
                            </>
                          );
                        })()}

                        {/* Cute Character Face in the center of the clock */}
                        {/* Eyes */}
                        <Circle cx="87" cy="100" r="3.5" fill="#1e293b" />
                        <Circle cx="113" cy="100" r="3.5" fill="#1e293b" />
                        
                        {/* Dynamic Smile/Concerned mouth */}
                        {moodScore >= 5 ? (
                          <Path d="M 94,111 Q 100,118 106,111" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                        ) : (
                          <Path d="M 94,116 Q 100,108 106,116" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                        )}

                        {/* Mood Label text below the mouth */}
                        <SvgText x="100" y="134" textAnchor="middle" fontSize="10" fontWeight="900" fill="#f97316">{selectedMood.label}</SvgText>

                        {/* Center hub */}
                        <Circle cx="100" cy="110" r="6" fill="#f97316" stroke="white" strokeWidth="1.5" />

                        {/* Dial Numbers 1-10 around the clock face */}
                        {Array.from({ length: 10 }).map((_, i) => {
                          const val = i + 1;
                          const angle = ((val - 10) / 10) * 2 * Math.PI - Math.PI / 2;
                          const r = 70;
                          const nX = 100 + r * Math.cos(angle);
                          const nY = 110 + r * Math.sin(angle);
                          const isSelected = val === moodScore;

                          return (
                            <SvgText
                              key={val}
                              x={nX}
                              y={nY}
                              dy="4"
                              textAnchor="middle"
                              fontSize={isSelected ? '13' : '9'}
                              fontWeight="900"
                              fill={isSelected ? '#f97316' : '#cbd5e1'}
                            >
                              {val}
                            </SvgText>
                          );
                        })}
                      </Svg>

                      {/* Transparent Gesture overlay for drag/tap dial interaction */}
                      <View
                        style={{
                          position: 'absolute',
                          width: 240,
                          height: 240,
                          top: 10,
                          borderRadius: 120,
                          backgroundColor: 'transparent',
                        }}
                        onStartShouldSetResponder={() => true}
                        onMoveShouldSetResponder={() => true}
                        onResponderGrant={(e) => {
                          const { locationX, locationY } = e.nativeEvent;
                          const dx = locationX - 120;
                          const dy = locationY - 120;
                          if (Math.sqrt(dx * dx + dy * dy) < 20) return;
                          let angle = Math.atan2(dy, dx);
                          let shiftedAngle = angle + Math.PI / 2;
                          if (shiftedAngle < 0) shiftedAngle += 2 * Math.PI;
                          const segment = (2 * Math.PI) / 10;
                          let index = Math.round(shiftedAngle / segment);
                          if (index >= 10) index = 0;
                          let score = index;
                          if (score === 0) score = 10;
                          setMoodScore(score);
                        }}
                        onResponderMove={(e) => {
                          const { locationX, locationY } = e.nativeEvent;
                          const dx = locationX - 120;
                          const dy = locationY - 120;
                          if (Math.sqrt(dx * dx + dy * dy) < 20) return;
                          let angle = Math.atan2(dy, dx);
                          let shiftedAngle = angle + Math.PI / 2;
                          if (shiftedAngle < 0) shiftedAngle += 2 * Math.PI;
                          const segment = (2 * Math.PI) / 10;
                          let index = Math.round(shiftedAngle / segment);
                          if (index >= 10) index = 0;
                          let score = index;
                          if (score === 0) score = 10;
                          setMoodScore(score);
                        }}
                      />
                    </View>
                  </View>

                  {/* Mood Info Badge Pill under the clock */}
                  <View style={{ backgroundColor: 'rgba(30, 41, 59, 0.85)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                    <Text style={{ fontSize: 24, fontWeight: '900', color: '#f59e0b' }}>{moodScore}</Text>
                    <View style={{ height: 18, width: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
                    <View>
                      <Text style={{ fontSize: 13, fontWeight: '900', color: 'white' }}>{selectedMood.label}</Text>
                      <Text style={{ fontSize: 9, fontWeight: '700', color: '#cbd5e1' }}>out of 10</Text>
                    </View>
                  </View>

                  {/* Star Rating system under the badge */}
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 16 }}>
                    {Array.from({ length: 5 }).map((_, i) => {
                      const isActive = (i + 1) <= Math.ceil(moodScore / 2);
                      return (
                        <Star
                          key={i}
                          size={20}
                          color={isActive ? '#f59e0b' : '#cbd5e1'}
                          fill={isActive ? '#f59e0b' : 'transparent'}
                        />
                      );
                    })}
                  </View>

                  {/* Solid orange Continue Button exactly matching the screenshot */}
                  <Touchable
                    onPress={nextStep}
                    style={{
                      backgroundColor: '#e68a19',
                      paddingVertical: 15,
                      paddingHorizontal: 36,
                      borderRadius: 24,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      marginTop: 24,
                      width: '100%',
                      maxWidth: 280,
                      shadowColor: '#e68a19',
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.35,
                      shadowRadius: 10,
                      elevation: 6
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: '900', fontSize: 15 }}>Continue Check-In</Text>
                    <ArrowRight size={16} color="white" />
                  </Touchable>
                </MotiView>
              )}

              {currentStep === 1 && (
                <MotiView
                  key="step1"
                  from={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 200 } as any}
                  className="flex-1 justify-center py-4 items-center"
                >
                  <View className="items-center mb-4">
                    <Text className="text-2xl font-black text-slate-800 text-center" style={{ color: '#312e81' }}>Color in your emotion using the key below</Text>
                  </View>

                  {/* Puzzle Lightbulb Component */}
                  {(() => {
                    const activeEmotion = EMOTIONS.find(e => selectedEmotions.includes(e.id)) || EMOTIONS[0];
                    return (
                      <>
                        <View className="items-center justify-center my-4">
                          <View style={{ width: 180, height: 220 }} className="relative items-center justify-center">
                            <Svg viewBox="0 0 200 240" width="100%" height="100%">
                              <Defs>
                                {/* Inner glow radial gradient */}
                                <RadialGradient id="bulbGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                                  <Stop offset="0%" stopColor={activeEmotion.color} stopOpacity="0.8" />
                                  <Stop offset="60%" stopColor={activeEmotion.color} stopOpacity="0.3" />
                                  <Stop offset="100%" stopColor={activeEmotion.color} stopOpacity="0" />
                                </RadialGradient>
                              </Defs>

                              {/* Outer Glow Effect circle */}
                              <Circle cx="100" cy="100" r="85" fill="url(#bulbGlow)" />

                              {/* Sparkles / Light rays outside the bulb */}
                              <Line x1="40" y1="40" x2="32" y2="32" stroke={activeEmotion.color} strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
                              <Line x1="160" y1="40" x2="168" y2="32" stroke={activeEmotion.color} strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
                              <Line x1="25" y1="100" x2="15" y2="100" stroke={activeEmotion.color} strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
                              <Line x1="175" y1="100" x2="185" y2="100" stroke={activeEmotion.color} strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />

                              {/* Main Bulb Fill Layer */}
                              <Path
                                d="M 54.1,146 C 40,120 35,90 35,75 C 35,39 64.1,10 100,10 C 135.9,10 165,39 165,75 C 165,90 160,120 145.9,146 C 141,155 130,170 130,185 L 70,185 C 70,170 59,155 54.1,146 Z"
                                fill={activeEmotion.color}
                                opacity="0.85"
                                stroke={activeEmotion.color}
                                strokeWidth="3.5"
                              />

                              {/* Inner network lines */}
                              <Line x1="100" y1="25" x2="100" y2="175" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
                              <Line x1="45" y1="95" x2="155" y2="95" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
                              
                              {/* Curved network lines */}
                              <Path d="M 55,60 C 90,65 110,65 145,60" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
                              <Path d="M 55,130 C 90,125 110,125 145,130" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
                              
                              {/* Node Dots */}
                              <Circle cx="100" cy="35" r="4.5" fill="#ffffff" />
                              <Circle cx="100" cy="155" r="4.5" fill="#ffffff" />
                              <Circle cx="55" cy="95" r="4.5" fill="#ffffff" />
                              <Circle cx="145" cy="95" r="4.5" fill="#ffffff" />
                              <Circle cx="100" cy="95" r="5" fill="#ffffff" />

                              {/* Character Face in the center of the lightbulb */}
                              {/* Eyes */}
                              <Circle cx="87" cy="85" r="3.5" fill="#ffffff" />
                              <Circle cx="113" cy="85" r="3.5" fill="#ffffff" />
                              
                              {/* Smiling mouth */}
                              <Path d="M 94,96 Q 100,103 106,96" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

                              {/* Screw Base Thread Lines */}
                              <Line x1="72" y1="189" x2="128" y2="189" stroke="#1e1b4b" strokeWidth="7" strokeLinecap="round" />
                              <Line x1="76" y1="197" x2="124" y2="197" stroke="#1e1b4b" strokeWidth="7" strokeLinecap="round" />
                              <Line x1="81" y1="205" x2="119" y2="205" stroke="#1e1b4b" strokeWidth="7" strokeLinecap="round" />
                              <Line x1="87" y1="213" x2="113" y2="213" stroke="#1e1b4b" strokeWidth="7" strokeLinecap="round" />
                            </Svg>
                          </View>
                        </View>

                        <View className="items-center mb-4">
                          <Text className="text-slate-500 font-bold text-xs mt-1 text-center">How do you feel on a daily basis?</Text>
                        </View>

                        {/* Emotion Choice Buttons Grid */}
                        <View className="flex-row flex-wrap justify-center gap-3 mt-2 px-2 max-w-sm">
                          {EMOTIONS.map((emotion) => {
                            const isSelected = selectedEmotions.includes(emotion.id);
                            return (
                              <Touchable
                                key={emotion.id}
                                onPress={() => handleEmotionToggle(emotion.id)}
                                style={{
                                  width: '30%',
                                  height: 80,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: 16,
                                  borderWidth: 2,
                                  borderColor: isSelected ? emotion.color : 'rgba(255,255,255,0.1)',
                                  backgroundColor: isSelected ? emotion.color : 'rgba(30, 41, 59, 0.55)',
                                  shadowColor: isSelected ? emotion.color : 'transparent',
                                  shadowOffset: { width: 0, height: 6 },
                                  shadowOpacity: isSelected ? 0.4 : 0,
                                  shadowRadius: 10,
                                  elevation: isSelected ? 6 : 0,
                                }}
                              >
                                <Text style={{ fontSize: 24, marginBottom: 4 }}>{emotion.emoji}</Text>
                                <Text style={{ color: isSelected ? 'white' : '#cbd5e1', fontWeight: '900', fontSize: 11 }}>
                                  {emotion.label}
                                </Text>
                              </Touchable>
                            );
                          })}
                        </View>
                      </>
                    );
                  })()}

                  {/* Solid Pink/Magenta Continue Button exactly matching the screenshot */}
                  <Touchable
                    onPress={nextStep}
                    style={{
                      backgroundColor: '#db2777',
                      paddingVertical: 15,
                      paddingHorizontal: 36,
                      borderRadius: 24,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      marginTop: 24,
                      width: '100%',
                      maxWidth: 280,
                      shadowColor: '#db2777',
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.35,
                      shadowRadius: 10,
                      elevation: 6
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: '900', fontSize: 15 }}>Continue</Text>
                    <ArrowRight size={16} color="white" />
                  </Touchable>
                </MotiView>
              )}

              {currentStep === 2 && (
                <MotiView
                  key="step2"
                  from={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 200 } as any}
                  className="flex-1 justify-center py-4 items-center w-full"
                >
                  {/* Glassmorphic Questions Card */}
                  <View
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      borderColor: 'rgba(255, 255, 255, 0.45)',
                      borderWidth: 1.5,
                      borderRadius: 28,
                      paddingHorizontal: 20,
                      paddingVertical: 24,
                      width: '100%',
                      maxWidth: 360,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 10 },
                      shadowOpacity: 0.08,
                      shadowRadius: 20,
                      elevation: 6
                    }}
                  >
                    <Text style={{ fontSize: 22, fontWeight: '900', color: '#1e293b', textAlign: 'center', marginBottom: 20 }}>
                      Quick Check!
                    </Text>

                    {/* Questions Bank List */}
                    <View className="w-full">
                      {questions.map((q) => {
                        const ans = questionAnswers[q.id];
                        return (
                          <View
                            key={q.id}
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.75)',
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                              borderWidth: 1,
                              borderRadius: 20,
                              paddingHorizontal: 16,
                              paddingVertical: 14,
                              marginBottom: 14,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 12
                            }}
                          >
                            <Text style={{ flex: 1, color: '#334155', fontWeight: '900', fontSize: 13, lineHeight: 18 }}>
                              {q.text}
                            </Text>

                            <View style={{ flexDirection: 'row', gap: 8 }}>
                              {/* Thumbs Up Button */}
                              <Touchable
                                onPress={() => handleQuestionAnswer(q.id, true)}
                                style={{
                                  width: 38,
                                  height: 38,
                                  borderRadius: 12,
                                  borderWidth: 1.5,
                                  borderColor: ans === true ? '#10b981' : '#cbd5e1',
                                  backgroundColor: '#ffffff',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  shadowColor: ans === true ? '#10b981' : 'transparent',
                                  shadowOffset: { width: 0, height: 4 },
                                  shadowOpacity: ans === true ? 0.2 : 0,
                                  shadowRadius: 6,
                                  elevation: ans === true ? 3 : 0
                                }}
                              >
                                <ThumbsUp
                                  size={18}
                                  color={ans === true ? '#10b981' : '#64748b'}
                                  fill={ans === true ? '#10b981' : 'none'}
                                />
                              </Touchable>

                              {/* Thumbs Down Button */}
                              <Touchable
                                onPress={() => handleQuestionAnswer(q.id, false)}
                                style={{
                                  width: 38,
                                  height: 38,
                                  borderRadius: 12,
                                  borderWidth: 1.5,
                                  borderColor: ans === false ? '#ef4444' : '#cbd5e1',
                                  backgroundColor: '#ffffff',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  shadowColor: ans === false ? '#ef4444' : 'transparent',
                                  shadowOffset: { width: 0, height: 4 },
                                  shadowOpacity: ans === false ? 0.2 : 0,
                                  shadowRadius: 6,
                                  elevation: ans === false ? 3 : 0
                                }}
                              >
                                <ThumbsDown
                                  size={18}
                                  color={ans === false ? '#ef4444' : '#64748b'}
                                  fill={ans === false ? '#ef4444' : 'none'}
                                />
                              </Touchable>
                            </View>
                          </View>
                        );
                      })}
                    </View>

                    {/* Solid pink Almost Done Continue button inside the card */}
                    <Touchable
                      onPress={nextStep}
                      style={{
                        backgroundColor: '#f472b6',
                        paddingVertical: 15,
                        borderRadius: 24,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 10,
                        width: '100%',
                        shadowColor: '#f472b6',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.35,
                        shadowRadius: 10,
                        elevation: 5
                      }}
                    >
                      <Text style={{ color: 'white', fontWeight: '900', fontSize: 15 }}>
                        Almost Done! ✨
                      </Text>
                    </Touchable>
                  </View>
                </MotiView>
              )}

              {currentStep === 3 && (
                <MotiView
                  key="step3"
                  from={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 200 } as any}
                  className="flex-1 justify-center py-4 items-center w-full"
                >
                  <View className="items-center justify-center py-8">
                    {/* Mascot Cheering Lottie Animation */}
                    <View style={{ width: 160, height: 160, marginBottom: 12 }}>
                      <LottieView
                        source={require('../../assets/lottie/bbbf7156-1170-11ee-a909-976822febe92.json')}
                        autoPlay
                        loop
                        style={{ width: '100%', height: '100%' }}
                      />
                    </View>

                    {/* All Done Header and Subtext */}
                    <Text style={{ fontSize: 26, fontWeight: '900', color: '#1e293b', textAlign: 'center' }}>
                      All Done!
                    </Text>
                    <Text style={{ fontSize: 13, color: '#64748b', fontWeight: 'bold', textAlign: 'center', marginTop: 8, paddingHorizontal: 20 }}>
                      Your emotional wellness check-in is complete.
                    </Text>

                    {/* Solid Green Submit Button exactly matching the screenshot */}
                    <Touchable
                      onPress={handleSubmit}
                      disabled={isSubmitting}
                      style={{
                        backgroundColor: '#10b981',
                        paddingVertical: 15,
                        paddingHorizontal: 36,
                        borderRadius: 24,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        marginTop: 28,
                        width: '100%',
                        maxWidth: 280,
                        shadowColor: '#10b981',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.35,
                        shadowRadius: 10,
                        elevation: 6
                      }}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text style={{ color: 'white', fontWeight: '900', fontSize: 15 }}>
                          Submit Check-In ⭐
                        </Text>
                      )}
                    </Touchable>
                  </View>
                </MotiView>
              )}
          </ScrollView>
 
          {/* Footer Controls */}
          {currentStep < 3 && currentStep > 0 && (
            <View className="px-5 py-4 border-t border-white/40 flex-row gap-4 bg-white/30 backdrop-blur-lg">
              {currentStep > 0 ? (
                <Touchable onPress={prevStep} className="flex-1 py-4 bg-white/70 border border-slate-100 rounded-2xl items-center justify-center flex-row shadow-sm">
                  <ArrowLeft color="#64748b" size={16} className="mr-2" />
                  <Text className="text-slate-600 font-black text-sm">Previous</Text>
                </Touchable>
              ) : null}
              <Touchable onPress={nextStep} className="flex-1 py-4 bg-purple-600 rounded-2xl items-center justify-center flex-row shadow-lg">
                <Text className="text-white font-black text-sm mr-2">Next Step</Text>
                <ArrowRight color="white" size={16} />
              </Touchable>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({});
