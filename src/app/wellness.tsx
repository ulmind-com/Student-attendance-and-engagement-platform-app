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
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, RadialGradient, Stop } from 'react-native-svg';
import { ArrowLeft, ArrowRight, Heart, Sparkles, Smile, MessageCircle, ClipboardList, CheckCircle } from 'lucide-react-native';

// Custom Touchable using Pressable to avoid NativeWind v4 link-injection bug
const Touchable = ({ children, style, onPress, className, disabled, ...props }: any) => {
  return (
    <Pressable
      onPress={onPress}
      className={className}
      disabled={disabled}
      style={({ pressed }) => [
        style,
        pressed && { opacity: 0.6 },
        disabled && { opacity: 0.3 }
      ]}
      {...props}
    >
      {children}
    </Pressable>
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
  { id: 'Happy', label: 'Happy 💚', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
  { id: 'Sad', label: 'Sad 💙', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  { id: 'Mad', label: 'Mad ❤️', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
  { id: 'Scared', label: 'Scared 🖤', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' },
  { id: 'Worried', label: 'Worried 💛', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  { id: 'Excited', label: 'Excited 💗', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
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

  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
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

      // 3. Fetch Questions
      const questionsRes = await fetch(`${API_URL}/questions/list`);
      if (questionsRes.ok) {
        const allQuestions = await questionsRes.json();
        // Filter by roll, class, or global
        const filtered = allQuestions.filter((q: any) => {
          if (!q.enabled) return false;
          if (q.targetType === 'student' && q.targetValue === roll) return true;
          if (q.targetType === 'class' && q.targetValue === studentClass) return true;
          if (q.targetType === 'global') return true;
          return false;
        });

        // If no dynamic questions configured, fall back to robust default list
        if (filtered.length === 0) {
          setQuestions([
            { id: 'q1', text: 'Did you have a good sleep last night? 💤', enabled: true },
            { id: 'q2', text: 'Did you eat a healthy breakfast today? 🍎', enabled: true },
            { id: 'q3', text: 'Do you feel ready and excited to learn today? 📚', enabled: true },
          ]);
        } else {
          setQuestions(filtered);
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
    setSelectedEmotions((prev) =>
      prev.includes(emotionId)
        ? prev.filter((id) => id !== emotionId)
        : [...prev, emotionId]
    );
  };

  const handleQuestionAnswer = (qId: string, answer: boolean) => {
    setQuestionAnswers((prev) => ({ ...prev, [qId]: answer }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const selectedMoodObj = MOOD_LEVELS.find((m) => m.score === moodScore) || MOOD_LEVELS[5];

    const payload = {
      roll_number: studentRoll,
      mood_score: moodScore,
      emotions: selectedEmotions,
      question_answers: questionAnswers,
      journal_text: journalText,
      emoji: selectedMoodObj.emoji,
    };

    try {
      const res = await fetch(`${API_URL}/attendance/checkin`, {
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
    if (currentStep < 4) {
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
    { label: 'Journal', icon: MessageCircle },
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

          {/* Progress Indicator */}
          <View className="flex-row justify-between items-center px-8 py-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isActive = i <= currentStep;
              const isCurrent = i === currentStep;
              return (
                <React.Fragment key={i}>
                  <MotiView
                    animate={{
                      scale: isCurrent ? 1.15 : 1,
                      backgroundColor: isCurrent ? '#8b5cf6' : isActive ? '#c084fc' : '#cbd5e1',
                    }}
                    transition={{ type: 'spring', stiffness: 300 } as any}
                    className="w-9 h-9 rounded-full items-center justify-center shadow-sm"
                  >
                    <Icon color="white" size={16} />
                  </MotiView>
                  {i < steps.length - 1 && (
                    <View className={`flex-1 h-1 mx-1 rounded-full ${i < currentStep ? 'bg-purple-300' : 'bg-slate-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </View>

          {/* Step Contents */}
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }} className="flex-1 px-5">
              {currentStep === 0 && (
                <MotiView
                  key="step0"
                  from={{ opacity: 0, translateX: 50 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  exit={{ opacity: 0, translateX: -50 }}
                  transition={{ type: 'spring', stiffness: 200 } as any}
                  className="flex-1 justify-center py-4"
                >
                  <View className="items-center mb-6">
                    <Text className="text-2xl font-black text-slate-800 text-center">How are you feeling today?</Text>
                    <Text className="text-slate-500 font-bold text-sm mt-1 text-center">Slide the wheel or tap a number to choose 1-10</Text>
                  </View>

                  {/* Interactive Clock Dial */}
                  <View className="items-center justify-center my-6 relative">
                    <MotiView
                      animate={{ scale: [0.95, 1.05, 0.95] }}
                      transition={{ loop: true, type: 'timing', duration: 4000 } as any}
                      style={{
                        position: 'absolute',
                        width: 250,
                        height: 250,
                        borderRadius: 125,
                        backgroundColor: selectedMood.color,
                        opacity: 0.08,
                      }}
                    />

                    <View style={{ width: 240, height: 240, position: 'relative' }} className="bg-white/90 border border-white rounded-full shadow-2xl items-center justify-center p-2">
                      <Svg viewBox="0 0 200 200" width="100%" height="100%">
                        <Defs>
                          <RadialGradient id="clockBg" cx="50%" cy="50%" rx="50%" ry="50%">
                            <Stop offset="0%" stopColor="#ffffff" />
                            <Stop offset="100%" stopColor="#f3f0ff" />
                          </RadialGradient>
                        </Defs>
                        <Circle cx="100" cy="100" r="90" fill="url(#clockBg)" stroke={selectedMood.color} strokeWidth="3" />

                        {/* Hand pointing to selected number */}
                        {(() => {
                          const angle = ((moodScore - 1) / 10) * 2 * Math.PI - Math.PI / 2;
                          const handLength = 65;
                          const hX = 100 + handLength * Math.cos(angle);
                          const hY = 100 + handLength * Math.sin(angle);
                          return (
                            <>
                              <Line x1="100" y1="100" x2={hX} y2={hY} stroke={selectedMood.color} strokeWidth="5" strokeLinecap="round" />
                              <Circle cx={hX} cy={hY} r="7" fill={selectedMood.color} />
                            </>
                          );
                        })()}

                        {/* Center hub */}
                        <Circle cx="100" cy="100" r="8" fill="#1e293b" />
                        <Circle cx="100" cy="100" r="4" fill="white" />

                        {/* Dial Numbers 1-10 */}
                        {Array.from({ length: 10 }).map((_, i) => {
                          const val = i + 1;
                          const angle = (i / 10) * 2 * Math.PI - Math.PI / 2;
                          const r = 74;
                          const nX = 100 + r * Math.cos(angle);
                          const nY = 100 + r * Math.sin(angle);
                          const isSelected = val === moodScore;

                          return (
                            <SvgText
                              key={val}
                              x={nX}
                              y={nY}
                              dy="5"
                              textAnchor="middle"
                              fontSize={isSelected ? '14' : '10'}
                              fontWeight="900"
                              fill={isSelected ? selectedMood.color : '#64748b'}
                            >
                              {val}
                            </SvgText>
                          );
                        })}
                      </Svg>

                      {/* Overlaid Central Mood Display */}
                      <View className="absolute items-center justify-center pointer-events-none">
                        <MotiView
                          key={selectedMood.emoji}
                          from={{ scale: 0.5, rotate: '-20deg' }}
                          animate={{ scale: 1.25, rotate: '0deg' }}
                          transition={{ type: 'spring', damping: 10 } as any}
                        >
                          <Text style={{ fontSize: 44 }}>{selectedMood.emoji}</Text>
                        </MotiView>
                      </View>

                      {/* Transparent Gesture overlay for drag/tap dial interaction */}
                      <View
                        style={{
                          position: 'absolute',
                          width: 240,
                          height: 240,
                          borderRadius: 120,
                          backgroundColor: 'transparent',
                        }}
                        onStartShouldSetResponder={() => true}
                        onMoveShouldSetResponder={() => true}
                        onResponderGrant={handleDialTouch}
                        onResponderMove={handleDialTouch}
                      />
                    </View>
                  </View>

                  {/* Mood Info Card */}
                  <View className="bg-white/80 border border-white/60 p-5 rounded-3xl shadow-lg mt-4 items-center max-w-sm mx-auto">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text className="text-xl font-black text-slate-800">{moodScore}</Text>
                      <Text className="text-slate-400 font-bold">/ 10</Text>
                      <Text style={{ color: selectedMood.color, fontWeight: '900', fontSize: 16 }} className="ml-2">
                        {selectedMood.label}
                      </Text>
                    </View>
                    <Text className="text-slate-500 font-semibold text-xs text-center">{selectedMood.desc}</Text>
                  </View>

                  {/* Tappable Slider Buttons */}
                  <View className="flex-row flex-wrap justify-center gap-2.5 mt-8 px-2">
                    {MOOD_LEVELS.map((item) => (
                      <Touchable
                        key={item.score}
                        onPress={() => setMoodScore(item.score)}
                        style={[
                          {
                            width: 44,
                            height: 44,
                            borderRadius: 16,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 2,
                          },
                          moodScore === item.score
                            ? { backgroundColor: '#9333ea', borderColor: '#9333ea' }
                            : { backgroundColor: 'rgba(255,255,255,0.8)', borderColor: '#f1f5f9' }
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '900',
                            color: moodScore === item.score ? '#ffffff' : '#334155'
                          }}
                        >
                          {item.score}
                        </Text>
                      </Touchable>
                    ))}
                  </View>
                </MotiView>
              )}

              {currentStep === 1 && (
                <MotiView
                  key="step1"
                  from={{ opacity: 0, translateX: 50 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  exit={{ opacity: 0, translateX: -50 }}
                  className="flex-1 justify-center py-4"
                >
                  <View className="items-center mb-6">
                    <Text className="text-2xl font-black text-slate-800 text-center">Color your emotions!</Text>
                    <Text className="text-slate-500 font-bold text-sm mt-1 text-center">Select all the feeling puzzle pieces that fit today</Text>
                  </View>

                  {/* Puzzle Lightbulb Component */}
                  <View className="items-center justify-center my-6">
                    <View style={{ width: 200, height: 260 }} className="relative items-center justify-center">
                      <Svg viewBox="0 0 160 220" width="100%" height="100%">
                        <Defs>
                          <RadialGradient id="bulbBaseGrad" cx="50%" cy="50%" rx="50%" ry="50%">
                            <Stop offset="0%" stopColor="#ffffff" />
                            <Stop offset="100%" stopColor="#e2e8f0" />
                          </RadialGradient>
                        </Defs>

                        {/* Top-Left piece (Excited) */}
                        <Path
                          d="M 80,10 C 50,10 25,30 20,60 C 20,70 25,80 35,90 L 70,80 L 80,45 Z"
                          fill={selectedEmotions.includes('Excited') ? '#ec4899' : 'rgba(203, 213, 225, 0.4)'}
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          onPress={() => handleEmotionToggle('Excited')}
                        />

                        {/* Top-Right piece (Happy) */}
                        <Path
                          d="M 80,10 C 110,10 135,30 140,60 C 140,70 135,80 125,90 L 90,80 L 80,45 Z"
                          fill={selectedEmotions.includes('Happy') ? '#22c55e' : 'rgba(203, 213, 225, 0.4)'}
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          onPress={() => handleEmotionToggle('Happy')}
                        />

                        {/* Middle-Left piece (Worried) */}
                        <Path
                          d="M 35,90 L 70,80 L 80,120 L 45,135 C 38,125 32,105 35,90 Z"
                          fill={selectedEmotions.includes('Worried') ? '#f59e0b' : 'rgba(203, 213, 225, 0.4)'}
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          onPress={() => handleEmotionToggle('Worried')}
                        />

                        {/* Middle-Right piece (Scared) */}
                        <Path
                          d="M 125,90 L 90,80 L 80,120 L 115,135 C 122,125 128,105 125,90 Z"
                          fill={selectedEmotions.includes('Scared') ? '#64748b' : 'rgba(203, 213, 225, 0.4)'}
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          onPress={() => handleEmotionToggle('Scared')}
                        />

                        {/* Bottom-Left piece (Sad) */}
                        <Path
                          d="M 45,135 L 80,120 L 80,165 C 65,165 52,150 45,135 Z"
                          fill={selectedEmotions.includes('Sad') ? '#3b82f6' : 'rgba(203, 213, 225, 0.4)'}
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          onPress={() => handleEmotionToggle('Sad')}
                        />

                        {/* Bottom-Right piece (Mad) */}
                        <Path
                          d="M 115,135 L 80,120 L 80,165 C 95,165 108,150 115,135 Z"
                          fill={selectedEmotions.includes('Mad') ? '#ef4444' : 'rgba(203, 213, 225, 0.4)'}
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          onPress={() => handleEmotionToggle('Mad')}
                        />

                        {/* Bulb Screw Base */}
                        <Path d="M 55,167 L 105,167 L 100,187 L 60,187 Z" fill="url(#bulbBaseGrad)" stroke="#cbd5e1" strokeWidth="2" />
                        <Path d="M 60,187 L 100,187 L 95,197 L 65,197 Z" fill="#94a3b8" />
                        <Circle cx="80" cy="202" r="5" fill="#475569" />
                      </Svg>

                      <View className="absolute pointer-events-none items-center justify-center">
                        <Sparkles size={24} color="#f59e0b" />
                      </View>
                    </View>
                  </View>

                  {/* Emotion Toggles Grid */}
                  <View className="flex-row flex-wrap justify-center gap-3 mt-6">
                    {EMOTIONS.map((emotion) => {
                      const isSelected = selectedEmotions.includes(emotion.id);
                      return (
                        <Touchable
                          key={emotion.id}
                          onPress={() => handleEmotionToggle(emotion.id)}
                          style={{
                            backgroundColor: isSelected ? emotion.color : 'rgba(255,255,255,0.7)',
                            borderColor: isSelected ? emotion.color : '#e2e8f0',
                            borderWidth: 2,
                            paddingHorizontal: 18,
                            paddingVertical: 12,
                            borderRadius: 20,
                            shadowColor: isSelected ? emotion.color : '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: isSelected ? 0.2 : 0,
                            shadowRadius: 6,
                            elevation: isSelected ? 4 : 0,
                          }}
                        >
                          <Text className={`font-black text-sm ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                            {emotion.label}
                          </Text>
                        </Touchable>
                      );
                    })}
                  </View>
                </MotiView>
              )}

              {currentStep === 2 && (
                <MotiView
                  key="step2"
                  from={{ opacity: 0, translateX: 50 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  exit={{ opacity: 0, translateX: -50 }}
                  className="flex-1 justify-center py-4"
                >
                  <View className="items-center mb-6">
                    <Text className="text-2xl font-black text-slate-800 text-center">Let's answer some quick questions!</Text>
                    <Text className="text-slate-500 font-bold text-sm mt-1 text-center">Tap Yes or No for each check-in item</Text>
                  </View>

                  {/* Dynamic Questions Bank */}
                  <View className="space-y-4 max-w-md mx-auto w-full">
                    {questions.map((q) => {
                      const ans = questionAnswers[q.id];
                      return (
                        <View key={q.id} className="bg-white/80 border border-white p-5 rounded-3xl shadow-sm my-2">
                          <Text className="font-bold text-sm text-slate-800 mb-4 leading-relaxed">{q.text}</Text>
                          <View className="flex-row gap-3">
                            <Touchable
                              onPress={() => handleQuestionAnswer(q.id, true)}
                              className={`flex-1 py-3 rounded-2xl items-center border-2 ${
                                ans === true
                                  ? 'bg-green-500 border-green-500 shadow-md shadow-green-100'
                                  : 'bg-slate-50/50 border-slate-100'
                              }`}
                            >
                              <Text className={`font-black text-sm ${ans === true ? 'text-white' : 'text-slate-600'}`}>Yes 👍</Text>
                            </Touchable>
                            <Touchable
                              onPress={() => handleQuestionAnswer(q.id, false)}
                              className={`flex-1 py-3 rounded-2xl items-center border-2 ${
                                ans === false
                                  ? 'bg-red-500 border-red-500 shadow-md shadow-red-100'
                                  : 'bg-slate-50/50 border-slate-100'
                              }`}
                            >
                              <Text className={`font-black text-sm ${ans === false ? 'text-white' : 'text-slate-600'}`}>No 👎</Text>
                            </Touchable>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </MotiView>
              )}

              {currentStep === 3 && (
                <MotiView
                  key="step3"
                  from={{ opacity: 0, translateX: 50 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  exit={{ opacity: 0, translateX: -50 }}
                  className="flex-1 justify-center py-4"
                >
                  <View className="items-center mb-6">
                    <Text className="text-2xl font-black text-slate-800 text-center">Draw or write your thoughts ✏️</Text>
                    <Text className="text-slate-500 font-bold text-sm mt-1 text-center">Is there anything you want to share with your teacher? (Optional)</Text>
                  </View>

                  <View className="bg-white/80 border border-white p-5 rounded-3xl shadow-xl max-w-md mx-auto w-full">
                    <TextInput
                      multiline
                      numberOfLines={6}
                      value={journalText}
                      onChangeText={setJournalText}
                      placeholder="Today, I am thinking about..."
                      placeholderTextColor="#94a3b8"
                      textAlignVertical="top"
                      className="w-full min-h-[150] bg-slate-50/50 border-2 border-slate-100 rounded-2xl p-4 text-slate-800 font-semibold text-sm leading-relaxed"
                    />
                    <Text className="text-[10px] text-slate-400 font-semibold mt-3 ml-1">
                      🔒 Only your teacher can read what you write here
                    </Text>
                  </View>
                </MotiView>
              )}

              {currentStep === 4 && (
                <MotiView
                  key="step4"
                  from={{ opacity: 0, translateX: 50 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  exit={{ opacity: 0, translateX: -50 }}
                  className="flex-1 justify-center py-4"
                >
                  <View className="items-center mb-6">
                    <Text className="text-2xl font-black text-slate-800 text-center">Review your choices! 🧐</Text>
                    <Text className="text-slate-500 font-bold text-sm mt-1 text-center">Are you ready to submit your attendance?</Text>
                  </View>

                  <View className="space-y-4 max-w-md mx-auto w-full">
                    {/* Stat Row */}
                    <View className="bg-white/80 border border-white p-5 rounded-3xl shadow-sm flex-row items-center justify-between">
                      <View>
                        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Selected Mood</Text>
                        <Text className="text-lg font-black text-slate-800 mt-0.5">{selectedMood.label}</Text>
                      </View>
                      <View className="w-12 h-12 rounded-2xl bg-purple-50 items-center justify-center">
                        <Text style={{ fontSize: 24 }}>{selectedMood.emoji}</Text>
                      </View>
                    </View>

                    {/* Emotions Row */}
                    <View className="bg-white/80 border border-white p-5 rounded-3xl shadow-sm">
                      <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Picked Emotions</Text>
                      <View className="flex-row flex-wrap gap-1.5">
                        {selectedEmotions.map((emId) => {
                          const emo = EMOTIONS.find((e) => e.id === emId);
                          return (
                            <View key={emId} style={{ backgroundColor: emo?.bg }} className="px-3 py-1.5 rounded-xl border border-slate-100">
                              <Text style={{ color: emo?.color || '#334155' }} className="font-bold text-xs">{emo?.label || emId}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>

                    {/* Questions Row */}
                    <View className="bg-white/80 border border-white p-5 rounded-3xl shadow-sm">
                      <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5">Check-in Responses</Text>
                      <View className="space-y-2">
                        {questions.map((q) => {
                          const ans = questionAnswers[q.id];
                          return (
                            <View key={q.id} className="flex-row justify-between items-center py-1">
                              <Text className="text-slate-600 font-bold text-xs flex-1 pr-3" numberOfLines={1}>
                                {q.text}
                              </Text>
                              <Text className={`font-black text-xs ${ans ? 'text-green-600' : ans === false ? 'text-red-500' : 'text-slate-400'}`}>
                                {ans ? 'Yes 👍' : ans === false ? 'No 👎' : 'Skipped'}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>

                    {/* Journal Summary */}
                    {journalText.trim() && (
                      <View className="bg-white/80 border border-white p-5 rounded-3xl shadow-sm">
                        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Journal Entry</Text>
                        <Text className="text-slate-600 font-semibold text-xs leading-relaxed" numberOfLines={2}>
                          {journalText}
                        </Text>
                      </View>
                    )}

                    {/* Big Submit Button */}
                    <Touchable onPress={handleSubmit} disabled={isSubmitting} activeOpacity={0.8} className="mt-4">
                      <LinearGradient
                        colors={['#8b5cf6', '#ec4899']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        className="w-full py-4 rounded-3xl flex-row items-center justify-center shadow-lg"
                      >
                        {isSubmitting ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <>
                            <Text className="text-white font-black text-base mr-2">Submit Check-In! 🏆</Text>
                            <ArrowRight color="white" size={18} />
                          </>
                        )}
                      </LinearGradient>
                    </Touchable>
                  </View>
                </MotiView>
              )}
          </ScrollView>

          {/* Footer Controls */}
          {currentStep < 4 && (
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
