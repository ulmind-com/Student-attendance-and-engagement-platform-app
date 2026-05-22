import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Dimensions, ActivityIndicator, Image } from 'react-native';
import { Search, Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://kids-attendance-production.up.railway.app';

export default function AttendanceScreen() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Format current date visually
  const currentDateFormatted = useMemo(() => {
    return new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
  }, []);

  const todayIsoDate = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/students`);
        if (res.ok) setStudents(await res.json());
      } catch (e) {
        console.error("Failed to fetch students", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const heatmapDays = useMemo(() => {
    const days = [];
    for(let i = 29; i >= 0; i--) {
      days.push({ id: i });
    }
    return days;
  }, []);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(s => 
      s.firstName.toLowerCase().includes(q) || 
      s.rollNumber.toLowerCase().includes(q) ||
      (s.lastInitial && s.lastInitial.toLowerCase().includes(q))
    );
  }, [students, searchQuery]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        
        {/* Header */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 26, fontWeight: '900', color: '#1e293b', letterSpacing: -0.5 }}>Attendance Center</Text>
          <Text style={{ fontSize: 15, fontWeight: '500', color: '#64748b', marginTop: 4 }}>Live monitoring and daily tracking.</Text>
        </View>

        {/* Date Picker Banner */}
        <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3e8ff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, marginBottom: 24, gap: 8 }}>
          <CalendarIcon size={16} color="#9333ea" />
          <Text style={{ color: '#9333ea', fontWeight: '800', fontSize: 13 }}>{currentDateFormatted}</Text>
        </View>

        {/* Heatmap Card */}
        <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 }}>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <Text style={{ fontSize: 17, fontWeight: '900', color: '#1e293b', width: '45%', lineHeight: 24 }}>
              Class Attendance Heatmap (Last 30 Days)
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '50%', justifyContent: 'flex-end', paddingTop: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80' }}/>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748b' }}>Present</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#f87171' }}/>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748b' }}>Absent</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#a78bfa' }}/>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748b' }}>Late</Text>
              </View>
            </View>
          </View>

          {/* Heatmap Grid (3 rows of 10 tall pills) */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {heatmapDays.map((day, i) => (
              <View 
                key={i} 
                style={{ 
                  width: (width - 40 - 40 - (9 * 8)) / 10, 
                  height: 32, 
                  backgroundColor: i === 28 ? '#e9d5ff' : i === 29 ? '#dcfce7' : '#fee2e2', 
                  borderRadius: 8, 
                  borderWidth: i === 29 ? 2 : 0, 
                  borderColor: '#9333ea',
                  opacity: i < 28 ? 0.6 : 1
                }} 
              />
            ))}
          </View>

        </View>

        {/* Daily Record Card */}
        <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 }}>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <View>
              <Text style={{ fontSize: 17, fontWeight: '900', color: '#1e293b' }}>Daily Attendance</Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b', marginTop: 2 }}>Roster breakdown for today</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, width: '50%', borderWidth: 1, borderColor: '#f1f5f9' }}>
              <Search size={14} color="#94a3b8" />
              <TextInput 
                placeholder="Search..." 
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{ flex: 1, marginLeft: 8, fontSize: 13, fontWeight: '500', color: '#334155', padding: 0 }}
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          {/* Table Header */}
          <View style={{ flexDirection: 'row', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', marginBottom: 12 }}>
            <Text style={{ flex: 2, fontSize: 12, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5 }}>STUDENT</Text>
            <Text style={{ flex: 1, fontSize: 12, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5, textAlign: 'center' }}>STATUS</Text>
            <Text style={{ flex: 1, fontSize: 12, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5, textAlign: 'right' }}>MOOD</Text>
          </View>

          {/* Roster list */}
          {isLoading ? (
            <ActivityIndicator size="small" color="#9333ea" style={{ padding: 20 }} />
          ) : (
            <View style={{ gap: 12 }}>
              {filteredStudents.map(student => {
                const checkedInToday = student.timeline?.find((e: any) => e.day === "Today" || e.date === todayIsoDate);
                return (
                  <View 
                    key={student.rollNumber} 
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f8fafc' }}
                  >
                    <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3e8ff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {student.profilePhoto ? (
                          <Image source={{ uri: student.profilePhoto }} style={{ width: 32, height: 32 }} />
                        ) : (
                          <Text style={{ fontSize: 12, fontWeight: '900', color: '#a855f7' }}>{student.firstName[0]}</Text>
                        )}
                      </View>
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>
                          {student.firstName} {student.lastInitial}.
                        </Text>
                        <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748b', marginTop: 1 }}>{student.class}</Text>
                      </View>
                    </View>

                    <View style={{ flex: 1, alignItems: 'flex-start' }}>
                      {checkedInToday ? (
                        <View style={{ backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={12} color="#16a34a" />
                          <Text style={{ fontSize: 10, fontWeight: '900', color: '#16a34a' }}>Present</Text>
                        </View>
                      ) : (
                        <View style={{ backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <XCircle size={12} color="#ef4444" />
                          <Text style={{ fontSize: 10, fontWeight: '900', color: '#ef4444' }}>Absent</Text>
                        </View>
                      )}
                    </View>

                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      {checkedInToday ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Text style={{ fontSize: 14 }}>{checkedInToday.emoji || '😊'}</Text>
                          <Text style={{ fontSize: 11, fontWeight: '900', color: '#475569' }}>{checkedInToday.score}/10</Text>
                        </View>
                      ) : (
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#94a3b8' }}>—</Text>
                      )}
                    </View>
                  </View>
                );
              })}
              
              {filteredStudents.length === 0 && (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#cbd5e1' }}>No matches found.</Text>
                </View>
              )}
            </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
}
