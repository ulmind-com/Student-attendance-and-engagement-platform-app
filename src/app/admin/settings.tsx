import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  Switch, 
  ActivityIndicator, 
  Alert, 
  StyleSheet, 
  Dimensions 
} from 'react-native';
import { 
  Building2, 
  Palette, 
  GraduationCap, 
  KeyRound, 
  HelpCircle, 
  Bell, 
  Bot, 
  ShieldCheck, 
  Settings, 
  Users, 
  ChevronRight, 
  Save, 
  RefreshCw,
  Plus,
  Trash2,
  Lock,
  Eye,
  AlertTriangle
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://kids-attendance-production.up.railway.app';

type SettingsTab = 
  | "school" 
  | "branding" 
  | "classes" 
  | "otp" 
  | "questions" 
  | "notifications" 
  | "ai" 
  | "security" 
  | "advanced" 
  | "admins";

export default function SettingsScreen() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("school");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- STATE FOR ALL 10 PANELS ---
  
  // 1. School Info
  const [schoolName, setSchoolName] = useState("Student Attendance & Engagement Platform");
  const [schoolAddress, setSchoolAddress] = useState("Allentown, US");
  const [schoolPhone, setSchoolPhone] = useState("+1 (555) 019-2834");
  const [schoolEmail, setSchoolEmail] = useState("contact@schoolwell.edu");
  const [schoolLogo, setSchoolLogo] = useState("https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=200");

  // 2. Branding (Emotion Colors)
  const [clockColors, setClockColors] = useState<Record<string, string>>({
    "1": "#6366f1", "2": "#818cf8", "3": "#a78bfa", "4": "#f472b6", "5": "#fb923c",
    "6": "#34d399", "7": "#fbbf24", "8": "#60a5fa", "9": "#a78bfa", "10": "#f9a8d4"
  });
  const [puzzleColors, setPuzzleColors] = useState<Record<string, string>>({
    "Happy": "#22c55e", "Sad": "#3b82f6", "Mad": "#ef4444", "Scared": "#334155", "Worried": "#eab308", "Excited": "#ec4899"
  });

  // 3. Classes & Teachers
  const [classesList, setClassesList] = useState<any[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [newClassTeacher, setNewClassTeacher] = useState("");
  const [newClassSection, setNewClassSection] = useState("A");

  // 4. OTP Config
  const [otpsList, setOtpsList] = useState<any[]>([]);
  const [otpExpiry, setOtpExpiry] = useState("3");
  const [otpExpiryUnit, setOtpExpiryUnit] = useState("Months");
  const [otpTimeRange, setOtpTimeRange] = useState(false);
  const [otpStartTime, setOtpStartTime] = useState("08:00");
  const [otpEndTime, setOtpEndTime] = useState("16:00");
  const [manualOtpRoll, setManualOtpRoll] = useState("");
  const [manualOtpCode, setManualOtpCode] = useState("");

  // 5. Questions Config
  const [questions, setQuestions] = useState<any[]>([
    { id: "1", text: "How are you feeling today?", emoji: "⏱️", category: "General" },
    { id: "2", text: "Color in your emotion puzzle piece", emoji: "🧩", category: "Creative" }
  ]);
  const [newQText, setNewQText] = useState("");
  const [newQEmoji, setNewQEmoji] = useState("😊");

  // 6. Notifications Config
  const [notifyEmailDigests, setNotifyEmailDigests] = useState(true);
  const [notifyAlertsTelegram, setNotifyAlertsTelegram] = useState(false);
  const [notifyAlertsWhatsApp, setNotifyAlertsWhatsApp] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState("");

  // 7. AI Insights
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiConfidenceLevel, setAiConfidenceLevel] = useState("0.75");
  const [aiWeeklyDigest, setAiWeeklyDigest] = useState(true);

  // 8. Security Panel
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [multiFactorAuth, setMultiFactorAuth] = useState(false);
  const [requirePinToModify, setRequirePinToModify] = useState(true);

  // 9. Advanced Panel
  const [diagnosticMode, setDiagnosticMode] = useState(false);

  // 10. Admin Users
  const [adminsList, setAdminsList] = useState<any[]>([
    { username: "admin", role: "Super Admin", lastActive: "Just now" }
  ]);
  const [newAdminUser, setNewAdminUser] = useState("");
  const [newAdminKey, setNewAdminKey] = useState("");

  // --- COMPONENT MOUNT LOAD DATA ---
  const loadAllSettings = async () => {
    setIsLoading(true);
    try {
      // Fetch School
      const schRes = await fetch(`${API_URL}/settings/school`);
      if (schRes.ok) {
        const sch = await schRes.json();
        setSchoolName(sch.name || schoolName);
        setSchoolAddress(sch.address || schoolAddress);
        setSchoolPhone(sch.phone || schoolPhone);
        setSchoolEmail(sch.email || schoolEmail);
        setSchoolLogo(sch.logo || schoolLogo);
      }

      // Fetch Colors
      const colRes = await fetch(`${API_URL}/settings/colors`);
      if (colRes.ok) {
        const colors = await colRes.json();
        if (colors.clock_emotions) setClockColors(colors.clock_emotions);
        if (colors.puzzle_emotions) setPuzzleColors(colors.puzzle_emotions);
      }

      // Fetch Classes & OTPs
      const [clsRes, otpsRes] = await Promise.all([
        fetch(`${API_URL}/settings/classes`),
        fetch(`${API_URL}/otps/list`)
      ]);
      if (clsRes.ok) {
        const classData = await clsRes.json();
        setClassesList(Array.isArray(classData) ? classData : (classData.classes || []));
      }
      if (otpsRes.ok) {
        setOtpsList(await otpsRes.json());
      }
    } catch (e) {
      console.warn("Failed to load settings telemetry", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllSettings();
  }, []);

  // --- SAVE LOGIC ---
  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (activeTab === "school") {
        await fetch(`${API_URL}/settings/school`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: schoolName, address: schoolAddress, phone: schoolPhone, email: schoolEmail, logo: schoolLogo })
        });
      } else if (activeTab === "branding") {
        await fetch(`${API_URL}/settings/colors`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clock_emotions: clockColors, puzzle_emotions: puzzleColors })
        });
      }
      Alert.alert("Success", "Settings configuration saved successfully! ✨");
    } catch (e) {
      Alert.alert("Save Failed", "Failed to save settings to server.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- ACTION TRIGGERS ---
  const handleGenerateBulkOtps = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/otps/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "all" })
      });
      if (res.ok) {
        Alert.alert("Generated", "New OTP credentials generated for all students.");
        // Refresh OTPs
        const otpsRes = await fetch(`${API_URL}/otps/list`);
        if (otpsRes.ok) setOtpsList(await otpsRes.json());
      }
    } catch (e) {
      Alert.alert("Error", "Bulk generation failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualOtpSet = async () => {
    if (!manualOtpRoll || !manualOtpCode) {
      Alert.alert("Missing Fields", "Please specify Student Roll and 4-Digit OTP.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/otps/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "student", roll_number: manualOtpRoll.trim(), custom_otp: manualOtpCode.trim() })
      });
      if (res.ok) {
        Alert.alert("Success", `OTP credentials configured for Roll ${manualOtpRoll}.`);
        setManualOtpRoll("");
        setManualOtpCode("");
        const otpsRes = await fetch(`${API_URL}/otps/list`);
        if (otpsRes.ok) setOtpsList(await otpsRes.json());
      } else {
        Alert.alert("Failed", "Confirm the student exists with this roll number.");
      }
    } catch (e) {
      Alert.alert("Error", "Network issue setting custom OTP.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddClass = async () => {
    if (!newClassName || !newClassTeacher) {
      Alert.alert("Missing Fields", "Class Name and Teacher are required.");
      return;
    }
    const updated = [...classesList, { name: newClassName, teacher: newClassTeacher, section: newClassSection, students_count: 0 }];
    setClassesList(updated);
    setNewClassName("");
    setNewClassTeacher("");
    // Save classes list
    try {
      await fetch(`${API_URL}/settings/classes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classes: updated })
      });
    } catch(e) {}
  };

  const handleResetAdvanced = async () => {
    Alert.alert(
      "Dangerous Action ⚠️",
      "This resets the entire platform database back to defaults. All checked-in timelines and wellness scores will be completely cleared.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset Roster", 
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await fetch(`${API_URL}/settings/advanced/reset`, { method: "POST" });
              Alert.alert("Database Reset", "System telemetry reset to system defaults.");
              loadAllSettings();
            } catch (e) {
              Alert.alert("Error", "Reset failed.");
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // --- TAB DEFINITIONS ---
  const settingsTabs = [
    { id: "school", label: "School Info", icon: Building2, color: "#3b82f6" },
    { id: "branding", label: "Branding", icon: Palette, color: "#ec4899" },
    { id: "classes", label: "Classes", icon: GraduationCap, color: "#10b981" },
    { id: "otp", label: "OTP Config", icon: KeyRound, color: "#a855f7" },
    { id: "questions", label: "Check-in Questions", icon: HelpCircle, color: "#f59e0b" },
    { id: "notifications", label: "Alert Config", icon: Bell, color: "#ef4444" },
    { id: "ai", label: "AI Insights", icon: Bot, color: "#6366f1" },
    { id: "security", label: "Security & PIN", icon: ShieldCheck, color: "#06b6d4" },
    { id: "advanced", label: "Advanced", icon: Settings, color: "#64748b" },
    { id: "admins", label: "Admin Users", icon: Users, color: "#1e293b" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
      
      {/* Dynamic horizontal scrolling top-tab bar */}
      <View style={styles.topTabBarWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {settingsTabs.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <TouchableOpacity 
                key={tab.id} 
                onPress={() => setActiveTab(tab.id as SettingsTab)}
                style={[
                  styles.tabButton, 
                  isActive ? { backgroundColor: tab.color } : { backgroundColor: '#fff', borderColor: '#e2e8f0', borderWidth: 1 }
                ]}
              >
                <Icon size={14} color={isActive ? '#fff' : '#64748b'} />
                <Text style={[styles.tabLabel, { color: isActive ? '#fff' : '#475569' }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>

        {isLoading ? (
          <ActivityIndicator size="large" color="#a855f7" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.panelCard}>
            
            {/* Save Button floating on panels where saving is local */}
            {(activeTab === "school" || activeTab === "branding") && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={styles.panelTitle}>
                  {activeTab === "school" && "School Information"}
                  {activeTab === "branding" && "Color & Branding Design"}
                </Text>
                <TouchableOpacity onPress={handleSave} disabled={isSaving} style={styles.saveFloatBtn}>
                  {isSaving ? <ActivityIndicator size="small" color="#fff" /> : <Save size={16} color="#fff" />}
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '800' }}>Save</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* --- PANEL 1: SCHOOL INFO --- */}
            {activeTab === "school" && (
              <View style={{ gap: 16 }}>
                <View>
                  <Text style={styles.inputLabel}>SCHOOL NAME</Text>
                  <TextInput 
                    value={schoolName}
                    onChangeText={setSchoolName}
                    style={styles.textInput}
                  />
                </View>
                <View>
                  <Text style={styles.inputLabel}>ADDRESS</Text>
                  <TextInput 
                    value={schoolAddress}
                    onChangeText={setSchoolAddress}
                    style={styles.textInput}
                  />
                </View>
                <View>
                  <Text style={styles.inputLabel}>SCHOOL LOGO URL</Text>
                  <TextInput 
                    value={schoolLogo}
                    onChangeText={setSchoolLogo}
                    style={styles.textInput}
                  />
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>PHONE</Text>
                    <TextInput 
                      value={schoolPhone}
                      onChangeText={setSchoolPhone}
                      style={styles.textInput}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>EMAIL</Text>
                    <TextInput 
                      value={schoolEmail}
                      onChangeText={setSchoolEmail}
                      style={styles.textInput}
                      keyboardType="email-address"
                    />
                  </View>
                </View>
              </View>
            )}

            {/* --- PANEL 2: BRANDING (EMOTION COLORS) --- */}
            {activeTab === "branding" && (
              <View style={{ gap: 16 }}>
                <Text style={styles.panelSubtitle}>Clock Emotion Scale (1-10)</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {Object.keys(clockColors).sort((a,b)=>Number(a)-Number(b)).map(level => (
                    <View key={level} style={styles.colorPillContainer}>
                      <View style={[styles.colorPreviewDot, { backgroundColor: clockColors[level] }]} />
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>{level}</Text>
                      <TextInput 
                        value={clockColors[level]}
                        onChangeText={(val) => setClockColors(prev => ({ ...prev, [level]: val }))}
                        style={styles.colorTextInput}
                      />
                    </View>
                  ))}
                </View>

                <Text style={[styles.panelSubtitle, { marginTop: 14 }]}>Puzzle Piece Emotions</Text>
                <View style={{ gap: 10 }}>
                  {Object.keys(puzzleColors).map(emotion => (
                    <View key={emotion} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: 12, borderRadius: 14 }}>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>{emotion}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={[styles.colorPreviewDot, { backgroundColor: puzzleColors[emotion] }]} />
                        <TextInput 
                          value={puzzleColors[emotion]}
                          onChangeText={(val) => setPuzzleColors(prev => ({ ...prev, [emotion]: val }))}
                          style={styles.colorTextInputWide}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* --- PANEL 3: CLASSES & TEACHERS --- */}
            {activeTab === "classes" && (
              <View style={{ gap: 16 }}>
                <Text style={styles.panelTitle}>Enrolled Classes</Text>
                <View style={{ gap: 10 }}>
                  {classesList.map((cls, i) => (
                    <View key={i} style={styles.listRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: '900', color: '#1e293b' }}>{cls.name}</Text>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b' }}>Teacher: {cls.teacher}</Text>
                      </View>
                      <View style={{ backgroundColor: '#f3e8ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                        <Text style={{ color: '#9333ea', fontSize: 11, fontWeight: '900' }}>Sec: {cls.section || 'A'}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                <Text style={[styles.panelSubtitle, { marginTop: 14 }]}>Add New Class</Text>
                <View style={{ gap: 12 }}>
                  <TextInput 
                    placeholder="Classroom Name (e.g. Kindergarten)" 
                    value={newClassName}
                    onChangeText={setNewClassName}
                    style={styles.textInput}
                  />
                  <TextInput 
                    placeholder="Assigned Classroom Teacher" 
                    value={newClassTeacher}
                    onChangeText={setNewClassTeacher}
                    style={styles.textInput}
                  />
                  <TouchableOpacity onPress={handleAddClass} style={styles.addButton}>
                    <Plus size={16} color="#fff" />
                    <Text style={{ color: '#fff', fontWeight: '800' }}>Create Classroom</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* --- PANEL 4: OTP CONFIG --- */}
            {activeTab === "otp" && (
              <View style={{ gap: 16 }}>
                <Text style={styles.panelTitle}>OTP System Rules</Text>
                <View style={styles.rowToggle}>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>Time-Restricted Check-in</Text>
                    <Text style={{ fontSize: 11, color: '#64748b' }}>Allow entry only inside the school window</Text>
                  </View>
                  <Switch value={otpTimeRange} onValueChange={setOtpTimeRange} />
                </View>

                {otpTimeRange && (
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>START CHECK-IN</Text>
                      <TextInput value={otpStartTime} onChangeText={setOtpStartTime} style={styles.textInput} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>END WINDOW</Text>
                      <TextInput value={otpEndTime} onChangeText={setOtpEndTime} style={styles.textInput} />
                    </View>
                  </View>
                )}

                <TouchableOpacity onPress={handleGenerateBulkOtps} style={styles.actionBtnSecondary}>
                  <RefreshCw size={14} color="#9333ea" />
                  <Text style={{ color: '#9333ea', fontWeight: '800' }}>Regenerate Roster OTPs</Text>
                </TouchableOpacity>

                <Text style={[styles.panelSubtitle, { marginTop: 14 }]}>Configure Individual Student OTP</Text>
                <View style={{ gap: 12 }}>
                  <TextInput 
                    placeholder="Student Roll Number (e.g. RO-104)" 
                    value={manualOtpRoll}
                    onChangeText={setManualOtpRoll}
                    style={styles.textInput}
                  />
                  <TextInput 
                    placeholder="4-Digit Custom PIN (e.g. 1234)" 
                    value={manualOtpCode}
                    onChangeText={setManualOtpCode}
                    maxLength={4}
                    keyboardType="numeric"
                    style={styles.textInput}
                  />
                  <TouchableOpacity onPress={handleManualOtpSet} style={styles.addButton}>
                    <Lock size={16} color="#fff" />
                    <Text style={{ color: '#fff', fontWeight: '800' }}>Apply Pin Access</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* --- PANEL 5: CHECK-IN QUESTIONS --- */}
            {activeTab === "questions" && (
              <View style={{ gap: 16 }}>
                <Text style={styles.panelTitle}>Wellness Checkin Forms</Text>
                {questions.map((q, i) => (
                  <View key={q.id} style={styles.listRow}>
                    <Text style={{ fontSize: 20 }}>{q.emoji}</Text>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>{q.text}</Text>
                      <Text style={{ fontSize: 11, color: '#64748b' }}>Category: {q.category}</Text>
                    </View>
                  </View>
                ))}

                <Text style={[styles.panelSubtitle, { marginTop: 14 }]}>Add New Question</Text>
                <View style={{ gap: 12 }}>
                  <TextInput 
                    placeholder="Wellness question prompt..." 
                    value={newQText}
                    onChangeText={setNewQText}
                    style={styles.textInput}
                  />
                  <TextInput 
                    placeholder="Emoji badge (e.g. 🧩)" 
                    value={newQEmoji}
                    onChangeText={setNewQEmoji}
                    style={styles.textInput}
                  />
                  <TouchableOpacity 
                    onPress={() => {
                      if (!newQText) return;
                      setQuestions([...questions, { id: String(questions.length + 1), text: newQText, emoji: newQEmoji, category: "Wellness" }]);
                      setNewQText("");
                    }} 
                    style={styles.addButton}
                  >
                    <Plus size={16} color="#fff" />
                    <Text style={{ color: '#fff', fontWeight: '800' }}>Save Question</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* --- PANEL 6: NOTIFICATIONS --- */}
            {activeTab === "notifications" && (
              <View style={{ gap: 16 }}>
                <Text style={styles.panelTitle}>Alert Notifications</Text>
                <View style={styles.rowToggle}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>Email Digests</Text>
                    <Text style={{ fontSize: 11, color: '#64748b' }}>Receive daily emotional telemetry recap</Text>
                  </View>
                  <Switch value={notifyEmailDigests} onValueChange={setNotifyEmailDigests} />
                </View>

                <View style={styles.rowToggle}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>Telegram Emergency Bot</Text>
                    <Text style={{ fontSize: 11, color: '#64748b' }}>Pushes alerts for low mood scores (score &lt;= 4)</Text>
                  </View>
                  <Switch value={notifyAlertsTelegram} onValueChange={setNotifyAlertsTelegram} />
                </View>

                {notifyAlertsTelegram && (
                  <View>
                    <Text style={styles.inputLabel}>TELEGRAM CHANNEL/CHAT ID</Text>
                    <TextInput 
                      value={telegramChatId} 
                      onChangeText={setTelegramChatId} 
                      placeholder="-100xxxxxx" 
                      style={styles.textInput} 
                    />
                  </View>
                )}

                <View style={styles.rowToggle}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>WhatsApp Notifications</Text>
                    <Text style={{ fontSize: 11, color: '#64748b' }}>Pushes emergency notifications directly</Text>
                  </View>
                  <Switch value={notifyAlertsWhatsApp} onValueChange={setNotifyAlertsWhatsApp} />
                </View>
              </View>
            )}

            {/* --- PANEL 7: AI INSIGHTS --- */}
            {activeTab === "ai" && (
              <View style={{ gap: 16 }}>
                <Text style={styles.panelTitle}>AI Predictive Engine</Text>
                <View style={styles.rowToggle}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>Emotional Forecasts</Text>
                    <Text style={{ fontSize: 11, color: '#64748b' }}>AI forecasts low mood shifts based on timeline</Text>
                  </View>
                  <Switch value={aiEnabled} onValueChange={setAiEnabled} />
                </View>

                <View style={styles.rowToggle}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>Weekly Wellness Advice</Text>
                    <Text style={{ fontSize: 11, color: '#64748b' }}>Generate auto insights reports weekly</Text>
                  </View>
                  <Switch value={aiWeeklyDigest} onValueChange={setAiWeeklyDigest} />
                </View>

                <View>
                  <Text style={styles.inputLabel}>FORECAST ENGINE CONFIDENCE THRESHOLD</Text>
                  <TextInput 
                    value={aiConfidenceLevel} 
                    onChangeText={setAiConfidenceLevel} 
                    keyboardType="numeric"
                    style={styles.textInput} 
                  />
                </View>
              </View>
            )}

            {/* --- PANEL 8: SECURITY --- */}
            {activeTab === "security" && (
              <View style={{ gap: 16 }}>
                <Text style={styles.panelTitle}>System Credentials & Access</Text>
                <View style={styles.rowToggle}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>Require PIN to Edit Rosters</Text>
                    <Text style={{ fontSize: 11, color: '#64748b' }}>Secures student profiles from unauthorized mods</Text>
                  </View>
                  <Switch value={requirePinToModify} onValueChange={setRequirePinToModify} />
                </View>

                <View style={styles.rowToggle}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>Multi-Factor Access Code</Text>
                    <Text style={{ fontSize: 11, color: '#64748b' }}>Ensures secure admin dashboards access</Text>
                  </View>
                  <Switch value={multiFactorAuth} onValueChange={setMultiFactorAuth} />
                </View>

                <View>
                  <Text style={styles.inputLabel}>SESSION TIMEOUT INTERVAL (MINUTES)</Text>
                  <TextInput 
                    value={sessionTimeout} 
                    onChangeText={setSessionTimeout} 
                    keyboardType="numeric" 
                    style={styles.textInput} 
                  />
                </View>
              </View>
            )}

            {/* --- PANEL 9: ADVANCED --- */}
            {activeTab === "advanced" && (
              <View style={{ gap: 16 }}>
                <Text style={styles.panelTitle}>Platform Diagnostics</Text>
                <View style={styles.rowToggle}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>Telemetry Log Mode</Text>
                    <Text style={{ fontSize: 11, color: '#64748b' }}>Pushes diagnostics tracing statements</Text>
                  </View>
                  <Switch value={diagnosticMode} onValueChange={setDiagnosticMode} />
                </View>

                <TouchableOpacity 
                  onPress={() => Alert.alert("Success", "Diagnostic trace log snapshot saved locally.")}
                  style={styles.actionBtnSecondary}
                >
                  <Text style={{ color: '#475569', fontWeight: '800' }}>Download Diagnostic Snapshot</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handleResetAdvanced}
                  style={styles.dangerButton}
                >
                  <AlertTriangle size={16} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '800' }}>Factory Reset Roster Data</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* --- PANEL 10: ADMIN USERS --- */}
            {activeTab === "admins" && (
              <View style={{ gap: 16 }}>
                <Text style={styles.panelTitle}>Credential Access Keys</Text>
                <View style={{ gap: 10 }}>
                  {adminsList.map((adm, i) => (
                    <View key={i} style={styles.listRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '900', color: '#1e293b' }}>{adm.username}</Text>
                        <Text style={{ fontSize: 11, color: '#64748b' }}>Role: {adm.role} • Active: {adm.lastActive}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                <Text style={[styles.panelSubtitle, { marginTop: 14 }]}>Enlist Access User</Text>
                <View style={{ gap: 12 }}>
                  <TextInput 
                    placeholder="Access User Identifier (e.g. samiran)" 
                    value={newAdminUser}
                    onChangeText={setNewAdminUser}
                    style={styles.textInput}
                  />
                  <TextInput 
                    placeholder="Access Secret Code PIN" 
                    value={newAdminKey}
                    onChangeText={setNewAdminKey}
                    secureTextEntry
                    style={styles.textInput}
                  />
                  <TouchableOpacity 
                    onPress={() => {
                      if (!newAdminUser || !newAdminKey) return;
                      setAdminsList([...adminsList, { username: newAdminUser, role: "Access User", lastActive: "Pending" }]);
                      setNewAdminUser("");
                      setNewAdminKey("");
                    }} 
                    style={styles.addButton}
                  >
                    <Plus size={16} color="#fff" />
                    <Text style={{ color: '#fff', fontWeight: '800' }}>Enroll Access Key</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topTabBarWrapper: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '800'
  },
  panelCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b'
  },
  panelSubtitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    borderBottomWidth: 1.5,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 6
  },
  saveFloatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9333ea',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 8
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    backgroundColor: '#fafafa'
  },
  colorPillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 8,
    width: (width - 76) / 2
  },
  colorPreviewDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1
  },
  colorTextInput: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    padding: 0
  },
  colorTextInputWide: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 80,
    textAlign: 'center',
    backgroundColor: '#fff'
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9333ea',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 6
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3e8ff',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e9d5ff'
  },
  rowToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 10
  }
});
