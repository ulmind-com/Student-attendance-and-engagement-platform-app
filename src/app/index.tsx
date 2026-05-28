import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Alert, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GraduationCap, ArrowRight, CheckCircle2, User, Lock, X } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MotiView, MotiText } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Ellipse, Line, Circle, Path, Rect, Text as SvgText } from 'react-native-svg';
import LottieView from 'lottie-react-native';

// Custom Touchable using Pressable to avoid NativeWind v4 link-injection bug
const Touchable = ({ children, style, onPress, className, disabled, onLongPress, delayLongPress, ...props }: any) => {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={delayLongPress}
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


const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://student-attendance-and-engagement.onrender.com/api';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Dynamic import of expo-video with robust error handling for local simulator fallback
let ExpoVideo: any = null;
try {
  ExpoVideo = require('expo-video');
} catch (e) {
  console.log("expo-video not loaded");
}

// Local WebM Mascot Video assets
const VIDEO_HELLO = require('../../assets/c5308b7293ca45b582e1d5c19227c70c.webm');
const VIDEO_LEARN = require('../../assets/ccb74e9e46ff4dba88e5e8174f14f5f1.webm');

function VideoMascot() {
  return (
    <LottieView
      source={require('../../assets/lottie/bbbf7156-1170-11ee-a909-976822febe92.json')}
      autoPlay
      loop
      style={{ width: '100%', height: '100%' }}
    />
  );
}

function SandyLoadingVideo() {
  return (
    <LottieView
      source={require('../../assets/lottie/Sandy Loading.json')}
      autoPlay
      loop
      style={{ width: 280, height: 280 }}
    />
  );
}

const floatingItems = [
  { emoji: "⭐", x: "8%", y: "15%", delay: 0, size: 24 },
  { emoji: "🌈", x: "85%", y: "10%", delay: 400, size: 20 },
  { emoji: "🎨", x: "5%", y: "75%", delay: 800, size: 24 },
  { emoji: "🦋", x: "88%", y: "65%", delay: 200, size: 20 },
  { emoji: "🌸", x: "15%", y: "45%", delay: 1000, size: 18 },
  { emoji: "🎵", x: "82%", y: "35%", delay: 600, size: 20 },
  { emoji: "💫", x: "50%", y: "5%", delay: 300, size: 18 },
  { emoji: "🎪", x: "70%", y: "85%", delay: 900, size: 20 },
  { emoji: "🌟", x: "25%", y: "85%", delay: 500, size: 18 },
];

function LoginClockMascot() {
  const [time, setTime] = useState(new Date());
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    const b = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 200); }, 3500);
    return () => { clearInterval(t); clearInterval(b); };
  }, []);

  const CX = 100, CY = 100, R = 75;
  const getUSATime = (d: Date) => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
      }).formatToParts(d);
      const hrVal = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
      const minVal = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
      const secVal = parseInt(parts.find(p => p.type === 'second')?.value || '0', 10);
      return { hr: hrVal, min: minVal, sec: secVal };
    } catch (e) {
      return { hr: d.getHours(), min: d.getMinutes(), sec: d.getSeconds() };
    }
  };
  const { hr: usaHr, min: usaMin, sec: usaSec } = getUSATime(time);
  const sec = usaSec, min = usaMin + sec / 60, hr = (usaHr % 12) + min / 60;
  const hand = (a: number, l: number) => { const r = ((a - 90) * Math.PI) / 180; return { x: CX + l * Math.cos(r), y: CY + l * Math.sin(r) }; };
  const sH = hand((sec / 60) * 360, 60), mH = hand((min / 60) * 360, 50), hH = hand((hr / 12) * 360, 35);

  return (
    <MotiView
      from={{ translateY: 0 }}
      animate={{ translateY: -5 }}
      transition={{ loop: true, type: 'timing', duration: 2500, direction: 'alternate' as any }}
      className="items-center justify-center my-2"
    >
      <View style={{ width: 220, height: 250 }}>
        <Svg viewBox="0 0 200 230" width="100%" height="100%">
          <Defs>
            <RadialGradient id="lcf" cx="50%" cy="45%" rx="55%" ry="55%">
              <Stop offset="0%" stopColor="#fff" />
              <Stop offset="100%" stopColor="#e9e5ff" />
            </RadialGradient>
          </Defs>
          <Ellipse cx={CX} cy={CY + R + 30} rx={50} ry={8} fill="rgba(139,92,246,0.1)" />
          <Line x1={CX - 18} y1={CY + R + 6} x2={CX - 28} y2={CY + R + 30} stroke="#c4b5fd" strokeWidth="7" strokeLinecap="round" />
          <Line x1={CX + 18} y1={CY + R + 6} x2={CX + 28} y2={CY + R + 30} stroke="#c4b5fd" strokeWidth="7" strokeLinecap="round" />
          <Ellipse cx={CX - 30} cy={CY + R + 33} rx={10} ry={5} fill="#a78bfa" />
          <Ellipse cx={CX + 30} cy={CY + R + 33} rx={10} ry={5} fill="#a78bfa" />
          <Line x1={CX - R - 3} y1={CY + 6} x2={CX - R - 22} y2={CY - 18} stroke="#c4b5fd" strokeWidth="6" strokeLinecap="round" />
          <Line x1={CX + R + 3} y1={CY + 6} x2={CX + R + 22} y2={CY - 18} stroke="#c4b5fd" strokeWidth="6" strokeLinecap="round" />
          <Circle cx={CX - R - 24} cy={CY - 21} r={7} fill="#ddd6fe" />
          <Circle cx={CX + R + 24} cy={CY - 21} r={7} fill="#ddd6fe" />
          <Circle cx={CX} cy={CY} r={R} fill="url(#lcf)" />
          <Circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(167,139,250,0.35)" strokeWidth="2" />
          {Array.from({ length: 12 }).map((_, i) => { const a = (i / 12) * 2 * Math.PI - Math.PI / 2; return (
            <Line key={i} x1={CX + (R - 12) * Math.cos(a)} y1={CY + (R - 12) * Math.sin(a)} x2={CX + (R - 5) * Math.cos(a)} y2={CY + (R - 5) * Math.sin(a)} stroke="rgba(139,92,246,0.35)" strokeWidth="2" strokeLinecap="round" />
          ); })}
          {[{ n: "12", x: CX, y: CY - R + 20 }, { n: "3", x: CX + R - 18, y: CY + 4 }, { n: "6", x: CX, y: CY + R - 14 }, { n: "9", x: CX - R + 18, y: CY + 4 }].map(({ n, x, y }) => (
            <SvgText key={n} x={x} y={y} dy="4" textAnchor="middle" fontSize="10" fontWeight="800" fill="#8b5cf6" fontFamily="System">{n}</SvgText>
          ))}
          <Line x1={CX} y1={CY} x2={hH.x} y2={hH.y} stroke="#4c1d95" strokeWidth="5" strokeLinecap="round" />
          <Line x1={CX} y1={CY} x2={mH.x} y2={mH.y} stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round" />
          <Line x1={CX} y1={CY} x2={sH.x} y2={sH.y} stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" />
          <Circle cx={CX} cy={CY} r={5} fill="#7c3aed" /><Circle cx={CX} cy={CY} r={2.5} fill="white" />
          {blink ? (<>
            <Line x1={CX - 22} y1={CY - 16} x2={CX - 10} y2={CY - 16} stroke="#334155" strokeWidth="3" strokeLinecap="round" />
            <Line x1={CX + 10} y1={CY - 16} x2={CX + 22} y2={CY - 16} stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          </>) : (<>
            <Ellipse cx={CX - 16} cy={CY - 16} rx={5} ry={6} fill="#334155" />
            <Ellipse cx={CX + 16} cy={CY - 16} rx={5} ry={6} fill="#334155" />
            <Ellipse cx={CX - 14} cy={CY - 18} rx={2} ry={2} fill="white" />
            <Ellipse cx={CX + 14} cy={CY - 18} rx={2} ry={2} fill="white" />
          </>)}
          <Path d={`M ${CX - 15} ${CY + 10} Q ${CX} ${CY + 28} ${CX + 15} ${CY + 10}`} fill="#a78bfa" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
          <Ellipse cx={CX - 30} cy={CY + 3} rx={7} ry={5} fill="rgba(244,114,182,0.25)" />
          <Ellipse cx={CX + 30} cy={CY + 3} rx={7} ry={5} fill="rgba(244,114,182,0.25)" />
          <Rect x={CX - 20} y={CY - R - 24} width={40} height={20} rx={4} fill="#4c1d95" />
          <Rect x={CX - 30} y={CY - R - 4} width={60} height={8} rx={4} fill="#6d28d9" />
          <Rect x={CX - 20} y={CY - R - 10} width={40} height={6} fill="#f59e0b" rx={2} />
        </Svg>
      </View>
    </MotiView>
  );
}

