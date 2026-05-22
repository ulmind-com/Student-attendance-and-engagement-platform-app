import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, Modal, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { Users, SmilePlus, AlertTriangle, CheckCircle2, GraduationCap, ArrowRight, Bot, X, Calendar, Clock, BarChart2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://kids-attendance-production.up.railway.app';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good Morning", emoji: "🌅" };
  if (h < 17) return { text: "Good Afternoon", emoji: "☀️" };
  return { text: "Good Evening", emoji: "🌙" };
}

export default function AdminDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [classCount, setClassCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<"total" | "present" | "mood" | "wellness" | "classes" | null>(null);

  const fetchAll = async () => {
    try {
      const [sRes, cRes] = await Promise.all([
        fetch(`${API_URL}/students`),
        fetch(`${API_URL}/settings/classes`),
      ]);
      if (sRes.ok) setStudents(await sRes.json());
      if (cRes.ok) {
        const data = await cRes.json();
        const cls = Array.isArray(data) ? data : (data.classes || []);
        const tchs = data.teachers || [];
        setClassCount(cls.length);
        setTeacherCount(tchs.length);
        setTeachersList(tchs);
        setClassesList(cls);
      }
    } catch (e) {
      console.error("Dashboard fetch error", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // Live polling every 5 seconds as specified
    const poll = setInterval(fetchAll, 5000);

    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
      setCurrentDate(now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase());
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);

    return () => {
      clearInterval(poll);
      clearInterval(timer);
    };
  }, []);

  const totalStudents = students.length;
  const checkedInToday = students.filter(s => s.timeline?.some((e: any) => e.day === "Today" || e.date === new Date().toISOString().split('T')[0])).length;
  const absentCount = totalStudents - checkedInToday;
  const riskCount = students.filter(s => s.risk !== "Stable" && s.risk !== undefined).length;
  
  const avgMoodRaw = students.length > 0
    ? (students.reduce((acc, s) => {
        const todayEntry = s.timeline?.find((e: any) => e.day === "Today" || e.date === new Date().toISOString().split('T')[0]);
        return acc + (todayEntry ? todayEntry.score : 7);
      }, 0) / students.length)
    : 0;
  const avgMood = avgMoodRaw > 0 ? avgMoodRaw.toFixed(1) : "7.2";

  // Derive check-ins for the live feed
  const liveCheckins = students.map(s => {
    const todayEntry = s.timeline?.find((e: any) => e.day === "Today" || e.date === new Date().toISOString().split('T')[0]);
    return {
      id: s.rollNumber,
      name: `${s.firstName} ${s.lastInitial || ''}`,
      roll: s.rollNumber,
      emoji: todayEntry?.emoji || "😶",
      score: todayEntry?.score || 0,
      checkedIn: !!todayEntry,
      risk: s.risk || 'Stable',
      class: s.class_name || s.class || "N/A",
      profilePhoto: s.profilePhoto,
      initial: s.firstName[0]
    };
  });

  // Calculate mood distribution categories
  const moodCounts = students.reduce((acc, s) => {
    const todayEntry = s.timeline?.find((e: any) => e.day === "Today" || e.date === new Date().toISOString().split('T')[0]);
    const score = todayEntry ? todayEntry.score : 7;
    if (score >= 8) acc.happy++;
    else if (score >= 5) acc.neutral++;
    else acc.sad++;
    return acc;
  }, { happy: 0, neutral: 0, sad: 0 });

  const greeting = getGreeting();

  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        
        {/* Header */}
        <MotiView 
          from={{ opacity: 0, translateY: -20 }} 
          animate={{ opacity: 1, translateY: 0 }} 
          transition={{ type: 'timing', duration: 500 }}
          style={{ marginBottom: 20 }}
        >
          <Text style={{ fontSize: 26, fontWeight: '900', color: '#1e293b', letterSpacing: -0.5 }}>
            {greeting.text}, Teacher {greeting.emoji}
          </Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748b', marginTop: 4 }}>
            Here is the emotional wellness summary for today.
          </Text>
        </MotiView>

        {/* Date Time Box */}
        <View style={styles.dateTimeContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Calendar size={13} color="#94a3b8" />
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5 }}>{currentDate}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Clock size={14} color="#1e293b" />
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#1e293b', fontVariant: ['tabular-nums'] }}>{currentTime}</Text>
          </View>
        </View>

        {/* AI Insight banner */}
        <LinearGradient 
          colors={['#a855f7', '#ec4899']} 
          start={{x: 0, y: 0}} end={{x: 1, y: 1}} 
          style={styles.aiInsightContainer}
        >
          <View style={styles.aiIconWrapper}>
            <Bot color="#fff" size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '900', marginBottom: 2, letterSpacing: 0.5 }}>
              AI EMOTIONAL DIGEST
            </Text>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700', lineHeight: 18 }}>
              {riskCount > 0 
                ? `${riskCount} student(s) require emotional follow-up checks today.` 
                : "All students checked in report highly stable emotional wellbeing today!"}
            </Text>
          </View>
        </LinearGradient>

        {/* Stat Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 24 }}>
          
          {/* Card 1: Total Students */}
          <TouchableOpacity onPress={() => setActiveModal("total")} style={{ width: (width - 52) / 2 }}>
            <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={styles.statIconBadge}>
                  <Users size={16} color="#fff" />
                </View>
                <ArrowRight size={12} color="rgba(255,255,255,0.7)" />
              </View>
              <Text style={styles.statValue}>{totalStudents}</Text>
              <Text style={styles.statTitle}>Total Students</Text>
              <Text style={styles.statSub}>Enrolled roster</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Card 2: Classes */}
          <TouchableOpacity onPress={() => setActiveModal("classes")} style={{ width: (width - 52) / 2 }}>
            <LinearGradient colors={['#10b981', '#047857']} style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={styles.statIconBadge}>
                  <GraduationCap size={16} color="#fff" />
                </View>
                <ArrowRight size={12} color="rgba(255,255,255,0.7)" />
              </View>
              <Text style={styles.statValue}>{classCount || 4}</Text>
              <Text style={styles.statTitle}>Classes</Text>
              <Text style={styles.statSub}>{teacherCount || 3} teachers</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Card 3: Present */}
          <TouchableOpacity onPress={() => setActiveModal("present")} style={{ width: (width - 52) / 2 }}>
            <LinearGradient colors={['#22c55e', '#15803d']} style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={styles.statIconBadge}>
                  <CheckCircle2 size={16} color="#fff" />
                </View>
                <ArrowRight size={12} color="rgba(255,255,255,0.7)" />
              </View>
              <Text style={styles.statValue}>{checkedInToday}</Text>
              <Text style={styles.statTitle}>Present Today</Text>
              <Text style={styles.statSub}>{absentCount} absent</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Card 4: Mood */}
          <TouchableOpacity onPress={() => setActiveModal("mood")} style={{ width: (width - 52) / 2 }}>
            <LinearGradient colors={['#a855f7', '#7e22ce']} style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={styles.statIconBadge}>
                  <SmilePlus size={16} color="#fff" />
                </View>
                <ArrowRight size={12} color="rgba(255,255,255,0.7)" />
              </View>
              <Text style={styles.statValue}>{avgMood}</Text>
              <Text style={styles.statTitle}>Avg Mood Score</Text>
              <Text style={styles.statSub}>Scale of 10</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Card 5: Alerts */}
          <TouchableOpacity onPress={() => setActiveModal("wellness")} style={{ width: width - 40 }}>
            <LinearGradient colors={riskCount > 0 ? ['#ef4444', '#b91c1c'] : ['#10b981', '#047857']} style={[styles.statCard, { paddingVertical: 14 }]}>
              <View style={styles.statHeader}>
                <View style={styles.statIconBadge}>
                  <AlertTriangle size={16} color="#fff" />
                </View>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>Wellness Tracker</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <View>
                  <Text style={styles.statValue}>{riskCount}</Text>
                  <Text style={styles.statTitle}>Active Wellness Alerts</Text>
                </View>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>
                    {riskCount > 0 ? "Needs Review" : "All Healthy"}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

        </View>

        {/* Mood Distribution Breakdown Section */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Mood Distribution Breakdown</Text>
          <View style={{ gap: 12, marginTop: 16 }}>
            {/* Happy */}
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={styles.moodLabel}>😊 Happy (Score 8-10)</Text>
                <Text style={styles.moodCountText}>{moodCounts.happy} students</Text>
              </View>
              <View style={styles.barBackground}>
                <View style={[styles.barFill, { backgroundColor: '#22c55e', width: `${totalStudents > 0 ? (moodCounts.happy / totalStudents) * 100 : 0}%` }]} />
              </View>
            </View>

            {/* Neutral */}
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={styles.moodLabel}>😐 Neutral (Score 5-7)</Text>
                <Text style={styles.moodCountText}>{moodCounts.neutral} students</Text>
              </View>
              <View style={styles.barBackground}>
                <View style={[styles.barFill, { backgroundColor: '#f59e0b', width: `${totalStudents > 0 ? (moodCounts.neutral / totalStudents) * 100 : 0}%` }]} />
              </View>
            </View>

            {/* Sad */}
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={styles.moodLabel}>😢 Low Mood (Score 1-4)</Text>
                <Text style={styles.moodCountText}>{moodCounts.sad} students</Text>
              </View>
              <View style={styles.barBackground}>
                <View style={[styles.barFill, { backgroundColor: '#ef4444', width: `${totalStudents > 0 ? (moodCounts.sad / totalStudents) * 100 : 0}%` }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Recent Class Check-ins */}
        <View style={styles.cardSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Text style={styles.sectionTitle}>Recent Daily Check-ins</Text>
            <View style={{ backgroundColor: '#f3e8ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ color: '#9333ea', fontSize: 10, fontWeight: '900' }}>LIVE</Text>
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator size="small" color="#9333ea" style={{ padding: 20 }} />
          ) : (
            <View style={{ gap: 10 }}>
              {liveCheckins.filter(c => c.checkedIn).slice(0, 4).map(c => (
                <View key={c.id} style={styles.checkinRow}>
                  <View style={styles.initialBadge}>
                    {c.profilePhoto ? (
                      <Image source={{ uri: c.profilePhoto }} style={{ width: 34, height: 34 }} />
                    ) : (
                      <Text style={{ fontSize: 12, fontWeight: '900', color: '#9333ea' }}>{c.initial}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>{c.name}</Text>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748b', marginTop: 1 }}>Roll: {c.roll} • {c.class}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Text style={{ fontSize: 16 }}>{c.emoji}</Text>
                    <Text style={{ fontSize: 11, fontWeight: '900', color: c.score >= 8 ? '#16a34a' : c.score >= 5 ? '#d97706' : '#dc2626' }}>
                      {c.score}/10
                    </Text>
                  </View>
                </View>
              ))}

              {liveCheckins.filter(c => c.checkedIn).length === 0 && (
                <Text style={{ textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', paddingVertical: 20, fontSize: 13, fontWeight: '600' }}>
                  No students checked in yet today.
                </Text>
              )}
            </View>
          )}
        </View>

      </ScrollView>

      {/* --- STAT DETAILS MODAL MODULAR OVERLAYS --- */}
      <Modal visible={activeModal !== null} transparent animationType="fade" onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <MotiView 
            from={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {activeModal === "total" && "All Enrolled Students"}
                  {activeModal === "present" && "Present Today"}
                  {activeModal === "mood" && "Mood Score Details"}
                  {activeModal === "wellness" && "Wellness Alerts"}
                  {activeModal === "classes" && "Classes & Teams"}
                </Text>
                <Text style={styles.modalSubtitle}>Roster overview and telemetry details.</Text>
              </View>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400, marginTop: 12 }}>
              
              {/* TOTAL STUDENTS LIST */}
              {activeModal === "total" && (
                <View style={{ gap: 10 }}>
                  {students.map(s => (
                    <View key={s.rollNumber} style={styles.modalListCard}>
                      <View style={[styles.avatarRound, { backgroundColor: '#f3e8ff' }]}>
                        {s.profilePhoto ? <Image source={{ uri: s.profilePhoto }} style={{ width: 36, height: 36 }} /> : <Text style={{ fontSize: 13, fontWeight: '800', color: '#9333ea' }}>{s.firstName[0]}</Text>}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>{s.firstName} {s.lastInitial || ''}</Text>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 1 }}>Roll: {s.rollNumber} • {s.class || 'N/A'}</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: s.status === 'inactive' ? '#f1f5f9' : '#dcfce7' }]}>
                        <Text style={{ fontSize: 9, fontWeight: '900', color: s.status === 'inactive' ? '#64748b' : '#15803d' }}>
                          {s.status === 'inactive' ? 'INACTIVE' : 'ACTIVE'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* PRESENT STUDENTS LIST */}
              {activeModal === "present" && (
                <View style={{ gap: 10 }}>
                  {liveCheckins.map(s => (
                    <View key={s.id} style={[styles.modalListCard, { borderColor: s.checkedIn ? '#dcfce7' : '#fee2e2', borderWidth: 1 }]}>
                      <View style={styles.avatarRound}>
                        {s.profilePhoto ? <Image source={{ uri: s.profilePhoto }} style={{ width: 36, height: 36 }} /> : <Text style={{ fontSize: 13, fontWeight: '800', color: '#475569' }}>{s.initial}</Text>}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>{s.name}</Text>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 1 }}>Roll: {s.roll}</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: s.checkedIn ? '#dcfce7' : '#fee2e2' }]}>
                        <Text style={{ fontSize: 9, fontWeight: '900', color: s.checkedIn ? '#16a34a' : '#ef4444' }}>
                          {s.checkedIn ? '✓ PRESENT' : '✗ ABSENT'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* MOOD SCORE DETAILS GAUGE */}
              {activeModal === "mood" && (
                <View style={{ gap: 14 }}>
                  {liveCheckins.map(s => {
                    const score = s.checkedIn ? s.score : 0;
                    return (
                      <View key={s.id} style={{ gap: 6 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>{s.name} ({s.emoji})</Text>
                          <Text style={{ fontSize: 12, fontWeight: '900', color: score >= 8 ? '#16a34a' : score >= 5 ? '#d97706' : '#ef4444' }}>
                            {s.checkedIn ? `${score}/10` : 'Not checked in'}
                          </Text>
                        </View>
                        <View style={styles.barBackground}>
                          <View style={[styles.barFill, { backgroundColor: score >= 8 ? '#22c55e' : score >= 5 ? '#f59e0b' : '#ef4444', width: `${score * 10}%` }]} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* WELLNESS ALERTS TRACKER */}
              {activeModal === "wellness" && (
                <View style={{ gap: 12 }}>
                  {students.filter(s => s.risk !== "Stable" && s.risk !== undefined).map(s => {
                    const todayEntry = s.timeline?.find((e: any) => e.day === "Today" || e.date === new Date().toISOString().split('T')[0]);
                    return (
                      <View key={s.rollNumber} style={[styles.modalListCard, { flexDirection: 'column', alignItems: 'stretch', borderColor: '#fecaca', borderWidth: 1, padding: 14 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <View style={styles.avatarRound}>
                            {s.profilePhoto ? <Image source={{ uri: s.profilePhoto }} style={{ width: 36, height: 36 }} /> : <Text style={{ fontSize: 13, fontWeight: '800', color: '#ef4444' }}>{s.firstName[0]}</Text>}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>{s.firstName} {s.lastInitial || ''}</Text>
                            <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 1 }}>Roll: {s.rollNumber} • {s.class}</Text>
                          </View>
                          <View style={[styles.badge, { backgroundColor: '#fee2e2' }]}>
                            <Text style={{ fontSize: 9, fontWeight: '900', color: '#ef4444' }}>{s.risk}</Text>
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 6, backgroundColor: '#f8fafc', padding: 10, borderRadius: 10, marginTop: 10, alignItems: 'flex-start' }}>
                          <Bot size={13} color="#9333ea" style={{ marginTop: 2 }} />
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569', flex: 1 }}>
                            {s.risk === 'Needs Attention' ? 'Emotional check-in score was moderate. Brief follow up privately during next recess.' : 'High risk conditions. Immediate advisor attention recommended.'}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                  {students.filter(s => s.risk !== "Stable" && s.risk !== undefined).length === 0 && (
                    <Text style={{ textAlign: 'center', color: '#94a3b8', paddingVertical: 20, fontWeight: '600' }}>
                      All students are stable. No alerts today.
                    </Text>
                  )}
                </View>
              )}

              {/* CLASSES & TEACHERS LIST */}
              {activeModal === "classes" && (
                <View style={{ gap: 10 }}>
                  {classesList.map((cls, i) => (
                    <View key={i} style={styles.modalListCard}>
                      <View style={[styles.avatarRound, { backgroundColor: '#e0f2fe' }]}>
                        <GraduationCap size={16} color="#0284c7" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>{cls.name}</Text>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 1 }}>
                          Teacher: {cls.teacher || 'Assigning...'}
                        </Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: '#e0f2fe' }]}>
                        <Text style={{ fontSize: 9, fontWeight: '900', color: '#0369a1' }}>
                          {cls.students_count || 0} Students
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

            </ScrollView>
          </MotiView>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  dateTimeContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  aiInsightContainer: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4
  },
  aiIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  statCard: {
    borderRadius: 20,
    padding: 14,
    minHeight: 115,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  statIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff'
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
    marginTop: 2
  },
  statSub: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1
  },
  cardSection: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1e293b'
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569'
  },
  moodCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b'
  },
  barBackground: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 2
  },
  barFill: {
    height: '100%',
    borderRadius: 4
  },
  checkinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    gap: 10
  },
  initialBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1e293b'
  },
  modalSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalListCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  avatarRound: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  }
});
