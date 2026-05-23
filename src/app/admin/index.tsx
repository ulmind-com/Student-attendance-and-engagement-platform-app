import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Platform
} from 'react-native';
import {
  Users,
  SmilePlus,
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  Bot,
  X,
  Calendar,
  Clock,
  BarChart2,
  BookOpen,
  Sun,
  Cloud,
  Moon,
  Bell,
  ShieldCheck,
  ShieldAlert,
  Heart,
  Menu
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence } from 'moti';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Path,
  Circle,
  Line,
  Text as SvgText,
  Polygon,
  Rect
} from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
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

function getGreeting() {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      hour12: false
    });
    const h = parseInt(formatter.format(new Date()), 10);
    if (h < 12) return { text: "Good Morning", Icon: Sun, color: "#f59e0b" };
    if (h < 17) return { text: "Good Afternoon", Icon: Cloud, color: "#38bdf8" };
    return { text: "Good Evening", Icon: Moon, color: "#a855f7" };
  } catch (e) {
    const h = new Date().getHours();
    if (h < 12) return { text: "Good Morning", Icon: Sun, color: "#f59e0b" };
    if (h < 17) return { text: "Good Afternoon", Icon: Cloud, color: "#38bdf8" };
    return { text: "Good Evening", Icon: Moon, color: "#a855f7" };
  }
}

// ── CUSTOM RESPONSIVE SVG CHARTS ──

const weeklyData = [
  { name: "Mon", score: 8.2, present: 2, absent: 1 },
  { name: "Tue", score: 8.5, present: 3, absent: 0 },
  { name: "Wed", score: 7.8, present: 2, absent: 1 },
  { name: "Thu", score: 8.9, present: 3, absent: 0 },
  { name: "Fri", score: 9.1, present: 3, absent: 0 },
];

const radarData = [
  { subject: "Happiness", value: 85 },
  { subject: "Safety", value: 90 },
  { subject: "Energy", value: 72 },
  { subject: "Social", value: 78 },
  { subject: "Focus", value: 68 },
  { subject: "Sleep", value: 82 },
];