const BUBBLE_TEXT = ["Hello! 👋", "Let's learn today ✨"];
const BUBBLE_COLORS = ["#7c3aed", "#db2777"];
const BUBBLE_BORDERS = ["#ede9fe", "#fce7f3"];

const BoyMascot = () => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [bubbleVisible, setBubbleVisible] = useState(true);

  useEffect(() => {
    // Cycle message every 4 seconds: fade out → switch → fade in
    const interval = setInterval(() => {
      setBubbleVisible(false);
      setTimeout(() => {
        setMsgIndex((prev) => (prev === 0 ? 1 : 0));
        setBubbleVisible(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  return (
    <MotiView
      style={{ position: 'absolute', top: -165, right: 0, zIndex: 30 }}
      from={{ opacity: 0, translateX: 120 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'spring', delay: 300, stiffness: 80 } as any}
    >
      <View style={{ position: 'relative', width: 180, height: 190 }}>
        {/* Floating mascot video sequence */}
        <VideoMascot />

        {/* Chat Bubble — cycles between Hello and Let's learn today */}
        <MotiView
          key={`bubble-${msgIndex}`}
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: bubbleVisible ? 1 : 0, opacity: bubbleVisible ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 } as any}
          style={{
            position: 'absolute',
            left: msgIndex === 0 ? -55 : -105,
            top: 10,
            backgroundColor: 'rgba(255,255,255,0.97)',
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 16,
            borderBottomRightRadius: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 10,
            elevation: 8,
            borderWidth: 1.5,
            borderColor: BUBBLE_BORDERS[msgIndex],
          }}
        >
          <MotiView
            from={{ translateY: 0 }}
            animate={{ translateY: -4 }}
            transition={{ loop: true, type: 'timing', duration: 1800, direction: 'alternate' as any }}
          >
            <Text style={{ fontWeight: '900', fontSize: 13, color: BUBBLE_COLORS[msgIndex] }}>
              {BUBBLE_TEXT[msgIndex]}
            </Text>
          </MotiView>
        </MotiView>
      </View>
    </MotiView>
  );
};

const OTPMaskInput = ({ value, onChange, placeholder, className }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const [visibleIndex, setVisibleIndex] = useState(-1);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (newVal: string) => {
    onChange(newVal);
    if (newVal.length > value.length) {
      setVisibleIndex(newVal.length - 1);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setVisibleIndex(-1), 1000);
    } else {
      setVisibleIndex(-1);
    }
  };

  return (
    <View className="relative w-full">
      <View className={`w-full flex-row items-center pl-[3.25rem] pr-4 py-4 border-2 rounded-2xl shadow-sm ${isFocused ? 'border-purple-400 bg-white' : 'border-slate-100 bg-slate-50'} ${className}`}>
        {!value && <Text className="text-slate-400 font-bold">{placeholder}</Text>}
        {value ? (
          <Text className="tracking-[0.3em] font-bold text-lg text-slate-800">
            {value.split('').map((char: string, i: number) => i === visibleIndex ? char : '●').join('')}
          </Text>
        ) : null}
        {isFocused && (
          <MotiView 
            from={{ opacity: 0 }} animate={{ opacity: 1 }} 
            transition={{ loop: true, type: 'timing', duration: 600 }}
            className="w-0.5 h-5 bg-purple-500 ml-1 rounded-full"
          />
        )}
      </View>
      <TextInput
        value={value}
        onChangeText={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="absolute w-full h-full opacity-0"
        keyboardType="default"
        autoCapitalize="none"
      />
    </View>
  );
};

export default function LoginScreen() {
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [schoolName, setSchoolName] = useState("Student Attendance\n& Engagement Platform");
  const [schoolLogo, setSchoolLogo] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherUsername, setTeacherUsername] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/settings/school`);
        if (res.ok) {
          const data = await res.json();
          if (data.name) setSchoolName(data.name);
          if (data.logo) setSchoolLogo(data.logo);
        }
      } catch {}
    })();
  }, []);

  const searchStudents = useCallback(async (query: string) => {
    if (query.trim().length < 1) { setSuggestions([]); return; }
    try {
      const res = await fetch(`${API_URL}/students/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      }
    } catch { setSuggestions([]); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { 
      if (studentName && studentName.trim() && !selectedStudent) searchStudents(studentName); 
    }, 300);
    return () => clearTimeout(timer);
  }, [studentName, searchStudents]);

  const selectStudent = (s: any) => {
    const formattedName = `${s.firstName || ""} ${s.lastInitial ? s.lastInitial.charAt(0) : ""}`.trim();
    setStudentName(formattedName || s.name || "");
    setRollNumber(s.rollNumber);
    setSelectedStudent(s);
    setShowSuggestions(false);
  };

  const handleStudentLogin = async () => {
    if (!rollNumber || !otp) {
      Alert.alert("Missing Fields", "Please enter your roll number and today's magic code.");
      return;
    }
    
    setIsLoginLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roll_number: rollNumber, otp }),
      });
      if (res.ok) {
        await AsyncStorage.setItem("studentRoll", rollNumber);
        // Play the premium transition mascot animation for 3.8 seconds
        setTimeout(() => {
          setIsLoginLoading(false);
          router.push("/wellness");
        }, 3800);
      } else {
        Alert.alert("Error", "❌ Invalid Magic Code! Ask your teacher for today's code.");
        setIsLoginLoading(false);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Network error. Please try again.");
      setIsLoginLoading(false);
    }
  };

  const handleTeacherLogin = async () => {
    if (!teacherUsername || !teacherPassword) return;
    
    setLoginError("");
    try {
      const res = await fetch(`${API_URL}/auth/teacher-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: teacherUsername, password: teacherPassword }),
      });
      if (res.ok) {
        const data = await res.json();
        await AsyncStorage.setItem("adminRole", data.role || "Teacher");
        await AsyncStorage.setItem("adminUsername", data.username || teacherUsername);
        setShowTeacherModal(false);
        router.push("/admin");
      } else {
        setLoginError("Invalid credentials. Please try again.");
      }
    } catch {
      setLoginError("Could not connect to server. Try again.");
    }
  };

  const renderTitleLetters = (word: string, isTop: boolean) => {
    return (
      <View className="flex-row justify-center items-center">
        {word.split("").map((ch, i) => {
          const isO = ch === "O";
          const isA = ch === "A";
          let content = ch;
          if (isTop) {
            if (isO) content = "🍩";
            if (isA) content = "🍕";
          } else {
            if (isA) content = i === 0 ? "⛺" : "🚀";
          }

          let initX = (i % 2 === 0 ? -30 : 30);
          let initY = (i % 2 === 0 ? -20 : 20);
          let initRot = -20 + i * 10;

          if (isTop && isO) { initX = 0; initY = -60; initRot = -180; }
          if (isTop && isA) { initX = 0; initY = 60; initRot = 180; }
          if (!isTop && isA) { initX = 0; initY = 50; initRot = 90; }

          return (
            <MotiView
              key={i}
              from={{ opacity: 0, scale: 0.1, translateX: initX, translateY: initY, rotate: initRot + 'deg' }}
              animate={{ opacity: 1, scale: 1, translateX: 0, translateY: 0, rotate: '0deg' }}
              transition={{ type: 'spring', delay: isTop ? i * 100 : 400 + i * 80 }}
              style={{ marginHorizontal: isTop ? 4 : 2 }}
            >
              <MotiView
                from={{ translateY: 0, rotate: '0deg' }}
                animate={{ translateY: -6, rotate: i % 2 === 0 ? '3deg' : '-3deg' }}
                transition={{ loop: true, type: 'timing', duration: 2500 + (i % 3) * 400, direction: 'alternate' as any }}
              >
                <Text
                  style={{
                    fontSize: isTop ? 42 : 28,
                    fontWeight: '900',
                    color: isTop 
                      ? (i % 3 === 0 ? "#8b5cf6" : i % 3 === 1 ? "#ec4899" : "#60a5fa")
                      : ((i + 5) % 3 === 0 ? "#8b5cf6" : (i + 5) % 3 === 1 ? "#ec4899" : "#60a5fa"),
                    textShadowColor: 'rgba(255,255,255,0.9)',
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 8,
                  }}
                >
                  {content}
                </Text>
              </MotiView>
            </MotiView>
          );
        })}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white relative">
      <LinearGradient colors={['#ede9fe', '#fdf2f8', '#e0f2fe']} style={{ position: 'absolute', width: '100%', height: '100%' }} />
      
      {floatingItems.map((item, i) => (
        <MotiView
          key={i}
          style={{ position: 'absolute', left: item.x as any, top: item.y as any, zIndex: 10 }}
          from={{ translateY: 0, rotate: '0deg' }}
          animate={{ translateY: -16, rotate: i % 2 === 0 ? '10deg' : '-10deg' }}
          transition={{ loop: true, type: 'timing', duration: 4000 + i * 500, delay: item.delay, direction: 'alternate' as any }}
        >
          <Text style={{ fontSize: item.size }}>{item.emoji}</Text>
        </MotiView>
      ))}
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} 
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          className="flex-1"
        >
          <ScrollView 
            contentContainerClassName="flex-grow pt-4 pb-12 px-5"
            keyboardShouldPersistTaps="handled"
          >
            {/* Top Navigation */}
            <MotiView 
              from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }}
              className="flex-row items-center mb-6 px-2"
            >
              <Touchable activeOpacity={0.9} onPress={() => setShowTeacherModal(true)} onLongPress={() => setShowTeacherModal(true)} delayLongPress={1000}>
                {schoolLogo ? (
                  <View className="w-10 h-10 rounded-xl bg-white shadow-sm border border-purple-100 overflow-hidden mr-3">
                    <Image source={{ uri: schoolLogo }} className="w-full h-full" resizeMode="contain" />
                  </View>
                ) : (
                  <View className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 items-center justify-center shadow-sm mr-3">
                    <Text className="text-white text-lg">✨</Text>
                  </View>
                )}
              </Touchable>
              <View className="flex-1">
                <Text className="font-black text-slate-800 text-sm leading-tight tracking-tight">
                  {schoolName.split('\n').join(' ')} 💫
                </Text>
              </View>
            </MotiView>

            {/* Title */}
            <View className="items-center mb-6 z-20">
              {renderTitleLetters("TODAY", true)}
              <View className="mt-2">
                {renderTitleLetters("ATTENDANCE", false)}
              </View>
            </View>

            {/* Mascot */}
            <MotiView from={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', delay: 400 }}>
              <LoginClockMascot />
            </MotiView>

            {/* Login Form Container */}
            <View className="w-full max-w-md mx-auto mt-6 relative z-30">
              <BoyMascot />
              
              <View className="bg-white/80 border border-white/60 rounded-[2rem] p-6 shadow-xl shadow-purple-200/50">
                <View className="space-y-4">
                  {/* Name Input */}
                  <View className="relative z-30">
                    <Text className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1 mb-2">Your Name</Text>
                    <View className="relative">
                      <View className="absolute left-3 top-3 z-10">
                        {selectedStudent?.profilePhoto ? (
                          <Image source={{ uri: selectedStudent.profilePhoto }} className="w-8 h-8 rounded-full border border-purple-200" />
                        ) : selectedStudent ? (
                          <CheckCircle2 color="#22c55e" size={24} style={{ marginTop: 4, marginLeft: 2 }} />
                        ) : (
                          <LottieView source={require('../../assets/lottie/Search icon.json')} autoPlay loop style={{ width: 32, height: 32 }} />
                        )}
                      </View>
                      <TextInput
                        value={studentName}
                        onChangeText={(val) => { setStudentName(val); setSelectedStudent(null); setRollNumber(''); }}
                        onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                        placeholder="Start typing your name..."
                        placeholderTextColor="#94a3b8"
                        className={`w-full ${selectedStudent?.profilePhoto ? 'pl-14' : 'pl-14'} pr-4 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl text-slate-800 font-bold text-sm`}
                      />
                    </View>
                    
                    {showSuggestions && suggestions.length > 0 && (
                      <View className="absolute top-[85px] left-0 right-0 bg-white border border-purple-100 rounded-2xl shadow-xl z-50 max-h-48 overflow-hidden">
                        <View className="px-4 py-2 border-b border-purple-50">
                          <Text className="text-[10px] font-black text-purple-500 uppercase tracking-wider">Matching Students</Text>
                        </View>
                        <ScrollView keyboardShouldPersistTaps="handled">
                          {suggestions.map((s, i) => (
                            <Touchable key={i} onPress={() => selectStudent(s)} className="flex-row items-center p-3 border-b border-purple-50/50 hover:bg-purple-50">
                              <View className="w-10 h-10 rounded-xl bg-purple-100 items-center justify-center mr-3 overflow-hidden">
                                {s.profilePhoto ? (
                                  <Image source={{ uri: s.profilePhoto }} className="w-full h-full" />
                                ) : (
                                  <Text className="font-black text-purple-600">{s.firstName?.charAt(0) || s.name?.charAt(0) || "?"}</Text>
                                )}
                              </View>
                              <View className="flex-1">
                                <Text className="font-bold text-slate-800 text-sm">
                                  {`${s.firstName || ""} ${s.lastInitial ? s.lastInitial.charAt(0) : ""}`.trim() || s.name}
                                </Text>
                                <Text className="text-[11px] font-semibold text-slate-400">Roll: {s.rollNumber} • {s.className || s.class_name}</Text>
                              </View>
                            </Touchable>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  {/* Roll Number Input */}
                  <View className="relative z-20">
                    <Text className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1 mb-2">Roll Number</Text>
                    <View className="relative">
                      <View className="absolute left-4 top-3.5 z-10">
                        <LottieView source={require('../../assets/lottie/Profile.json')} autoPlay loop style={{ width: 26, height: 26, opacity: 0.7 }} />
                      </View>
                      <TextInput
                        value={rollNumber}
                        onChangeText={setRollNumber}
                        placeholder="Enter your roll number"
                        placeholderTextColor="#94a3b8"
                        editable={!selectedStudent}
                        className={`w-full pl-[3.25rem] pr-4 py-4 border-2 rounded-2xl text-slate-800 font-bold text-sm ${
                          selectedStudent ? "bg-green-50/50 border-green-200" : "bg-slate-50/50 border-slate-100"
                        }`}
                      />
                    </View>
                  </View>

                  {/* Magic Code Input */}
                  <View className="relative z-10">
                    <Text className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1 mb-2">Daily Magic Code</Text>
                    <View className="relative">
                      <View className="absolute left-3 top-3 z-10">
                        <Image source={require('../../assets/lottie/key.gif')} style={{ width: 32, height: 32, opacity: 0.8 }} />
                      </View>
                      <OTPMaskInput
                        value={otp}
                        onChange={setOtp}
                        placeholder="Ask your teacher for today's code"
                      />
                    </View>
                    <Text className="text-[10px] text-slate-400 font-semibold mt-2 ml-1">💡 Your teacher gives you this every morning</Text>
                  </View>

                  <Touchable onPress={handleStudentLogin} disabled={isLoginLoading} activeOpacity={0.8} className="mt-2">
                    <LinearGradient
                      colors={['#a855f7', '#db2777']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      className="w-full py-4 rounded-2xl flex-row items-center justify-center shadow-lg"
                    >
                      {isLoginLoading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <>
                          <Text className="text-white font-black text-base mr-2">Let's Go! 🚀</Text>
                          <ArrowRight color="white" size={18} />
                        </>
                      )}
                    </LinearGradient>
                  </Touchable>
                  
                </View>
              </View>
            </View>

            {/* Dedicated Teacher Login Button */}
            <Touchable 
              onPress={() => setShowTeacherModal(true)} 
              className="mt-6 flex-row items-center justify-center gap-2 py-3"
            >
              <Lock size={14} color="#94a3b8" />
              <Text className="text-slate-500 font-bold text-sm">Teacher / Admin Login</Text>
            </Touchable>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Teacher Login Modal */}
      <Modal visible={showTeacherModal} transparent animationType="fade">
        <View className="flex-1 bg-slate-900/60 justify-center items-center px-4">
          <MotiView from={{ scale: 0.9, opacity: 0, translateY: 30 }} animate={{ scale: 1, opacity: 1, translateY: 0 }} className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl">
            <LinearGradient colors={['#1e293b', '#334155']} className="p-6 flex-row justify-between items-center">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center">
                  <GraduationCap color="white" size={20} />
                </View>
                <View>
                  <Text className="font-black text-lg text-white">Teacher Login</Text>
                  <Text className="text-[11px] font-medium text-white/70">Admin Dashboard Access</Text>
                </View>
              </View>
              <Touchable onPress={() => { setShowTeacherModal(false); setLoginError(""); }} className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
                <X color="white" size={20} />
              </Touchable>
            </LinearGradient>

            <View className="p-6">
              <View className="mb-4">
                <Text className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 block">Username</Text>
                <View className="relative justify-center">
                  <View className="absolute left-3 z-10"><User color="#94a3b8" size={16} /></View>
                  <TextInput
                    value={teacherUsername}
                    onChangeText={setTeacherUsername}
                    placeholder="Enter username"
                    autoCapitalize="none"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-800 font-bold text-sm"
                  />
                </View>
              </View>
              <View className="mb-6">
                <Text className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 block">Password</Text>
                <View className="relative justify-center">
                  <View className="absolute left-3 z-10"><Lock color="#94a3b8" size={16} /></View>
                  <TextInput
                    value={teacherPassword}
                    onChangeText={setTeacherPassword}
                    placeholder="Enter password"
                    secureTextEntry
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-800 font-bold text-sm"
                  />
                </View>
              </View>
              
              {loginError ? (
                <View className="bg-red-50 p-3 rounded-xl mb-4 border border-red-100 flex-row items-center">
                  <Text className="text-red-600 text-[11px] font-bold">⚠️ {loginError}</Text>
                </View>
              ) : null}

              <Touchable activeOpacity={0.8} onPress={handleTeacherLogin}>
                <LinearGradient colors={['#1e293b', '#334155']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="w-full py-3.5 rounded-xl flex-row items-center justify-center shadow-lg">
                  <Lock color="white" size={14} className="mr-2" />
                  <Text className="text-white font-black text-sm">Access Admin Dashboard</Text>
                </LinearGradient>
              </Touchable>
            </View>
          </MotiView>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {isLoginLoading && (
        <View className="absolute inset-0 z-50 items-center justify-center bg-white/95">
          <View className="items-center justify-center px-6">
            <SandyLoadingVideo />
            <MotiView
              from={{ opacity: 0.5, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1.02 }}
              transition={{ loop: true, type: 'timing', duration: 1500, direction: 'alternate' as any }}
              style={{ marginTop: 24 }}
            >
              <Text className="text-xl sm:text-2xl font-black text-center text-purple-600">
                Getting things ready... ✨
              </Text>
            </MotiView>
          </View>
        </View>
      )}
    </View>
  );
}
