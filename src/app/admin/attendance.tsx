import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Dimensions, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { Search, Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react-native';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://kids-attendance-production.up.railway.app';

function getUSATodayDateStr() {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

export default function AttendanceScreen() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" }));

  // Derive last 30 calendar days dynamically in US Eastern timezone
  const heatmapDays = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const iso = d.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
      days.push({
        isoDate: iso,
        label: d.toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" }),
        weekday: d.toLocaleDateString("en-US", { timeZone: "America/New_York", weekday: "short" })
      });
    }
    return days;
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_URL}/students`);
      if (res.ok) setStudents(await res.json());
    } catch (e) {
      console.error("Failed to fetch students in attendance", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // Live polling every 5s to capture checks in real-time
    const poll = setInterval(fetchStudents, 5000);
    return () => clearInterval(poll);
  }, []);

  // Compute status for a given day in the heatmap
  // Status is:
  // - "alert" if there is an alert flag or if mood score <= 4
  // - "present" if at least one checked-in student exists
  // - "absent" if no one checked in
  const getDayStatus = (isoDate: string) => {
    let hasCheckin = false;
    let hasAlert = false;

    students.forEach(s => {
      const entry = s.timeline?.find((e: any) => e.date === isoDate || (e.day === "Today" && isoDate === getUSATodayDateStr()));
      if (entry) {
        hasCheckin = true;
        if (entry.score <= 4 || entry.alert || s.risk === "High Risk" || s.risk === "Urgent Assistance") {
          hasAlert = true;
        }
      }
    });

    if (hasAlert) return "alert";
    if (hasCheckin) return "present";
    return "absent";
  };

  // Roster breakdown for the SELECTED date
  const selectedDateRoster = useMemo(() => {
    return students.map(s => {
      const entry = s.timeline?.find((e: any) => e.date === selectedDateStr || (e.day === "Today" && selectedDateStr === getUSATodayDateStr()));
      return {
        ...s,
        checkedIn: !!entry,
        entry
      };
    });
  }, [students, selectedDateStr]);

  const filteredRoster = useMemo(() => {
    if (!searchQuery) return selectedDateRoster;
    const q = searchQuery.toLowerCase();
    return selectedDateRoster.filter(s => 
      s.firstName.toLowerCase().includes(q) || 
      s.rollNumber.toLowerCase().includes(q) ||
      (s.lastInitial && s.lastInitial.toLowerCase().includes(q))
    );
  }, [selectedDateRoster, searchQuery]);

  const formattedSelectedDate = useMemo(() => {
    const parts = selectedDateStr.split('-');
    if (parts.length < 3) return "";
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0);
    return d.toLocaleDateString("en-US", { timeZone: "America/New_York", weekday: "short", month: "short", day: "numeric" }).toUpperCase();
  }, [selectedDateStr]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        
        {/* Header */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 26, fontWeight: '900', color: '#1e293b', letterSpacing: -0.5 }}>Attendance Center</Text>
          <Text style={{ fontSize: 15, fontWeight: '500', color: '#64748b', marginTop: 4 }}>
            Visual calendar analytics and live timeline logs.
          </Text>
        </View>

        {/* Selected Date Header */}
        <MotiView 
          from={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          style={styles.selectedDateContainer}
        >
          <CalendarIcon size={16} color="#9333ea" />
          <Text style={{ color: '#9333ea', fontWeight: '900', fontSize: 14 }}>
            VIEWING DATA: {formattedSelectedDate}
          </Text>
        </MotiView>

        {/* Heatmap Card */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '900', color: '#1e293b', width: '45%', lineHeight: 22 }}>
              Class Attendance Heatmap (Last 30 Days)
            </Text>
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#4ade80' }]}/>
                <Text style={styles.legendText}>Present</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fca5a5' }]}/>
                <Text style={styles.legendText}>Absent</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#f87171' }]}/>
                <Text style={styles.legendText}>Alert</Text>
              </View>
            </View>
          </View>

          {/* 30-Day Grid */}
          {isLoading ? (
            <ActivityIndicator size="small" color="#9333ea" />
          ) : (
            <View style={styles.heatmapGrid}>
              {heatmapDays.map((day, i) => {
                const status = getDayStatus(day.isoDate);
                const isSelected = selectedDateStr === day.isoDate;
                
                let bgColor = '#fee2e2'; // absent
                let borderCol = '#fee2e2';
                if (status === 'present') {
                  bgColor = '#dcfce7';
                  borderCol = '#86efac';
                } else if (status === 'alert') {
                  bgColor = '#fee2e2';
                  borderCol = '#ef4444';
                }

                return (
                  <TouchableOpacity 
                    key={day.isoDate} 
                    onPress={() => setSelectedDateStr(day.isoDate)}
                    activeOpacity={0.7}
                    style={[
                      styles.heatmapPill, 
                      { 
                        backgroundColor: bgColor,
                        borderColor: isSelected ? '#a855f7' : borderCol,
                        borderWidth: isSelected ? 2 : 1,
                      }
                    ]}
                  >
                    <Text style={{ fontSize: 9, fontWeight: '900', color: status === 'present' ? '#16a34a' : '#ef4444', fontVariant: ['tabular-nums'] }}>
                      {day.isoDate.split('-')[2]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <Text style={{ fontSize: 11, fontWeight: '600', color: '#94a3b8', marginTop: 14, textAlign: 'center' }}>
            💡 Tip: Click any square block above to review attendance history logs for that date.
          </Text>
        </View>

        {/* Daily Record Card */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: '900', color: '#1e293b' }}>Roster Breakdown</Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b', marginTop: 2 }}>
                Telemetry data for {formattedSelectedDate.toLowerCase()}
              </Text>
            </View>
            <View style={styles.searchBox}>
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
          <View style={styles.tableHeader}>
            <Text style={{ flex: 2, fontSize: 12, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5 }}>STUDENT</Text>
            <Text style={{ flex: 1.2, fontSize: 12, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5, textAlign: 'center' }}>STATUS</Text>
            <Text style={{ flex: 1, fontSize: 12, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5, textAlign: 'right' }}>MOOD</Text>
          </View>

          {/* Roster list */}
          {isLoading ? (
            <ActivityIndicator size="small" color="#9333ea" style={{ padding: 20 }} />
          ) : (
            <View style={{ gap: 12 }}>
              {filteredRoster.map(student => (
                <View key={student.rollNumber} style={styles.rosterRow}>
                  
                  {/* Student Details */}
                  <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={styles.avatar}>
                      {student.profilePhoto ? (
                        <Image source={{ uri: student.profilePhoto }} style={{ width: 32, height: 32 }} />
                      ) : (
                        <Text style={{ fontSize: 12, fontWeight: '900', color: '#a855f7' }}>{student.firstName[0]}</Text>
                      )}
                    </View>
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>
                        {student.firstName} {student.lastInitial || ''}.
                      </Text>
                      <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748b', marginTop: 1 }}>
                        Roll: {student.rollNumber} • {student.class}
                      </Text>
                    </View>
                  </View>

                  {/* Status Badge */}
                  <View style={{ flex: 1.2, alignItems: 'center' }}>
                    {student.checkedIn ? (
                      <View style={[styles.statusBadge, { backgroundColor: '#dcfce7' }]}>
                        <CheckCircle2 size={12} color="#16a34a" />
                        <Text style={{ fontSize: 10, fontWeight: '900', color: '#16a34a' }}>Present</Text>
                      </View>
                    ) : (
                      <View style={[styles.statusBadge, { backgroundColor: '#fee2e2' }]}>
                        <XCircle size={12} color="#ef4444" />
                        <Text style={{ fontSize: 10, fontWeight: '900', color: '#ef4444' }}>Absent</Text>
                      </View>
                    )}
                  </View>

                  {/* Mood Details */}
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    {student.checkedIn && student.entry ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={{ fontSize: 14 }}>{student.entry.emoji || '😐'}</Text>
                        <Text style={{ fontSize: 11, fontWeight: '900', color: student.entry.score >= 8 ? '#16a34a' : student.entry.score >= 5 ? '#d97706' : '#ef4444' }}>
                          {student.entry.score}/10
                        </Text>
                      </View>
                    ) : (
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#94a3b8' }}>—</Text>
                    )}
                  </View>

                </View>
              ))}

              {filteredRoster.length === 0 && (
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

const styles = StyleSheet.create({
  selectedDateContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e9d5ff'
  },
  card: {
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
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '50%',
    justifyContent: 'flex-end',
    paddingTop: 4
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  legendText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b'
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginTop: 10
  },
  heatmapPill: {
    width: (width - 40 - 32 - (9 * 6)) / 10,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    width: '45%',
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 12
  },
  rosterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc'
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  }
});
