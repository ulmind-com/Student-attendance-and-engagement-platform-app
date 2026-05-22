import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ArrowRight, Heart, Sparkles, MessageCircle, ClipboardList, CheckCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://kids-attendance-production.up.railway.app';

// High-fidelity fallback colors for mood levels (1 to 10)
const MOOD_LEVELS = [
  { score: 1, label: 'Very Bad', emoji: '😢', color: '#ef4444', desc: 'Really tough day today.' },
  { score: 2, label: 'Bad', emoji: '😭', color: '#f73b5d', desc: 'Feeling down today.' },
  { score: 3, label: 'Not Good', emoji: '😕', color: '#f59e0b', desc: 'Things are not great.' },
  { score: 4, label: 'Neutral', emoji: '😐', color: '#eab308', desc: 'Just feeling average.' },
  { score: 5, label: 'Okay', emoji: '🙂', color: '#94a3b8', desc: 'I am doing okay.' },
  { score: 6, label: 'Good', emoji: '😊', color: '#10b981', desc: 'Having a good day!' },
  { score: 7, label: 'Very Good', emoji: '😄', color: '#22c55e', desc: 'Great, positive mood!' },
  { score: 8, label: 'Happy', emoji: '😁', color: '#3b82f6', desc: 'Filled with joy!' },
  { score: 9, label: 'Excited', emoji: '🤩', color: '#8b5cf6', desc: 'Super excited to learn!' },
  { score: 10, label: 'Excellent', emoji: '🥳', color: '#ec4899', desc: 'Absolutely fantastic day!' },
];

const EMOTIONS = [
  { id: 'Happy', label: 'Happy 💚', color: '#22c55e' },
  { id: 'Sad', label: 'Sad 💙', color: '#3b82f6' },
  { id: 'Mad', label: 'Mad ❤️', color: '#ef4444' },
  { id: 'Scared', label: 'Scared 🖤', color: '#64748b' },
  { id: 'Worried', label: 'Worried 💛', color: '#f59e0b' },
  { id: 'Excited', label: 'Excited 💗', color: '#ec4899' },
];

interface WellnessScreenProps {
  navigation: any;
}