function ClassEmotionalTrendChart() {
  const chartWidth = SCREEN_WIDTH - 72;
  const chartHeight = 160;
  const paddingLeft = 25;
  const paddingRight = 10;
  const paddingTop = 15;
  const paddingBottom = 20;

  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  const points = weeklyData.map((d, i) => {
    const x = paddingLeft + (i * graphWidth) / (weeklyData.length - 1);
    const y = paddingTop + graphHeight - (d.score / 10) * graphHeight;
    return { x, y, score: d.score, name: d.name };
  });

  // Generate Area SVG Path
  let areaPath = "";
  let linePath = "";
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    areaPath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      linePath += ` L ${points[i].x} ${points[i].y}`;
      areaPath += ` L ${points[i].x} ${points[i].y}`;
    }
    areaPath += ` L ${points[points.length - 1].x} ${paddingTop + graphHeight} L ${points[0].x} ${paddingTop + graphHeight} Z`;
  }

  return (
    <View style={{ height: chartHeight, width: '100%' }}>
      <Svg width={chartWidth} height={chartHeight}>
        <Defs>
          <SvgLinearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
            <Stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
          </SvgLinearGradient>
        </Defs>

        {/* Horizontal Gridlines */}
        {[0, 2, 4, 6, 8, 10].map((val) => {
          const y = paddingTop + graphHeight - (val / 10) * graphHeight;
          return (
            <React.Fragment key={val}>
              <Line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1.5"
              />
              <SvgText
                x={paddingLeft - 6}
                y={y + 3}
                fontSize="9"
                fill="#94a3b8"
                fontWeight="700"
                textAnchor="end"
              >
                {val}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Area Path */}
        {areaPath ? <Path d={areaPath} fill="url(#chartGrad)" /> : null}

        {/* Line Path */}
        {linePath ? (
          <Path
            d={linePath}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        ) : null}

        {/* Data points */}
        {points.map((p, i) => (
          <React.Fragment key={i}>
            <Circle
              cx={p.x}
              cy={p.y}
              r="4.5"
              fill="#fff"
              stroke="#8b5cf6"
              strokeWidth="2.5"
            />
            <SvgText
              x={p.x}
              y={paddingTop + graphHeight + 14}
              fontSize="9"
              fontWeight="900"
              fill="#94a3b8"
              textAnchor="middle"
            >
              {p.name}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}

function WellnessRadarChart() {
  const chartSize = SCREEN_WIDTH - 72;
  const chartHeight = 175;
  const CX = chartSize / 2;
  const CY = chartHeight / 2;
  const maxR = 60;

  const vertices = radarData.map((d, i) => {
    const angle = i * (2 * Math.PI) / 6 - Math.PI / 2;
    return {
      angle,
      subject: d.subject,
      val: d.value,
      xGridMax: CX + maxR * Math.cos(angle),
      yGridMax: CY + maxR * Math.sin(angle),
      xVal: CX + (d.value / 100) * maxR * Math.cos(angle),
      yVal: CY + (d.value / 100) * maxR * Math.sin(angle)
    };
  });

  // Concentric Hexagon Grid lines
  const gridLevels = [0.25, 0.5, 0.75, 1];

  let radarPolygonPoints = vertices.map(v => `${v.xVal},${v.yVal}`).join(" ");

  return (
    <View style={{ height: chartHeight, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={chartSize} height={chartHeight}>
        {/* Draw Web Grid lines */}
        {gridLevels.map((lvl, index) => {
          const levelPoints = vertices
            .map(v => {
              const r = lvl * maxR;
              const x = CX + r * Math.cos(v.angle);
              const y = CY + r * Math.sin(v.angle);
              return `${x},${y}`;
            })
            .join(" ");
          return (
            <Polygon
              key={index}
              points={levelPoints}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Draw Spokes */}
        {vertices.map((v, i) => (
          <Line
            key={i}
            x1={CX}
            y1={CY}
            x2={v.xGridMax}
            y2={v.yGridMax}
            stroke="#e2e8f0"
            strokeWidth="1.5"
          />
        ))}

        {/* Labeled Vertices */}
        {vertices.map((v, i) => {
          const offsetDist = maxR + 15;
          const labelX = CX + offsetDist * Math.cos(v.angle);
          const labelY = CY + offsetDist * Math.sin(v.angle);
          return (
            <SvgText
              key={i}
              x={labelX}
              y={labelY + 3}
              fontSize="9"
              fontWeight="900"
              fill="#64748b"
              textAnchor="middle"
            >
              {v.subject}
            </SvgText>
          );
        })}

        {/* Value Polygon Path */}
        {radarPolygonPoints ? (
          <Polygon
            points={radarPolygonPoints}
            fill="#8b5cf6"
            fillOpacity="0.25"
            stroke="#8b5cf6"
            strokeWidth="2.5"
          />
        ) : null}
      </Svg>
    </View>
  );
}

function WeeklyAttendanceBarChart() {
  const chartWidth = SCREEN_WIDTH - 72;
  const chartHeight = 130;
  const paddingLeft = 25;
  const paddingRight = 10;
  const paddingTop = 10;
  const paddingBottom = 15;

  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  const maxVal = 4;
  const barWidth = 9;

  return (
    <View style={{ height: chartHeight, width: '100%' }}>
      <Svg width={chartWidth} height={chartHeight}>
        {/* Horizontal grids */}
        {[0, 1, 2, 3, 4].map((val) => {
          const y = paddingTop + graphHeight - (val / maxVal) * graphHeight;
          return (
            <React.Fragment key={val}>
              <Line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1.5"
              />
              <SvgText
                x={paddingLeft - 6}
                y={y + 3}
                fontSize="9"
                fill="#94a3b8"
                fontWeight="700"
                textAnchor="end"
              >
                {val}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Side-by-side bars per day */}
        {weeklyData.map((d, i) => {
          const groupCenterX = paddingLeft + (i * graphWidth) / (weeklyData.length - 1) + 4;
          
          // Present Bar (purple)
          const pBarHeight = (d.present / maxVal) * graphHeight;
          const pBarX = groupCenterX - barWidth - 2;
          const pBarY = paddingTop + graphHeight - pBarHeight;

          // Absent Bar (light red)
          const aBarHeight = (d.absent / maxVal) * graphHeight;
          const aBarX = groupCenterX + 2;
          const aBarY = paddingTop + graphHeight - aBarHeight;

          return (
            <React.Fragment key={i}>
              {/* Present Bar */}
              {d.present > 0 && (
                <Rect
                  x={pBarX}
                  y={pBarY}
                  width={barWidth}
                  height={pBarHeight}
                  fill="#8b5cf6"
                  rx="3.5"
                  ry="3.5"
                />
              )}

              {/* Absent Bar */}
              {d.absent > 0 && (
                <Rect
                  x={aBarX}
                  y={aBarY}
                  width={barWidth}
                  height={aBarHeight}
                  fill="#fca5a5"
                  rx="3.5"
                  ry="3.5"
                />
              )}

              {/* X Axis label */}
              <SvgText
                x={groupCenterX}
                y={paddingTop + graphHeight + 13}
                fontSize="9"
                fontWeight="900"
                fill="#94a3b8"
                textAnchor="middle"
              >
                {d.name}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

// Custom responsive wrapper
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

export default function AdminDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [classCount, setClassCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeInsight, setActiveInsight] = useState(0);
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
    const poll = setInterval(fetchAll, 5000);

    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          timeZone: "America/New_York",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        })
      );
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          timeZone: "America/New_York",
          weekday: "short",
          month: "short",
          day: "numeric"
        }).toUpperCase()
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);

    return () => {
      clearInterval(poll);
      clearInterval(timer);
    };
  }, []);

  // Cycle insights automatically
  useEffect(() => {
    const cycle = setInterval(() => {
      setActiveInsight((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(cycle);
  }, []);

  const totalStudents = students.length;
  const checkedInToday = students.filter(s =>
    s.timeline?.some((e: any) => e.day === "Today" || e.date === getUSATodayDateStr())
  ).length;
  const absentCount = totalStudents - checkedInToday;
  const riskCount = students.filter(s => s.risk !== "Stable" && s.risk !== undefined).length;

  const avgMoodRaw = students.length > 0
    ? (students.reduce((acc, s) => {
        const todayEntry = s.timeline?.find((e: any) => e.day === "Today" || e.date === getUSATodayDateStr());
        return acc + (todayEntry ? todayEntry.score : 7);
      }, 0) / students.length)
    : 0;
  const avgMood = avgMoodRaw > 0 ? avgMoodRaw.toFixed(1) : "7.2";

  // Checkins mapped for live board feeds
  const liveCheckins = students.map(s => {
    const todayEntry = s.timeline?.find((e: any) => e.day === "Today" || e.date === getUSATodayDateStr());
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
      initial: s.firstName ? s.firstName[0] : 'S'
    };
  });

  const moodCounts = students.reduce(
    (acc, s) => {
      const todayEntry = s.timeline?.find((e: any) => e.day === "Today" || e.date === getUSATodayDateStr());
      const score = todayEntry ? todayEntry.score : 7;
      if (score >= 8) acc.happy++;
      else if (score >= 5) acc.neutral++;
      else acc.sad++;
      return acc;
    },
    { happy: 0, neutral: 0, sad: 0 }
  );

  const aiInsights = [
    {
      text: `${totalStudents} students enrolled. ${checkedInToday} checked in active.`,
      Icon: BarChart2,
      colors: ['#3b82f6', '#06b6d4']
    },
    {
      text: riskCount > 0
        ? `${riskCount} student(s) need emotional attention right now.`
        : "All students checked in report stable wellbeing!",
      Icon: riskCount > 0 ? AlertTriangle : ShieldCheck,
      colors: riskCount > 0 ? ['#ef4444', '#f97316'] : ['#22c55e', '#14b8a6']
    },
    {
      text: `Average class mood score is ${avgMood}/10. Keep encouraging!`,
      Icon: SmilePlus,
      colors: ['#a855f7', '#ec4899']
    }
  ];

  const greeting = getGreeting();

  return (
    <View style={{ flex: 1, backgroundColor: '#fcfcfc' }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 110 }}>
        
        {/* Header matching Next.js design */}
        <MotiView
          from={{ opacity: 0, translateY: -15 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 24, fontWeight: '900', color: '#1e293b', letterSpacing: -0.6 }}>
                {greeting.text}, Teacher
              </Text>
              <greeting.Icon size={24} color={greeting.color} />
            </View>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748b', marginTop: 3 }}>
              Here is the emotional wellness summary for today.
            </Text>
          </View>
        </MotiView>

        {/* Live Clock / Date Component */}
        <View style={styles.dateTimeContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Calendar size={13} color="#94a3b8" />
            <Text style={{ fontSize: 11, fontWeight: '900', color: '#94a3b8', letterSpacing: 0.8 }}>{currentDate}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Clock size={15} color="#1e293b" />
            <Text style={{ fontSize: 21, fontWeight: '900', color: '#1e293b', fontVariant: ['tabular-nums'] }}>{currentTime}</Text>
          </View>
        </View>

        {/* Animated AI Insight banner */}
        <MotiView
          animate={{ scale: 1 }}
          transition={{ type: 'spring' } as any}
          style={{ marginBottom: 18, overflow: 'hidden', borderRadius: 20 }}
        >
          <LinearGradient
            colors={aiInsights[activeInsight].colors as any}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.aiInsightContainer}
          >
            <View style={styles.aiIconWrapper}>
              {(() => {
                const IconComponent = aiInsights[activeInsight].Icon;
                return <IconComponent color="#fff" size={20} />;
              })()}
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                <Bot color="#fff" size={13} style={{ opacity: 0.8 }} />
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '900', letterSpacing: 0.6 }}>
                  AI INSIGHT
                </Text>
              </View>
              <AnimatePresence>
                <MotiView
                  key={activeInsight}
                  from={{ opacity: 0, translateY: 6 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: -6 }}
                  transition={{ type: 'timing', duration: 300 } as any}
                >
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '800', lineHeight: 18 }}>
                    {aiInsights[activeInsight].text}
                  </Text>
                </MotiView>
              </AnimatePresence>
            </View>
            <View style={{ flexDirection: 'row', gap: 3.5 }}>
              {aiInsights.map((_, idx) => (
                <View
                  key={idx}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: idx === activeInsight ? '#fff' : 'rgba(255,255,255,0.35)'
                  }}
                />
              ))}
            </View>
          </LinearGradient>
        </MotiView>

        {/* Premium Stat Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
          
          {/* Card 1: Total Students */}
          <Touchable onPress={() => setActiveModal("total")} style={{ width: (SCREEN_WIDTH - 48) / 2 }}>
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
          </Touchable>

          {/* Card 2: Classes */}
          <Touchable onPress={() => setActiveModal("classes")} style={{ width: (SCREEN_WIDTH - 48) / 2 }}>
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
          </Touchable>

          {/* Card 3: Present */}
          <Touchable onPress={() => setActiveModal("present")} style={{ width: (SCREEN_WIDTH - 48) / 2 }}>
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
          </Touchable>

          {/* Card 4: Mood */}
          <Touchable onPress={() => setActiveModal("mood")} style={{ width: (SCREEN_WIDTH - 48) / 2 }}>
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
          </Touchable>

          {/* Card 5: Active Wellness Alerts */}
          <Touchable onPress={() => setActiveModal("wellness")} style={{ width: SCREEN_WIDTH - 36 }}>
            <LinearGradient
              colors={riskCount > 0 ? ['#ef4444', '#b91c1c'] : ['#22c55e', '#15803d']}
              style={[styles.statCard, { paddingVertical: 14 }]}
            >
              <View style={styles.statHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={15} color="#fff" />
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 }}>
                    WELLNESS TRACKER
                  </Text>
                </View>
                <ArrowRight size={12} color="rgba(255,255,255,0.75)" />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <View>
                  <Text style={styles.statValue}>{riskCount}</Text>
                  <Text style={styles.statTitle}>Active Wellness Alerts</Text>
                </View>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>
                    {riskCount > 0 ? "Needs Review ⚠️" : "All Healthy Shield"}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Touchable>

        </View>

        {/* ── CHARTS SECTIONS ── */}
        
        {/* 1. Class Emotional Trend SVG Chart */}
        <View style={styles.cardSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View>
              <Text style={styles.sectionTitle}>Class Emotional Trend</Text>
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#94a3b8', marginTop: 1 }}>
                Weekly average mood scores
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#faf5ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#a855f7' }} />
              <Text style={{ color: '#a855f7', fontSize: 10, fontWeight: '900' }}>LIVE</Text>
            </View>
          </View>
          <ClassEmotionalTrendChart />
        </View>

        {/* 2. Wellness Radar Chart */}
        <View style={styles.cardSection}>
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.sectionTitle}>Wellness Radar</Text>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#94a3b8', marginTop: 1 }}>
              Class-wide emotional balance
            </Text>
          </View>
          <WellnessRadarChart />
        </View>

        {/* 3. Weekly Attendance Bar Chart */}
        <View style={styles.cardSection}>
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.sectionTitle}>Weekly Attendance</Text>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#94a3b8', marginTop: 1 }}>
              Present vs Absent per day
            </Text>
          </View>
          <WeeklyAttendanceBarChart />
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 10, paddingLeft: 25 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: '#8b5cf6' }} />
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748b' }}>Present</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: '#fca5a5' }} />
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748b' }}>Absent</Text>
            </View>
          </View>
        </View>

        {/* Mood Distribution Progress Bars */}
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

        {/* Student Wellness Board (Live Students list) */}
        <View style={styles.cardSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.sectionTitle}>Student Wellness Board</Text>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#94a3b8' }}>
              {totalStudents} enrolled
            </Text>
          </View>

          {isLoading ? (
            <ActivityIndicator size="small" color="#9333ea" style={{ padding: 20 }} />
          ) : (
            <View style={{ gap: 8 }}>
              {liveCheckins.map((student) => (
                <View key={student.id} style={styles.checkinRow}>
                  <View style={styles.initialBadge}>
                    {student.profilePhoto ? (
                      <Image source={{ uri: student.profilePhoto }} style={{ width: 34, height: 34 }} />
                    ) : (
                      <Text style={{ fontSize: 12, fontWeight: '900', color: '#9333ea' }}>{student.initial}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 13, fontWeight: '900', color: '#1e293b' }}>
                        {student.name}
                      </Text>
                      <Text style={{ fontSize: 9, fontWeight: '700', color: '#94a3b8' }}>
                        #{student.roll}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 9, fontWeight: '700', color: '#94a3b8', marginTop: 1 }}>{student.class}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 16 }}>{student.emoji}</Text>
                    {student.checkedIn ? (
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '900',
                          color: student.score >= 8 ? '#22c55e' : student.score >= 5 ? '#f59e0b' : '#ef4444'
                        }}
                      >
                        {student.score}/10
                      </Text>
                    ) : (
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#cbd5e1' }}>—</Text>
                    )}
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: student.risk === 'Stable'
                            ? 'rgba(34, 197, 94, 0.1)'
                            : student.risk === 'Needs Attention'
                              ? 'rgba(245, 158, 11, 0.1)'
                              : 'rgba(239, 68, 68, 0.1)',
                          width: 22,
                          height: 22,
                          borderRadius: 11,
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingHorizontal: 0,
                          paddingVertical: 0
                        }
                      ]}
                    >
                      {student.risk === 'Stable' ? (
                        <ShieldCheck size={11} color="#22c55e" />
                      ) : (
                        <ShieldAlert size={11} color={student.risk === 'Needs Attention' ? '#f59e0b' : '#ef4444'} />
                      )}
                    </View>
                  </View>
                </View>
              ))}

              {liveCheckins.length === 0 && (
                <Text style={{ textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', paddingVertical: 15 }}>
                  No students registered in roster.
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Quick Actions Panel */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={{ gap: 8, marginTop: 12 }}>
            {[
              { label: "View All Students", icon: Users, color: "text-purple-600 bg-purple-50", iconColor: "#9333ea" },
              { label: "Attendance Center", icon: Calendar, color: "text-blue-600 bg-blue-50", iconColor: "#2563eb" },
              { label: "Smart Alerts Tracker", icon: Bell, color: "text-red-600 bg-red-50", iconColor: "#ef4444" },
            ].map((action, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: i < 2 ? 1 : 0, borderBottomColor: '#f1f5f9' }}>
                <View style={[styles.avatarRound, { backgroundColor: action.iconColor + '10', width: 34, height: 34, borderRadius: 10 }]}>
                  <action.icon size={16} color={action.iconColor} />
                </View>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#334155', marginLeft: 12, flex: 1 }}>
                  {action.label}
                </Text>
                <ArrowRight size={13} color="#94a3b8" />
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* --- STAT DETAILS MODAL OVERLAYS --- */}
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
                        {s.profilePhoto ? <Image source={{ uri: s.profilePhoto }} style={{ width: 36, height: 36 }} /> : <Text style={{ fontSize: 13, fontWeight: '900', color: '#9333ea' }}>{s.firstName[0]}</Text>}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '900', color: '#1e293b' }}>{s.firstName} {s.lastInitial || ''}</Text>
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
                        <Text style={{ fontSize: 14, fontWeight: '900', color: '#1e293b' }}>{s.name}</Text>
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
                          <Text style={{ fontSize: 13, fontWeight: '900', color: '#1e293b' }}>{s.name} ({s.emoji})</Text>
                          <Text style={{ fontSize: 12, fontWeight: '900', color: score >= 8 ? '#22c55e' : score >= 5 ? '#f59e0b' : '#ef4444' }}>
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
                    const todayEntry = s.timeline?.find((e: any) => e.day === "Today" || e.date === getUSATodayDateStr());
                    return (
                      <View key={s.rollNumber} style={[styles.modalListCard, { flexDirection: 'column', alignItems: 'stretch', borderColor: '#fecaca', borderWidth: 1, padding: 14 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <View style={styles.avatarRound}>
                            {s.profilePhoto ? <Image source={{ uri: s.profilePhoto }} style={{ width: 36, height: 36 }} /> : <Text style={{ fontSize: 13, fontWeight: '800', color: '#ef4444' }}>{s.firstName[0]}</Text>}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: '900', color: '#1e293b' }}>{s.firstName} {s.lastInitial || ''}</Text>
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
                        <Text style={{ fontSize: 14, fontWeight: '900', color: '#1e293b' }}>{cls.name}</Text>
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
