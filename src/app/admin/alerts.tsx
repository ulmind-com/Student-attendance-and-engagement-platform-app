import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { Search, Calendar as CalendarIcon, Printer, Clock, AlertTriangle, ChevronRight, Lock, ShieldAlert } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://kids-attendance-production.up.railway.app';

export default function AlertsScreen() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const currentDateFormatted = useMemo(() => {
    return new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/students`);
        if (res.ok) setStudents(await res.json());
      } catch (e) {
        console.error("Failed to fetch students for alerts", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Filter students who have checked in recently with low mood score (<= 4) OR are flagged as high risk
  const vulnerableStudents = useMemo(() => {
    return students.filter(s => {
      // Find latest checkin today
      const todayIso = new Date().toISOString().split('T')[0];
      const latestEntry = s.timeline?.find((e: any) => e.day === "Today" || e.date === todayIso) 
        || (s.timeline && s.timeline[s.timeline.length - 1]);
      
      const isLowMood = latestEntry && latestEntry.score <= 4;
      const isRiskFlagged = s.risk === "High Risk" || s.risk === "Moderate Risk" || s.risk === "Urgent Assistance";
      
      if (isLowMood || isRiskFlagged) {
        return true;
      }
      return false;
    });
  }, [students]);

  const filteredAlerts = useMemo(() => {
    if (!searchQuery) return vulnerableStudents;
    const q = searchQuery.toLowerCase();
    return vulnerableStudents.filter(s => 
      s.firstName.toLowerCase().includes(q) || 
      s.rollNumber.toLowerCase().includes(q) ||
      (s.lastInitial && s.lastInitial.toLowerCase().includes(q))
    );
  }, [vulnerableStudents, searchQuery]);

  const heatmapDays = Array(30).fill(0);

  const getMoodColor = (score: number) => {
    if (score >= 8) return '#22c55e';
    if (score >= 5) return '#f59e0b';
    return '#ef4444';
  };

  const getMoodBg = (score: number) => {
    if (score >= 8) return '#f0fdf4';
    if (score >= 5) return '#fffbeb';
    return '#fef2f2';
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        
        {/* Header */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 26, fontWeight: '900', color: '#1e293b', letterSpacing: -0.5 }}>Smart Alerts</Text>
            <View style={{ backgroundColor: '#fee2e2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ color: '#ef4444', fontSize: 11, fontWeight: '900' }}>
                {vulnerableStudents.length} Active
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 15, fontWeight: '500', color: '#64748b', marginTop: 4, lineHeight: 22 }}>
            Emotionally intelligent notifications requiring attention.
          </Text>
        </View>

        {/* Search */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.02, shadowRadius: 5 }}>
          <Search size={20} color="#94a3b8" />
          <TextInput 
            placeholder="Search vulnerable student..." 
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '500', color: '#334155' }}
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* Date & Print Stack */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <View style={{ flex: 1.2, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3e8ff', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16, gap: 8 }}>
            <Clock size={16} color="#9333ea" />
            <Text style={{ color: '#9333ea', fontWeight: '800', fontSize: 13 }}>{currentDateFormatted}</Text>
          </View>
          
          <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16, gap: 6 }}>
            <Printer size={16} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>Print PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Alert Frequency Heatmap */}
        <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 }}>
          <Text style={{ fontSize: 16, fontWeight: '900', color: '#1e293b', marginBottom: 16 }}>
            Vulnerability Frequency (Last 30 Days)
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {heatmapDays.map((_, i) => {
              // Mock high alert markers in the timeline
              const isAlertDay = i === 29 || i === 25 || i === 18 || i === 12;
              return (
                <View 
                  key={i} 
                  style={{ 
                    width: (width - 40 - 40 - (9 * 8)) / 10, 
                    height: 32, 
                    backgroundColor: isAlertDay ? '#fee2e2' : '#f1f5f9', 
                    borderRadius: 8, 
                    borderWidth: i === 29 ? 1.5 : 0, 
                    borderColor: '#ef4444',
                  }} 
                />
              );
            })}
          </View>
        </View>

        {/* Alert Cards */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#ef4444" style={{ marginTop: 20 }} />
        ) : (
          <View style={{ gap: 16 }}>
            {filteredAlerts.map(student => {
              const todayIso = new Date().toISOString().split('T')[0];
              const latestCheckin = student.timeline?.find((e: any) => e.day === "Today" || e.date === todayIso)
                || (student.timeline && student.timeline[student.timeline.length - 1])
                || { score: 3, emoji: '😢', emotions: ['Sad', 'Mad'], journal_text: 'Feeling dynamic support!' };
                
              return (
                <View 
                  key={student.rollNumber}
                  style={{ backgroundColor: '#fff', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#fbcfe8' }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
                    <View style={{ position: 'relative' }}>
                      <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff5f5', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fca5a5', overflow: 'hidden' }}>
                        {student.profilePhoto ? (
                          <Image source={{ uri: student.profilePhoto }} style={{ width: 50, height: 50 }} />
                        ) : (
                          <Text style={{ fontSize: 16, fontWeight: '900', color: '#ef4444' }}>{student.firstName[0]}</Text>
                        )}
                      </View>
                      <View style={{ position: 'absolute', bottom: -4, right: -4, backgroundColor: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: '#fecaca' }}>
                        <Text style={{ fontSize: 12 }}>{latestCheckin.emoji || '😢'}</Text>
                      </View>
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View>
                          <Text style={{ fontSize: 17, fontWeight: '900', color: '#1e293b' }}>
                            {student.firstName} {student.lastInitial}.
                          </Text>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b', marginTop: 2 }}>
                            Roll: {student.rollNumber} • {student.class}
                          </Text>
                        </View>
                        
                        <View style={{ alignItems: 'flex-end' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#ef4444' }} />
                            <Text style={{ fontSize: 10, fontWeight: '900', color: '#ef4444', letterSpacing: 0.5 }}>HIGH RISK</Text>
                          </View>
                          <View style={{ backgroundColor: '#fdf2f8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#fbcfe8' }}>
                            <Text style={{ color: '#db2777', fontSize: 10, fontWeight: '900' }}>AI Alert</Text>
                          </View>
                        </View>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
                        <Text style={{ fontSize: 13, fontWeight: '900', color: '#ef4444' }}>
                          Score: {latestCheckin.score}/10
                        </Text>
                        <Text style={{ color: '#cbd5e1' }}>•</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} color="#64748b" />
                          <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b' }}>Latest Check-in</Text>
                        </View>
                      </View>

                      {latestCheckin.emotions && latestCheckin.emotions.length > 0 && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                          {latestCheckin.emotions.map((em: string) => (
                            <View key={em} style={{ backgroundColor: '#fff5f5', borderWidth: 1, borderColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                              <Text style={{ fontSize: 10, fontWeight: '800', color: '#ef4444' }}>{em}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {latestCheckin.journal_text ? (
                        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start', backgroundColor: '#f8fafc', padding: 12, borderRadius: 16, marginTop: 12 }}>
                          <Lock size={12} color="#94a3b8" style={{ marginTop: 2 }} />
                          <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569', fontStyle: 'italic', lineHeight: 18, flex: 1 }}>
                            "{latestCheckin.journal_text}"
                          </Text>
                        </View>
                      ) : (
                        <View style={{ backgroundColor: '#f8fafc', padding: 10, borderRadius: 14, marginTop: 12 }}>
                          <Text style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
                            Student submitted attendance without comments.
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}

            {filteredAlerts.length === 0 && (
              <View style={{ padding: 40, alignItems: 'center', backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: '#e2e8f0' }}>
                <ShieldAlert size={36} color="#16a34a" style={{ marginBottom: 10 }} />
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#1e293b' }}>Class Wellness is Stable! ✨</Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748b', marginTop: 4, textAlign: 'center', paddingHorizontal: 20 }}>
                  No active low-mood or emotional alerts detected in classroom checks today.
                </Text>
              </View>
            )}
          </View>
        )}

      </ScrollView>
    </View>
  );
}