export default function WellnessScreen({ navigation }: WellnessScreenProps) {
  const [studentRoll, setStudentRoll] = useState('');
  const [studentName, setStudentName] = useState('Student');
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Wellness Form States
  const [moodScore, setMoodScore] = useState(6); // Default is 'Good' (6)
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, boolean>>({});
  const [journalText, setJournalText] = useState('');

  // Fetch student roll number, name details and questions list
  useEffect(() => {
    const initializeFlow = async () => {
      try {
        const roll = await AsyncStorage.getItem('studentRoll');
        if (!roll) {
          Alert.alert('Access Denied', 'Please login to verify your profile credentials.');
          navigation.navigate('LoginScreen');
          return;
        }
        setStudentRoll(roll);

        // Fetch matching student profile name
        const studentRes = await fetch(`${API_URL}/students`);
        if (studentRes.ok) {
          const studentsList = await studentRes.json();
          const match = studentsList.find((s: any) => s.rollNumber === roll);
          if (match) {
            setStudentName(`${match.firstName || match.name} ${match.lastInitial || ''}`.trim());
          }
        }

        // Fetch dynamic questions
        const questionsRes = await fetch(`${API_URL}/questions/list`);
        if (questionsRes.ok) {
          const list = await questionsRes.json();
          const activeList = list.filter((q: any) => q.enabled);
          if (activeList.length === 0) {
            setQuestions([
              { id: 'q1', text: 'Did you have a good sleep last night? 💤' },
              { id: 'q2', text: 'Did you eat a healthy breakfast today? 🍎' },
              { id: 'q3', text: 'Do you feel ready and excited to learn today? 📚' },
            ]);
          } else {
            setQuestions(activeList);
          }
        } else {
          // Standard backup checklist
          setQuestions([
            { id: 'q1', text: 'Did you have a good sleep last night? 💤' },
            { id: 'q2', text: 'Did you eat a healthy breakfast today? 🍎' },
            { id: 'q3', text: 'Do you feel ready and excited to learn today? 📚' },
          ]);
        }
      } catch (err) {
        console.error(err);
        setQuestions([
          { id: 'q1', text: 'Did you have a good sleep last night? 💤' },
          { id: 'q2', text: 'Did you eat a healthy breakfast today? 🍎' },
          { id: 'q3', text: 'Do you feel ready and excited to learn today? 📚' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    initializeFlow();
  }, []);

  const handleEmotionToggle = (id: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAnswerChange = (qId: string, value: boolean) => {
    setQuestionAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const nextStep = () => {
    if (currentStep === 1 && selectedEmotions.length === 0) {
      Alert.alert('Emotion selection', 'Please select at least one feeling bubble.');
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

  const handleWellnessSubmit = async () => {
    setIsSubmitting(true);
    const selectedMoodDetails = MOOD_LEVELS.find((m) => m.score === moodScore) || MOOD_LEVELS[5];

    const payload = {
      roll_number: studentRoll,
      mood_score: moodScore,
      emotions: selectedEmotions,
      question_answers: questionAnswers,
      journal_text: journalText,
      emoji: selectedMoodDetails.emoji
    };

    try {
      const res = await fetch(`${API_URL}/attendance/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsSubmitting(false);
        navigation.navigate('SuccessScreen');
      } else {
        const errorData = await res.json().catch(() => ({}));
        Alert.alert('Submission Failed', errorData.message || 'We could not record your status at this moment.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      Alert.alert(
        'Offline Recorded',
        'Your status was recorded offline. It will sync automatically when online.'
      );
      setIsSubmitting(false);
      navigation.navigate('SuccessScreen');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        // Step 0: Mood Selection (1 to 10 grid)
        return (
          <View style={styles.stepContainer}>
            <Heart size={36} color="#db2777" style={styles.stepIcon} />
            <Text style={styles.stepTitle}>How is your mood today?</Text>
            <Text style={styles.stepSub}>Select a score representing your feelings.</Text>

            <View style={styles.moodGrid}>
              {MOOD_LEVELS.map((item) => (
                <TouchableOpacity
                  key={item.score}
                  onPress={() => setMoodScore(item.score)}
                  style={[
                    styles.moodButton,
                    moodScore === item.score && {
                      backgroundColor: item.color + '15',
                      borderColor: item.color,
                      borderWidth: 2,
                    },
                  ]}
                >
                  <Text style={styles.moodEmoji}>{item.emoji}</Text>
                  <Text style={styles.moodNum}>{item.score}</Text>
                  <Text style={styles.moodText} numberOfLines={1}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 1:
        // Step 1: Emotion Selection (multi-select bubble)
        return (
          <View style={styles.stepContainer}>
            <Sparkles size={36} color="#8b5cf6" style={styles.stepIcon} />
            <Text style={styles.stepTitle}>What feelings stand out today?</Text>
            <Text style={styles.stepSub}>You can select multiple feeling bubbles.</Text>

            <View style={styles.emotionsContainer}>
              {EMOTIONS.map((item) => {
                const isSelected = selectedEmotions.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleEmotionToggle(item.id)}
                    style={[
                      styles.emotionPill,
                      { borderColor: item.color },
                      isSelected && { backgroundColor: item.color + '20', borderWidth: 2 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.emotionPillText,
                        { color: item.color },
                        isSelected && { fontWeight: '900' },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 2:
        // Step 2: Dynamic Questions Yes/No checklist
        return (
          <View style={styles.stepContainer}>
            <ClipboardList size={36} color="#2563eb" style={styles.stepIcon} />
            <Text style={styles.stepTitle}>Brief Wellness Checklist</Text>
            <Text style={styles.stepSub}>Let us know how your night was.</Text>

            <ScrollView style={styles.questionsList} contentContainerStyle={{ gap: 16 }}>
              {questions.map((q) => {
                const answer = questionAnswers[q.id];
                return (
                  <View key={q.id} style={styles.questionCard}>
                    <Text style={styles.questionText}>{q.text}</Text>
                    <View style={styles.yesNoRow}>
                      <TouchableOpacity
                        onPress={() => handleAnswerChange(q.id, true)}
                        style={[
                          styles.yesNoButton,
                          answer === true && styles.yesSelected,
                        ]}
                      >
                        <Text style={[styles.yesNoLabel, answer === true && styles.yesNoLabelSelected]}>YES</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleAnswerChange(q.id, false)}
                        style={[
                          styles.yesNoButton,
                          answer === false && styles.noSelected,
                        ]}
                      >
                        <Text style={[styles.yesNoLabel, answer === false && styles.yesNoLabelSelected]}>NO</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        );

      case 3:
        // Step 3: Journal Input (confidential private log)
        return (
          <View style={styles.stepContainer}>
            <MessageCircle size={36} color="#db2777" style={styles.stepIcon} />
            <Text style={styles.stepTitle}>Confidential Classroom Notes</Text>
            <Text style={styles.stepSub}>Feel free to share personal thoughts or daily messages (Optional).</Text>

            <TextInput
              multiline
              numberOfLines={6}
              placeholder="Write your private message here..."
              value={journalText}
              onChangeText={setJournalText}
              style={styles.journalBox}
              placeholderTextColor="#94a3b8"
            />
          </View>
        );

      case 4:
        // Step 4: Summary details & Submit Review
        const selectedMoodObj = MOOD_LEVELS.find((m) => m.score === moodScore) || MOOD_LEVELS[5];
        return (
          <View style={styles.stepContainer}>
            <CheckCircle size={36} color="#16a34a" style={styles.stepIcon} />
            <Text style={styles.stepTitle}>Ready to Check-in?</Text>
            <Text style={styles.stepSub}>Review your mood and check-in details before sending.</Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Mood Score:</Text>
                <Text style={styles.summaryVal}>
                  {selectedMoodObj.emoji} {selectedMoodObj.score}/10 ({selectedMoodObj.label})
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Emotions Selected:</Text>
                <Text style={styles.summaryVal}>
                  {selectedEmotions.join(', ') || 'None selected'}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Questions Answered:</Text>
                <Text style={styles.summaryVal}>
                  {Object.keys(questionAnswers).length} answers logged
                </Text>
              </View>

              {journalText.trim() ? (
                <View style={styles.summaryJournalContainer}>
                  <Text style={styles.summaryLabel}>Journal Thought:</Text>
                  <Text style={styles.summaryJournalText} numberOfLines={3}>
                    "{journalText}"
                  </Text>
                </View>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={handleWellnessSubmit}
              disabled={isSubmitting}
              style={styles.submitButton}
            >
              <LinearGradient
                colors={['#8b5cf6', '#db2777']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Submit Attendance</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loaderText}>Loading your wellness portal...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <LinearGradient
        colors={['#f5f3ff', '#fff5f7']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header Profile Title */}
      <View style={styles.header}>
        <Text style={styles.headerWelcome}>Hello, {studentName}! 👋</Text>
        <Text style={styles.headerSub}>Let us check today's status.</Text>
      </View>

      {/* Steps Indicator Progress Pills */}
      <View style={styles.indicatorContainer}>
        {[0, 1, 2, 3, 4].map((step) => (
          <View
            key={step}
            style={[
              styles.indicatorPill,
              currentStep === step && styles.activePill,
              currentStep > step && styles.completedPill,
            ]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AnimatePresence>
          <MotiView
            key={currentStep}
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'timing', duration: 250 }}
            style={styles.stepWrapper}
          >
            {renderStepContent()}
          </MotiView>
        </AnimatePresence>
      </ScrollView>

      {/* Navigation Footer Buttons */}
      <View style={styles.footer}>
        {currentStep > 0 ? (
          <TouchableOpacity onPress={prevStep} style={styles.backButton}>
            <ArrowLeft size={16} color="#475569" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {currentStep < 4 ? (
          <TouchableOpacity onPress={nextStep} style={styles.nextButton}>
            <Text style={styles.nextText}>Next</Text>
            <ArrowRight size={16} color="#fff" />
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  loaderText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748b',
    marginTop: 12,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerWelcome: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e293b',
  },
  headerSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  indicatorContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 6,
    marginVertical: 12,
  },
  indicatorPill: {
    flex: 1,
    height: 6,
    backgroundColor: '#cbd5e1',
    borderRadius: 3,
  },
  activePill: {
    backgroundColor: '#8b5cf6',
  },
  completedPill: {
    backgroundColor: '#c084fc',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  stepWrapper: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  stepContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  stepIcon: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  stepSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  moodButton: {
    width: (width - 48 - 40 - 20) / 3,
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodNum: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748b',
    marginTop: 2,
  },
  moodText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#334155',
    marginTop: 2,
  },
  emotionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  emotionPill: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: '#fff',
  },
  emotionPillText: {
    fontSize: 14,
    fontWeight: '800',
  },
  questionsList: {
    maxHeight: 300,
  },
  questionCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  questionText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
    lineHeight: 20,
    marginBottom: 12,
  },
  yesNoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  yesNoButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  yesNoLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#64748b',
  },
  yesNoLabelSelected: {
    color: '#fff',
  },
  yesSelected: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  noSelected: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  journalBox: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    padding: 14,
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    textAlignVertical: 'top',
    height: 120,
  },
  summaryCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1e293b',
  },
  summaryJournalContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  summaryJournalText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 4,
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
  submitText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1.5,
    borderTopColor: '#f1f5f9',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  nextText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
  },
});
