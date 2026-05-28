import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Image,
  StyleSheet,
  Pressable,
  Platform,
  Alert
} from 'react-native';
import {
  Search,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Bot,
  SlidersHorizontal,
  MoreVertical,
  Users,
  Printer
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://student-attendance-and-engagement.onrender.com/api';

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

function getMoodTextAndColor(score: number) {
  if (score <= 2) return { label: "Sad", color: "#ef4444", emoji: "😢", showShield: true };
  if (score <= 4) return { label: "Mad", color: "#ef4444", emoji: "😡", showShield: true };
  if (score <= 6) return { label: "Neutral", color: "#f59e0b", emoji: "😐", showShield: false };
  if (score <= 8) return { label: "Happy", color: "#22c55e", emoji: "😊", showShield: false };
  return { label: "Excited", color: "#22c55e", emoji: "🤩", showShield: false };
}

// Custom responsive touchable
const Touchable = ({ children, style, onPress, ...props }: any) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      style,
      pressed && { opacity: 0.6 }
    ]}
    {...props}
  >
    {children}
  </Pressable>
);

export default function AttendanceScreen() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" })
  );

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
        weekday: d.toLocaleDateString("en-US", { timeZone: "America/New_York", weekday: "short" }),
        dayNum: d.toLocaleDateString("en-US", { timeZone: "America/New_York", day: "numeric" })
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
    const poll = setInterval(fetchStudents, 5000);
    return () => clearInterval(poll);
  }, []);

  // Compute status for a given day in the heatmap
  // - "alert": at least one checked-in student with mood <= 4
  // - "present": at least one checked-in student
  // - "absent": no checks at all
  const getDayStatus = (isoDate: string) => {
    let hasCheckin = false;
    let hasAlert = false;

    students.forEach(s => {
      const entry = s.timeline?.find((e: any) => e.date === isoDate || (e.day === "Today" && isoDate === getUSATodayDateStr()));
      if (entry) {
        hasCheckin = true;
        if (entry.score <= 4) {
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

  // Overall Present/Absent Counts for Selected Date
  const overviewStats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let totalMood = 0;
    let moodCount = 0;

    selectedDateRoster.forEach(s => {
      if (s.checkedIn) {
        present++;
        if (s.entry?.score !== undefined) {
          totalMood += s.entry.score;
          moodCount++;
        }
      } else {
        absent++;
      }
    });

    const avgMood = moodCount > 0 ? (totalMood / moodCount).toFixed(1) : "7.2";
    return { present, absent, avgMood: parseFloat(avgMood) };
  }, [selectedDateRoster]);

  // Checkins in sorted timestamp order for Live Feed panel
  const liveCheckins = useMemo(() => {
    const list: any[] = [];
    students.forEach(s => {
      const entry = s.timeline?.find((e: any) => e.date === selectedDateStr || (e.day === "Today" && selectedDateStr === getUSATodayDateStr()));
      if (entry) {
        list.push({
          id: s.rollNumber,
          name: `${s.firstName} ${s.lastInitial || ''}.`,
          roll: s.rollNumber,
          score: entry.score,
          time: entry.time || "9:15 AM",
          profilePhoto: s.profilePhoto,
          initial: s.firstName ? s.firstName[0] : 'S'
        });
      }
    });
    return list;
  }, [students, selectedDateStr]);

  const handlePrint = () => {
    if (Platform.OS === 'web') {
      const printWindow = window.open('', '_blank', 'width=1000,height=800');
      if (!printWindow) return;

      const rowsHtml = filteredRoster.map(s => {
        const sClass = s.checkedIn ? 'status-present' : 'status-absent';
        const moodInfo = s.checkedIn && s.entry ? getMoodTextAndColor(s.entry.score) : null;
        return `
          <tr>
            <td>
              <div class="student-name">${s.firstName} ${s.lastInitial || ''}</div>
              <div class="student-meta">Roll: ${s.rollNumber}</div>
            </td>
            <td>
              <span class="status-tag ${sClass}">
                ${s.checkedIn ? 'Present' : 'Absent'}
              </span>
            </td>
            <td style="font-weight: bold;">
              ${s.checkedIn && moodInfo ? `${moodInfo.emoji} ${moodInfo.label} (${s.entry.score}/10)` : '—'}
            </td>
            <td style="font-weight: bold; color: #475569;">
              ${s.checkedIn && s.entry ? (s.entry.time || '9:00 AM') : '—'}
            </td>
          </tr>
        `;
      }).join('');

      const emptyHtml = filteredRoster.length === 0 ? '<tr><td colspan="4" style="text-align:center; padding: 30px; font-weight:bold; color:#94a3b8;">No records found for this selection.</td></tr>' : '';

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Attendance Report - ${selectedDateStr}</title>
            <style>
              @page { size: letter portrait; margin: 0.5in; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                padding: 0; 
                margin: 0; 
                color: #0f172a;
              }
              .container { padding: 20px; max-width: 100%; margin: 0 auto; }
              .header { 
                text-align: center; 
                margin-bottom: 25px; 
                padding-bottom: 15px; 
                border-bottom: 2px solid #e2e8f0;
              }
              .header h2 { 
                margin: 0 0 10px 0; 
                font-size: 28px; 
                font-weight: 900; 
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .header p { 
                margin: 0; 
                color: #64748b; 
                font-size: 14px; 
                font-weight: bold;
              }
              .stats-row {
                display: flex;
                gap: 15px;
                margin-bottom: 25px;
              }
              .stat-box {
                flex: 1;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                padding: 12px;
                border-radius: 8px;
                text-align: center;
              }
              .stat-val { font-size: 20px; font-weight: 900; color: #0f172a; margin-top: 4px;}
              .stat-lbl { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 10px; 
              }
              th { 
                background: #f8fafc; 
                padding: 12px; 
                text-align: left; 
                font-size: 12px; 
                text-transform: uppercase; 
                font-weight: 900; 
                color: #475569; 
                border: 1px solid #cbd5e1; 
              }
              td { 
                padding: 12px; 
                border: 1px solid #e2e8f0; 
                font-size: 14px; 
              }
              .student-name { font-weight: 800; color: #1e293b; font-size: 16px; margin-bottom: 4px; }
              .student-meta { color: #64748b; font-size: 12px; font-weight: 600; }
              .status-tag {
                font-size: 11px;
                font-weight: 800;
                padding: 4px 10px;
                border-radius: 20px;
                text-transform: uppercase;
                display: inline-block;
              }
              .status-present { background: #dcfce7; color: #166534; }
              .status-absent { background: #fee2e2; color: #991b1b; }
              .footer { 
                margin-top: 40px; 
                text-align: center; 
                font-size: 12px; 
                color: #94a3b8; 
                border-top: 1px solid #e2e8f0; 
                padding-top: 10px; 
              }
              .print-btn {
                display: block;
                width: 200px;
                margin: 20px auto;
                padding: 12px 24px;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
              }
              @media print {
                .print-btn { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <button class="print-btn" onclick="window.print()">🖨️ Print Document</button>
              <div class="header">
                <h2>Attendance Report</h2>
                <p>Date: ${selectedDateStr} | Search query: ${searchQuery || 'None'}</p>
              </div>
              <div class="stats-row">
                <div class="stat-box">
                  <div class="stat-lbl">Present</div>
                  <div class="stat-val">${overviewStats.present}</div>
                </div>
                <div class="stat-box">
                  <div class="stat-lbl">Absent</div>
                  <div class="stat-val">${overviewStats.absent}</div>
                </div>
                <div class="stat-box">
                  <div class="stat-lbl">Avg Mood Rating</div>
                  <div class="stat-val">${overviewStats.avgMood} / 10</div>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Student Info</th>
                    <th>Status</th>
                    <th>Mood & Engagement</th>
                    <th>Check-in Time</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                  ${emptyHtml}
                </tbody>
              </table>
              <div class="footer">
                Generated by Student Attendance and Engagement Platform &bull; ${new Date().toLocaleString()}
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } else {
      Alert.alert("Print PDF", "Print list generated! Please use the web dashboard to print/save this attendance report as a PDF.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fcfcfc' }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 110 }}>

        {/* ── HEADER WITH DATE DISPLAY ── */}
        <MotiView
          from={{ opacity: 0, translateY: -15 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: '900', color: '#1e293b', letterSpacing: -0.6 }}>Attendance Center</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748b', marginTop: 3 }}>
              Live monitoring and daily tracking.
            </Text>
          </View>
          
          {/* Top right buttons row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={styles.selectedDateBadge}>
              <CalendarIcon size={13} color="#8b5cf6" />
              <Text style={{ fontSize: 11, fontWeight: '900', color: '#8b5cf6' }}>
                {selectedDateStr.replaceAll('-', '/')}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handlePrint}
              activeOpacity={0.7}
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 4, 
                backgroundColor: '#f1f5f9', 
                paddingVertical: 6, 
                paddingHorizontal: 10, 
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#e2e8f0'
              }}
            >
              <Printer size={12} color="#475569" />
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#475569' }}>Print PDF</Text>
            </TouchableOpacity>
          </View>
        </MotiView>

        {/* ── TODAY'S OVERVIEW GLASS GRADIENT CARD ── */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ marginBottom: 20 }}
        >
          <LinearGradient
            colors={['#8b5cf6', '#ec4899', '#f97316']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.overviewGradientCard}
          >
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>
                TODAY'S OVERVIEW
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
              {/* Present Box */}
              <View style={styles.glassStatBox}>
                <Text style={styles.glassStatLabel}>Present</Text>
                <Text style={styles.glassStatValue}>{overviewStats.present}</Text>
              </View>

              {/* Absent Box */}
              <View style={styles.glassStatBox}>
                <Text style={styles.glassStatLabel}>Absent</Text>
                <Text style={styles.glassStatValue}>{overviewStats.absent}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>Avg Mood</Text>
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '900' }}>{overviewStats.avgMood} / 10</Text>
              </View>
              <Text style={{ fontSize: 18 }}>
                {overviewStats.avgMood >= 8 ? "😊" : overviewStats.avgMood >= 5 ? "😐" : "😢"}
              </Text>
            </View>
          </LinearGradient>
        </MotiView>

        {/* ── CLASS ATTENDANCE HEATMAP (LAST 30 DAYS) ── */}
        <View style={styles.cardSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.sectionTitle}>Class Attendance Heatmap</Text>
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#94a3b8', marginTop: 1 }}>
                Last 30 Days monitoring logs
              </Text>
            </View>

            {/* Legend dots */}
            <View style={styles.legendWrapper}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#86efac' }]} />
                <Text style={styles.legendText}>Present</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fca5a5' }]} />
                <Text style={styles.legendText}>Absent</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#f3e8ff', borderWidth: 1, borderColor: '#d8b4fe' }]} />
                <Text style={styles.legendText}>Alert</Text>
              </View>
            </View>
          </View>

          {/* Grid Layout of rounded pills */}
          {isLoading ? (
            <ActivityIndicator size="small" color="#8b5cf6" style={{ padding: 15 }} />
          ) : (
            <View style={styles.heatmapGrid}>
              {heatmapDays.map((day, i) => {
                const status = getDayStatus(day.isoDate);
                const isSelected = selectedDateStr === day.isoDate;

                // Set styles to perfectly match web screenshot:
                // Present: green outline/fill, Absent: pink fill, Alert: purple fill
                let bgColor = '#fee2e2'; 
                let borderColor = '#fee2e2';

                if (status === 'present') {
                  bgColor = '#dcfce7';
                  borderColor = '#86efac';
                } else if (status === 'alert') {
                  bgColor = '#f3e8ff';
                  borderColor = '#d8b4fe';
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
                        borderColor: isSelected ? '#8b5cf6' : borderColor,
                        borderWidth: isSelected ? 2 : 1
                      }
                    ]}
                  >
                    <Text style={{ fontSize: 9, fontWeight: '900', color: status === 'present' ? '#16a34a' : status === 'alert' ? '#8b5cf6' : '#ef4444' }}>
                      {day.dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <Text style={{ fontSize: 10, fontWeight: '700', color: '#94a3b8', marginTop: 12, textAlign: 'center' }}>
            💡 Select any day block to inspect check-in records for that date.
          </Text>
        </View>

        {/* ── LIVE CHECK-INS PANEL (SIDEBAR PARITY) ── */}
        <View style={styles.cardSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' }} />
            <Text style={styles.sectionTitle}>Live Check-ins</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
            {liveCheckins.map((checkin) => (
              <View key={checkin.id} style={styles.liveCheckinCard}>
                <View style={styles.liveAvatar}>
                  {checkin.profilePhoto ? (
                    <Image source={{ uri: checkin.profilePhoto }} style={{ width: 34, height: 34 }} />
                  ) : (
                    <Text style={{ fontSize: 12, fontWeight: '900', color: '#8b5cf6' }}>{checkin.initial}</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '900', color: '#1e293b' }}>{checkin.name}</Text>
                  <Text style={{ fontSize: 9, fontWeight: '600', color: '#94a3b8', marginTop: 1 }}>Roll: {checkin.roll}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <Text style={{ fontSize: 8, fontWeight: '700', color: '#94a3b8' }}>Just now</Text>
                    <Text style={{ fontSize: 9, fontWeight: '900', color: '#f59e0b' }}>Mood: {checkin.score}/10</Text>
                  </View>
                </View>
              </View>
            ))}

            {liveCheckins.length === 0 && (
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#94a3b8', fontStyle: 'italic', paddingVertical: 10 }}>
                No active check-ins recorded for this day.
              </Text>
            )}
          </ScrollView>
        </View>

        {/* ── DAILY ATTENDANCE RECORD TABLE ── */}
        <View style={styles.cardSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.sectionTitle}>Daily Attendance Record</Text>
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#94a3b8', marginTop: 1 }}>
                Roster breakdown for {formattedSelectedDate.toLowerCase()}
              </Text>
            </View>

            {/* Premium Search box */}
            <View style={styles.searchContainer}>
              <Search size={13} color="#94a3b8" />
              <TextInput
                placeholder="Search student..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{ flex: 1, marginLeft: 6, fontSize: 12, fontWeight: '600', color: '#334155', padding: 0 }}
                placeholderTextColor="#94a3b8"
              />
              <TouchableOpacity style={{ padding: 2 }}>
                <SlidersHorizontal size={12} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Table Headers */}
          <View style={styles.tableHeader}>
            <Text style={{ flex: 2, fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 0.5 }}>STUDENT</Text>
            <Text style={{ flex: 1.2, fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 0.5, textAlign: 'center' }}>STATUS</Text>
            <Text style={{ flex: 1.5, fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 0.5, textAlign: 'center' }}>MOOD</Text>
            <Text style={{ flex: 1, fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 0.5, textAlign: 'right' }}>TIME</Text>
            <Text style={{ width: 26 }} />
          </View>

          {/* Table List Rows */}
          {isLoading ? (
            <ActivityIndicator size="small" color="#8b5cf6" style={{ padding: 20 }} />
          ) : (
            <View style={{ gap: 8 }}>
              {filteredRoster.map(student => {
                const moodInfo = student.checkedIn && student.entry ? getMoodTextAndColor(student.entry.score) : null;
                return (
                  <View key={student.rollNumber} style={styles.tableRow}>
                    
                    {/* Column 1: Student Details */}
                    <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={styles.avatar}>
                        {student.profilePhoto ? (
                          <Image source={{ uri: student.profilePhoto }} style={{ width: 32, height: 32 }} />
                        ) : (
                          <Text style={{ fontSize: 11, fontWeight: '900', color: '#8b5cf6' }}>
                            {student.firstName ? student.firstName[0] : 'S'}
                          </Text>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '900', color: '#1e293b' }} numberOfLines={1}>
                          {student.firstName} {student.lastInitial || ''}
                        </Text>
                        <Text style={{ fontSize: 9, fontWeight: '700', color: '#94a3b8', marginTop: 1 }}>
                          Roll: {student.rollNumber}
                        </Text>
                      </View>
                    </View>

                    {/* Column 2: Status Pill Badge */}
                    <View style={{ flex: 1.2, alignItems: 'center' }}>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: student.checkedIn ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }
                        ]}
                      >
                        <Text style={{ fontSize: 9, fontWeight: '900', color: student.checkedIn ? '#22c55e' : '#ef4444' }}>
                          {student.checkedIn ? 'Present' : 'Absent'}
                        </Text>
                      </View>
                    </View>

                    {/* Column 3: Mood details */}
                    <View style={{ flex: 1.5, alignItems: 'center', justifyContent: 'center' }}>
                      {student.checkedIn && moodInfo ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                          <Text style={{ fontSize: 11, fontWeight: '800', color: '#475569' }}>
                            {moodInfo.label}
                          </Text>
                          <Text style={{ fontSize: 10, fontWeight: '900', color: moodInfo.color }}>
                            {student.entry.score}/10
                          </Text>
                          {moodInfo.showShield && (
                            <ShieldAlert size={10} color="#ef4444" style={{ marginLeft: 2 }} />
                          )}
                        </View>
                      ) : (
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#cbd5e1' }}>—</Text>
                      )}
                    </View>

                    {/* Column 4: Check-in Time */}
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: '#64748b' }}>
                        {student.checkedIn && student.entry ? (student.entry.time || "9:00 AM") : "—"}
                      </Text>
                    </View>

                    {/* Column 5: Action Menu Icon */}
                    <TouchableOpacity style={styles.actionMenuBtn}>
                      <MoreVertical size={13} color="#94a3b8" />
                    </TouchableOpacity>

                  </View>
                );
              })}

              {filteredRoster.length === 0 && (
                <View style={{ padding: 25, alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#cbd5e1', fontStyle: 'italic' }}>
                    No matching students found in roster.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles: any = StyleSheet.create({
  selectedDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e9d5ff'
  },
  overviewGradientCard: {
    borderRadius: 24,
    padding: 16,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4
  },
  glassStatBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  glassStatLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  glassStatValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4
  },
  cardSection: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1e293b'
  },
  legendWrapper: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
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
    fontSize: 9,
    fontWeight: '800',
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
    width: (SCREEN_WIDTH - 72 - (9 * 6)) / 10,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveCheckinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 10,
    width: 140,
    gap: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  liveAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    width: '50%',
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 8,
    marginTop: 12,
    alignItems: 'center'
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
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
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionMenuBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
