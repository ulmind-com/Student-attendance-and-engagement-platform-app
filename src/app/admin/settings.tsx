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
  Dimensions,
  Clipboard,
  Modal
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
  EyeOff,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Database,
  SlidersHorizontal,
  History,
  ListChecks,
  Copy,
  ExternalLink,
  Shield,
  Search,
  Sliders
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
  const [schoolName, setSchoolName] = useState("Pa'Lante Education Program");
  const [schoolAddress, setSchoolAddress] = useState("Allentown, US");
  const [schoolPhone, setSchoolPhone] = useState("8537861040");
  const [schoolEmail, setSchoolEmail] = useState("contact@ulmind.com");
  const [schoolWebsite, setSchoolWebsite] = useState("www.ulmind.com");
  const [schoolMotto, setSchoolMotto] = useState("Nurturing the whole child, one breath at a time");
  const [schoolThemeColor, setSchoolThemeColor] = useState("#cc8219");
  const [schoolLogo, setSchoolLogo] = useState("https://kids-attendance-production.up.railway.app/public/casa_logo.png");
  
  // Principal & Staff
  const [principalName, setPrincipalName] = useState("Jaime Escalante");
  const [principalPhoto, setPrincipalPhoto] = useState("");
  const [adminPhone, setAdminPhone] = useState("8537861040");
  const [emergencyPhone, setEmergencyPhone] = useState("8537861040");

  // 2. Branding (Emotion Colors)
  const [activeBrandingSubTab, setActiveBrandingSubTab] = useState<"scale" | "puzzle">("scale");
  const [clockColors, setClockColors] = useState<Record<string, string>>({
    "1": "#5c67f2", "2": "#7a85f4", "3": "#a78bfa", "4": "#f472b6", "5": "#fb923c",
    "6": "#10b981", "7": "#fbbf24", "8": "#60a5fa", "9": "#a78bfa", "10": "#f9a8d4"
  });
  const [puzzleColors, setPuzzleColors] = useState<Record<string, string>>({
    "Happy": "#10b981", "Sad": "#3b82f6", "Mad": "#ef4444", "Scared": "#334155", "Worried": "#eab308", "Excited": "#ec4899"
  });

  // 3. Classes & Teachers
  const [classesList, setClassesList] = useState<any[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [newClassTeacher, setNewClassTeacher] = useState("");
  const [newClassSection, setNewClassSection] = useState("A");

  // 4. OTP Settings Panel
  const [activeOtpSubTab, setActiveOtpSubTab] = useState<"manage" | "history">("manage");
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [otpHistory, setOtpHistory] = useState<any[]>([]);
  const [otpExpValue, setOtpExpValue] = useState(3);
  const [otpExpUnit, setOtpExpUnit] = useState("Months");
  const [otpTimeRangeEnabled, setOtpTimeRangeEnabled] = useState(false);
  const [otpStartTime, setOtpStartTime] = useState("08:00");
  const [otpEndTime, setOtpEndTime] = useState("16:00");
  
  const [selectedOtpClass, setSelectedOtpClass] = useState("All");
  const [selectedOtpSection, setSelectedOtpSection] = useState("All");
  const [otpSearchQuery, setOtpSearchQuery] = useState("");
  const [isOtpGenerating, setIsOtpGenerating] = useState(false);
  
  // Manual OTP fields
  const [manualOtpSearch, setManualOtpSearch] = useState("");
  const [selectedManualStudent, setSelectedManualStudent] = useState<any>(null);
  const [showOtpSuggestions, setShowOtpSuggestions] = useState(false);
  const [customOtpCode, setCustomOtpCode] = useState("");

  // 5. Emotional Questions Panel
  const [activeQSubTab, setActiveQSubTab] = useState<"manage" | "history">("manage");
  const [questionsList, setQuestionsList] = useState<any[]>([]);
  const [responsesHistory, setResponsesHistory] = useState<any[]>([]);
  const [newQText, setNewQText] = useState("");
  const [newQTargetType, setNewQTargetType] = useState("global");
  const [newQTargetValue, setNewQTargetValue] = useState("");
  const [newQTargetSearch, setNewQTargetSearch] = useState("");
  const [selectedQStudent, setSelectedQStudent] = useState<any>(null);
  const [showQSuggestions, setShowQSuggestions] = useState(false);

  // 6. Notifications Config
  const [adminNotificationEmail, setAdminNotificationEmail] = useState("");
  const [notifChannels, setNotifChannels] = useState<Record<string, any>>({
    wellness: { email: true, push: true, sms: false },
    attendance: { email: true, push: true, sms: true },
    parent: { email: true, push: false, sms: true },
    teacher: { email: false, push: true, sms: false },
  });
  const [notifSensitivity, setNotifSensitivity] = useState<"Low" | "Medium" | "High">("Medium");
  const [notifTemplates, setNotifTemplates] = useState({
    wellness: "🚨 Alert: {studentName} from {class} may need emotional support today.",
    attendance: "📋 {studentName} is marked {status} today at {time}.",
    parent: "💌 Dear Parent, {studentName} checked in with score {score}/10 today.",
  });

  // 7. AI Insights
  const [aiAlertThreshold, setAiAlertThreshold] = useState(4);
  const [aiAttendanceRisk, setAiAttendanceRisk] = useState(70);
  const [aiBurnoutDays, setAiBurnoutDays] = useState(3);
  const [aiToggles, setAiToggles] = useState({ aiEngine: true, predictive: true, correlation: true, autoAlert: true });
  const [aiStats, setAiStats] = useState({ classes: 0, students: 0 });
  const [aiInsightsList, setAiInsightsList] = useState<any[]>([]);

  // 8. Privacy & Security
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [jwtSecret, setJwtSecret] = useState("••••••••••••••••");
  const [showJwt, setShowJwt] = useState(false);
  const [secToggles, setSecToggles] = useState({ multiDevice: false, consent: true, backup: true, ipRestrict: false, audit: true });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // 9. Advanced Settings
  const [apiKey, setApiKey] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [advToggles, setAdvToggles] = useState({ animations: true, aiEngine: true, sounds: false, parentPortal: true, debugMode: false, productionMode: true });
  const [sysHealth, setSysHealth] = useState({ api: 98, db: 100, memory: 62, uptime: "7d 4h 12m" });
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [sysLogs, setSysLogs] = useState<any[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // 10. Admin Accounts
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [newAdminUser, setNewAdminUser] = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("Teacher");
  const [showAdminPass, setShowAdminPass] = useState(false);
  
  const [editingAdmin, setEditingAdmin] = useState<string | null>(null);
  const [editAdminForm, setEditAdminForm] = useState({ username: "", password: "" });
  const [showEditAdminPass, setShowEditAdminPass] = useState(false);
  const [confirmDeleteAdmin, setConfirmDeleteAdmin] = useState<string | null>(null);

  // --- COMPONENT MOUNT LOAD DATA ---
  const loadAllSettings = async () => {
    setIsLoading(true);
    try {
      const timestamp = Date.now();
      
      const [
        schRes, colRes, clsRes, otpsRes, otpHistRes, otpConfRes,
        qsRes, qsHistRes, notifRes, secRes, auditRes, aiRes, advRes, adminsRes
      ] = await Promise.allSettled([
        fetch(`${API_URL}/settings/school?t=${timestamp}`),
        fetch(`${API_URL}/settings/colors?t=${timestamp}`),
        fetch(`${API_URL}/settings/classes?t=${timestamp}`),
        fetch(`${API_URL}/otps/list?t=${timestamp}`),
        fetch(`${API_URL}/otps/history?t=${timestamp}`),
        fetch(`${API_URL}/settings/otp-config?t=${timestamp}`),
        fetch(`${API_URL}/questions/list?t=${timestamp}`),
        fetch(`${API_URL}/questions/history?t=${timestamp}`),
        fetch(`${API_URL}/settings/notifications?t=${timestamp}`),
        fetch(`${API_URL}/settings/security?t=${timestamp}`),
        fetch(`${API_URL}/audit-log?t=${timestamp}`),
        fetch(`${API_URL}/settings/ai-insights?t=${timestamp}`),
        fetch(`${API_URL}/settings/advanced?t=${timestamp}`),
        fetch(`${API_URL}/admin-users?t=${timestamp}`)
      ]);

      // 1. School Info
      if (schRes.status === "fulfilled" && schRes.value.ok) {
        const sch = await schRes.value.json();
        setSchoolName(sch.name || "Pa'Lante Education Program");
        setSchoolAddress(sch.address || "Allentown, US");
        setSchoolPhone(sch.phone || "8537861040");
        setSchoolEmail(sch.email || "contact@ulmind.com");
        setSchoolLogo(sch.logo || "https://kids-attendance-production.up.railway.app/public/casa_logo.png");
        setSchoolWebsite(sch.website || "www.ulmind.com");
        setSchoolMotto(sch.motto || "Nurturing the whole child, one breath at a time");
        setSchoolThemeColor(sch.theme_color || "#cc8219");
        setPrincipalName(sch.principal_name || "Jaime Escalante");
        setPrincipalPhoto(sch.principal_photo || "");
        setAdminPhone(sch.admin_phone || "8537861040");
        setEmergencyPhone(sch.emergency_phone || "8537861040");
      }

      // 2. Colors
      if (colRes.status === "fulfilled" && colRes.value.ok) {
        const colors = await colRes.value.json();
        if (colors.clock_emotions) setClockColors(colors.clock_emotions);
        if (colors.puzzle_emotions) setPuzzleColors(colors.puzzle_emotions);
      }

      // 3. Classes
      if (clsRes.status === "fulfilled" && clsRes.value.ok) {
        const classData = await clsRes.value.json();
        const liveClasses = Array.isArray(classData) ? classData : (classData.classes || []);
        setClassesList(liveClasses);
      }

      // 4. OTP List
      if (otpsRes.status === "fulfilled" && otpsRes.value.ok) {
        setStudentsList(await otpsRes.value.json());
      }
      
      // 4b. OTP History
      if (otpHistRes.status === "fulfilled" && otpHistRes.value.ok) {
        setOtpHistory(await otpHistRes.value.json());
      }

      // 4c. OTP Config
      if (otpConfRes.status === "fulfilled" && otpConfRes.value.ok) {
        const conf = await otpConfRes.value.json();
        const hours = conf.expiration_hours || 24;
        if (hours % 8760 === 0 && hours >= 8760) {
          setOtpExpValue(hours / 8760);
          setOtpExpUnit("Years");
        } else if (hours % 720 === 0 && hours >= 720) {
          setOtpExpValue(hours / 720);
          setOtpExpUnit("Months");
        } else if (hours % 24 === 0 && hours >= 24) {
          setOtpExpValue(hours / 24);
          setOtpExpUnit("Days");
        } else {
          setOtpExpValue(hours);
          setOtpExpUnit("Hours");
        }
        setOtpTimeRangeEnabled(conf.time_range_enabled || false);
        setOtpStartTime(conf.start_time || "08:00");
        setOtpEndTime(conf.end_time || "16:00");
      }

      // 5. Questions list
      if (qsRes.status === "fulfilled" && qsRes.value.ok) {
        setQuestionsList(await qsRes.value.json());
      }

      // 5b. Questions responses history
      if (qsHistRes.status === "fulfilled" && qsHistRes.value.ok) {
        setResponsesHistory(await qsHistRes.value.json());
      }

      // 6. Notifications
      if (notifRes.status === "fulfilled" && notifRes.value.ok) {
        const data = await notifRes.value.json();
        setAdminNotificationEmail(data.admin_notification_email || "");
      }

      // 7. Security settings
      if (secRes.status === "fulfilled" && secRes.value.ok) {
        const data = await secRes.value.json();
        setJwtSecret(data.jwt_secret || "••••••••••••••••");
        setSessionTimeout(data.session_timeout || 60);
        setSecToggles({
          multiDevice: data.multi_device || false,
          ipRestrict: data.ip_restriction || false,
          backup: data.backup !== false,
          consent: data.consent !== false,
          audit: data.audit !== false
        });
      }

      // 7b. Audit log
      if (auditRes.status === "fulfilled" && auditRes.value.ok) {
        setAuditLogs(await auditRes.value.json());
      }

      // 8. AI Insights
      if (aiRes.status === "fulfilled" && aiRes.value.ok) {
        const data = await aiRes.value.json();
        const settings = data.settings || {};
        setAiAlertThreshold(settings.alert_threshold || 4);
        setAiAttendanceRisk(settings.attendance_risk || 70);
        setAiBurnoutDays(settings.burnout_days || 3);
        setAiToggles({
          aiEngine: settings.ai_engine !== false,
          predictive: settings.predictive !== false,
          correlation: settings.correlation !== false,
          autoAlert: settings.auto_alert !== false
        });
        setAiStats(data.stats || { classes: 0, students: 0 });
        setAiInsightsList(data.insights || []);
      }

      // 9. Advanced
      if (advRes.status === "fulfilled" && advRes.value.ok) {
        const data = await advRes.value.json();
        const settings = data.settings || {};
        setApiKey("sk-kids-" + Math.random().toString(36).slice(2, 18));
        setWebhookUrl(settings.webhook_url || "");
        setAdvToggles({
          animations: settings.animations !== false,
          aiEngine: settings.ai_engine !== false,
          sounds: settings.sounds === true,
          parentPortal: settings.parent_portal !== false,
          productionMode: settings.production_mode !== false,
          debugMode: settings.debug_mode === true
        });
        setSysHealth(data.health || { api: 98, db: 100, memory: 62, uptime: "7d 4h 12m" });
        setLastBackup(data.last_backup);
        setSysLogs(data.logs || []);
      }

      // 10. Admins List
      if (adminsRes.status === "fulfilled" && adminsRes.value.ok) {
        setAdminsList(await adminsRes.value.json());
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
        const res = await fetch(`${API_URL}/settings/school`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: schoolName,
            address: schoolAddress,
            phone: schoolPhone,
            email: schoolEmail,
            logo: schoolLogo,
            website: schoolWebsite,
            motto: schoolMotto,
            theme_color: schoolThemeColor,
            principal_name: principalName,
            principal_photo: principalPhoto,
            admin_phone: adminPhone,
            emergency_phone: emergencyPhone
          })
        });
        if (res.ok) Alert.alert("Success", "School Information saved successfully! ✨");
        else Alert.alert("Error", "Failed to save School Information.");
      } 
      else if (activeTab === "branding") {
        const res = await fetch(`${API_URL}/settings/colors`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clock_emotions: clockColors, puzzle_emotions: puzzleColors })
        });
        if (res.ok) Alert.alert("Success", "Branding Colors saved successfully! 🎨");
        else Alert.alert("Error", "Failed to save Branding Colors.");
      }
      else if (activeTab === "otp") {
        let multiplier = 1;
        if (otpExpUnit === "Years") multiplier = 8760;
        if (otpExpUnit === "Months") multiplier = 720;
        if (otpExpUnit === "Days") multiplier = 24;

        const res = await fetch(`${API_URL}/settings/otp-config`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expiration_hours: otpExpValue * multiplier,
            time_range_enabled: otpTimeRangeEnabled,
            start_time: otpStartTime,
            end_time: otpEndTime
          })
        });
        if (res.ok) {
          Alert.alert("Success", "OTP rules configured successfully! 🔑");
          loadAllSettings();
        } else Alert.alert("Error", "Failed to save OTP configuration.");
      }
      else if (activeTab === "notifications") {
        const res = await fetch(`${API_URL}/settings/notifications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ admin_notification_email: adminNotificationEmail })
        });
        if (res.ok) Alert.alert("Success", "Notifications settings saved successfully! 🔔");
        else Alert.alert("Error", "Failed to save Notifications settings.");
      }
      else if (activeTab === "security") {
        const res = await fetch(`${API_URL}/settings/security`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jwt_secret: jwtSecret,
            session_timeout: sessionTimeout,
            multi_device: secToggles.multiDevice,
            ip_restriction: secToggles.ipRestrict,
            backup: secToggles.backup,
            consent: secToggles.consent,
            audit: secToggles.audit
          })
        });
        if (res.ok) {
          Alert.alert("Success", "Security policies saved successfully! 🔐");
          loadAllSettings();
        } else Alert.alert("Error", "Failed to save Security policies.");
      }
      else if (activeTab === "ai") {
        const res = await fetch(`${API_URL}/settings/ai-insights`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            alert_threshold: aiAlertThreshold,
            attendance_risk: aiAttendanceRisk,
            burnout_days: aiBurnoutDays,
            ai_engine: aiToggles.aiEngine,
            predictive: aiToggles.predictive,
            correlation: aiToggles.correlation,
            auto_alert: aiToggles.autoAlert
          })
        });
        if (res.ok) {
          Alert.alert("Success", "AI predictive settings configured! 🧠");
          loadAllSettings();
        } else Alert.alert("Error", "Failed to save AI configuration.");
      }
      else if (activeTab === "advanced") {
        const res = await fetch(`${API_URL}/settings/advanced`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            webhook_url: webhookUrl,
            animations: advToggles.animations,
            ai_engine: advToggles.aiEngine,
            sounds: advToggles.sounds,
            parent_portal: advToggles.parentPortal,
            production_mode: advToggles.productionMode,
            debug_mode: advToggles.debugMode
          })
        });
        if (res.ok) {
          Alert.alert("Success", "Advanced configuration applied successfully! ⚙️");
          loadAllSettings();
        } else Alert.alert("Error", "Failed to save Advanced settings.");
      }
    } catch (e) {
      Alert.alert("Save Failed", "Failed to save settings telemetry.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- CLASS ACTIONS ---
  const handleAddClass = async () => {
    if (!newClassName || !newClassTeacher) {
      Alert.alert("Missing Fields", "Class Name and Assigned Teacher are required.");
      return;
    }
    setIsSaving(true);
    const updated = [...classesList, { name: newClassName, teacher: newClassTeacher, section: newClassSection, students_count: 0, max_students: 30 }];
    setClassesList(updated);
    setNewClassName("");
    setNewClassTeacher("");
    try {
      await fetch(`${API_URL}/settings/classes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classes: updated })
      });
      Alert.alert("Success", "New Classroom created successfully!");
    } catch(e) {
      Alert.alert("Error", "Network issue creating Classroom.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClass = async (index: number) => {
    Alert.alert("Delete Classroom", "Are you sure you want to remove this classroom?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          setIsSaving(true);
          const updated = classesList.filter((_, i) => i !== index);
          setClassesList(updated);
          try {
            await fetch(`${API_URL}/settings/classes`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ classes: updated })
            });
          } catch(e) {}
          setIsSaving(false);
        }
      }
    ]);
  };

  // --- OTP ACTIONS ---
  const handleBulkGenerate = async (actionType: "all" | "class") => {
    setIsOtpGenerating(true);
    try {
      const bodyParams: any = { action: actionType };
      if (actionType === "class") {
        if (selectedOtpClass === "All") {
          Alert.alert("Error", "Please select a specific Class filter first.");
          setIsOtpGenerating(false);
          return;
        }
        bodyParams.class_name = selectedOtpClass;
        if (selectedOtpSection !== "All") {
          bodyParams.section_name = selectedOtpSection;
        }
      }

      const res = await fetch(`${API_URL}/otps/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyParams)
      });
      if (res.ok) {
        Alert.alert("Generated", "Dynamic OTP credentials auto-generated!");
        loadAllSettings();
      } else {
        Alert.alert("Failed", "Failed to generate bulk OTPs.");
      }
    } catch (e) {
      Alert.alert("Network Issue", "Failed to contact generator engine.");
    } finally {
      setIsOtpGenerating(false);
    }
  };

  const handleManualOtpSet = async () => {
    if (!selectedManualStudent) {
      Alert.alert("Missing Student", "Please select a student from suggestions first.");
      return;
    }
    if (!customOtpCode || customOtpCode.length !== 4) {
      Alert.alert("Invalid PIN", "Please input a valid 4-Digit numeric PIN.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/otps/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "student", 
          roll_number: selectedManualStudent.roll_number, 
          custom_otp: customOtpCode 
        })
      });
      if (res.ok) {
        Alert.alert("Success", `Custom PIN set for ${selectedManualStudent.name}!`);
        setManualOtpSearch("");
        setSelectedManualStudent(null);
        setCustomOtpCode("");
        loadAllSettings();
      } else {
        Alert.alert("Failed", "Failed to apply custom PIN.");
      }
    } catch (e) {
      Alert.alert("Error", "Network issue setting custom PIN.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateSingleOtp = async (roll: string) => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/otps/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "student", roll_number: roll })
      });
      if (res.ok) {
        loadAllSettings();
      } else {
        Alert.alert("Failed", "Failed to regenerate student OTP.");
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setIsSaving(false);
    }
  };

  // --- QUESTIONS ACTIONS ---
  const handleAddQuestion = async () => {
    if (!newQText) {
      Alert.alert("Missing Text", "Please type your wellness question prompt.");
      return;
    }
    setIsSaving(true);
    let targetVal = "global";
    if (newQTargetType === "class") {
      targetVal = newQTargetValue || "KG";
    } else if (newQTargetType === "student") {
      if (!selectedQStudent) {
        Alert.alert("Missing Student", "Please select a target student from autocomplete.");
        setIsSaving(false);
        return;
      }
      targetVal = selectedQStudent.roll_number;
    }

    const newQuestion = {
      id: "q-" + Date.now(),
      text: newQText,
      targetType: newQTargetType,
      targetValue: targetVal,
      enabled: true
    };

    const updated = [...questionsList, newQuestion];
    setQuestionsList(updated);
    setNewQText("");
    setNewQTargetValue("");
    setNewQTargetSearch("");
    setSelectedQStudent(null);

    try {
      const res = await fetch(`${API_URL}/questions/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        Alert.alert("Success", "Question added to active wellness bank!");
        loadAllSettings();
      }
    } catch(e) {
      Alert.alert("Error", "Failed to save question bank to server.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    setIsSaving(true);
    const updated = questionsList.filter(q => q.id !== id);
    setQuestionsList(updated);
    try {
      const res = await fetch(`${API_URL}/questions/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        loadAllSettings();
      }
    } catch(e) {
      console.warn(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleQuestion = async (id: string) => {
    const updated = questionsList.map(q => {
      if (q.id === id) return { ...q, enabled: !q.enabled };
      return q;
    });
    setQuestionsList(updated);
    try {
      await fetch(`${API_URL}/questions/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
    } catch(e) {
      console.warn(e);
    }
  };

  // --- SECURITY ACTIONS ---
  const handleCopyJwt = () => {
    Clipboard.setString(jwtSecret);
    Alert.alert("Copied", "JWT Security secret key copied to clipboard! 📋");
  };

  // --- ADVANCED ACTIONS ---
  const handleBackupDatabase = async () => {
    setIsBackingUp(true);
    try {
      const res = await fetch(`${API_URL}/settings/advanced/backup`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        Alert.alert("Backup Success 📦", "Cloud backup database generated successfully!");
        setLastBackup(new Date().toLocaleString());
      } else {
        Alert.alert("Backup Failed", "Failed to execute database backup.");
      }
    } catch(e) {
      Alert.alert("Network Issue", "Failed to communicate with backup server.");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleExportDatabase = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`${API_URL}/settings/advanced/export`);
      if (res.ok) {
        const data = await res.json();
        Clipboard.setString(JSON.stringify(data, null, 2));
        Alert.alert("Export Success 📤", "Complete DB JSON copied to clipboard successfully!");
      } else {
        Alert.alert("Export Failed", "Failed to download DB dump.");
      }
    } catch(e) {
      Alert.alert("Network Issue", "Failed to export.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetAdvanced = async () => {
    Alert.alert(
      "Dangerous Action ⚠️",
      "This resets the entire platform database back to defaults. All checked-in timelines and wellness scores will be completely cleared.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset DB Roster", 
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

  // --- ADMIN ACCOUNTS ACTIONS ---
  const handleAddAdminUser = async () => {
    if (!newAdminUser || !newAdminPass) {
      Alert.alert("Missing Fields", "Username and Password are required.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/admin-users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newAdminUser.trim(), password: newAdminPass, role: newAdminRole })
      });
      if (res.ok) {
        Alert.alert("Success", `Admin account ${newAdminUser} created!`);
        setNewAdminUser("");
        setNewAdminPass("");
        loadAllSettings();
      } else {
        const err = await res.json();
        Alert.alert("Failed", err.message || "Failed to create account. Username might be taken.");
      }
    } catch (e) {
      Alert.alert("Network Issue", "Failed to save Admin Account.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAdmin = async () => {
    if (!editingAdmin || !editAdminForm.username) return;
    setIsSaving(true);
    try {
      const body: any = { new_username: editAdminForm.username.trim() };
      if (editAdminForm.password) {
        body.new_password = editAdminForm.password;
      }
      const res = await fetch(`${API_URL}/admin-users/${editingAdmin}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        Alert.alert("Success", "Account updated successfully!");
        setEditingAdmin(null);
        setEditAdminForm({ username: "", password: "" });
        loadAllSettings();
      } else {
        Alert.alert("Failed", "Failed to update account. Username might be taken.");
      }
    } catch (e) {
      Alert.alert("Network Issue", "Failed to update account.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAdmin = async (username: string) => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/admin-users/${username}`, {
        method: "DELETE"
      });
      if (res.ok) {
        Alert.alert("Deleted", "Account has been deleted.");
        setConfirmDeleteAdmin(null);
        loadAllSettings();
      } else {
        Alert.alert("Failed", "Cannot delete account.");
      }
    } catch (e) {
      Alert.alert("Network Issue", "Failed to delete account.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- RENDERING TABS ---
  const settingsTabs = [
    { id: "school", label: "School Info", icon: Building2, color: "#3b82f6" },
    { id: "branding", label: "Branding & Theme", icon: Palette, color: "#ec4899" },
    { id: "classes", label: "Classes & Users", icon: GraduationCap, color: "#10b981" },
    { id: "admins", label: "Admin Accounts", icon: Users, color: "#6366f1" },
    { id: "otp", label: "OTP Settings", icon: KeyRound, color: "#8b5cf6" },
    { id: "questions", label: "Emotional Questions", icon: HelpCircle, color: "#f59e0b" },
    { id: "notifications", label: "Notifications", icon: Bell, color: "#ef4444" },
    { id: "security", label: "Privacy & Security", icon: ShieldCheck, color: "#06b6d4" },
    { id: "ai", label: "AI Insights", icon: Bot, color: "#10b981" },
    { id: "advanced", label: "Advanced", icon: Settings, color: "#64748b" },
  ];

  // Helper filters for student rosters
  const filteredStudents = studentsList.filter(s => {
    const classMatch = selectedOtpClass === "All" || s.class_name === selectedOtpClass;
    const secMatch = selectedOtpSection === "All" || s.section_name === selectedOtpSection;
    const searchMatch = !otpSearchQuery || 
      s.name.toLowerCase().includes(otpSearchQuery.toLowerCase()) || 
      s.roll_number.toLowerCase().includes(otpSearchQuery.toLowerCase());
    return classMatch && secMatch && searchMatch;
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
      
      {/* Platform Settings Header Banner */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, backgroundColor: '#fafafa' }}>
        <Text style={{ fontSize: 24, fontWeight: '900', color: '#0f172a' }}>Platform Settings</Text>
        <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b', marginTop: 3 }}>
          Configure every aspect of your emotional wellness platform.
        </Text>
      </View>

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
                <Icon size={13} color={isActive ? '#fff' : '#64748b'} />
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

            {/* --- PANEL 1: SCHOOL INFO --- */}
            {activeTab === "school" && (
              <View style={{ gap: 20 }}>
                <View style={{ borderBottomWidth: 1.5, borderBottomColor: '#f1f5f9', paddingBottom: 12 }}>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#1e293b' }}>School Information</Text>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 2 }}>
                    Configure your school's identity, contacts, and branding details.
                  </Text>
                </View>

                {/* Section 1: School Details */}
                <View style={styles.sectionInnerCard}>
                  <Text style={styles.sectionInnerTitle}>🏫 School Details</Text>
                  <View style={{ gap: 14 }}>
                    <View>
                      <Text style={styles.inputLabel}>SCHOOL NAME</Text>
                      <TextInput 
                        value={schoolName}
                        onChangeText={setSchoolName}
                        style={styles.textInput}
                      />
                    </View>

                    <View>
                      <Text style={styles.inputLabel}>SCHOOL LOGO</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <View style={styles.logoThumbnailBox}>
                          <Image 
                            source={{ uri: schoolLogo || 'https://kids-attendance-production.up.railway.app/public/casa_logo.png' }} 
                            style={styles.logoThumbnailImage} 
                            resizeMode="contain"
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <TextInput 
                            value={schoolLogo}
                            onChangeText={setSchoolLogo}
                            placeholder="Enter image URL..."
                            style={[styles.textInput, { fontSize: 12, paddingVertical: 8 }]}
                          />
                        </View>
                      </View>
                    </View>

                    <View>
                      <Text style={styles.inputLabel}>ADDRESS</Text>
                      <TextInput 
                        value={schoolAddress}
                        onChangeText={setSchoolAddress}
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

                    <View>
                      <Text style={styles.inputLabel}>WEBSITE</Text>
                      <TextInput 
                        value={schoolWebsite}
                        onChangeText={setSchoolWebsite}
                        style={styles.textInput}
                      />
                    </View>
                  </View>
                </View>

                {/* Section 2: School Identity */}
                <View style={styles.sectionInnerCard}>
                  <Text style={styles.sectionInnerTitle}>✨ School Identity</Text>
                  <View style={{ gap: 14 }}>
                    <View>
                      <Text style={styles.inputLabel}>SCHOOL MOTTO</Text>
                      <TextInput 
                        value={schoolMotto}
                        onChangeText={setSchoolMotto}
                        placeholder="Your school motto..."
                        style={styles.textInput}
                      />
                    </View>

                    <View>
                      <Text style={styles.inputLabel}>THEME COLOR</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={[styles.colorPreviewDotSquare, { backgroundColor: schoolThemeColor }]} />
                        <TextInput 
                          value={schoolThemeColor}
                          onChangeText={setSchoolThemeColor}
                          style={[styles.textInput, { flex: 1, fontFamily: 'monospace' }]}
                        />
                        <View style={{ flex: 1.5, height: 16, borderRadius: 8, backgroundColor: schoolThemeColor + '40' }} />
                      </View>
                    </View>
                  </View>
                </View>

                {/* Section 3: Principal & Staff */}
                <View style={styles.sectionInnerCard}>
                  <Text style={styles.sectionInnerTitle}>👤 Principal & Staff</Text>
                  <View style={{ gap: 14 }}>
                    <View>
                      <Text style={styles.inputLabel}>PRINCIPAL NAME</Text>
                      <TextInput 
                        value={principalName}
                        onChangeText={setPrincipalName}
                        placeholder="Principal Name"
                        style={styles.textInput}
                      />
                    </View>

                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>ADMIN CONTACT</Text>
                        <TextInput 
                          value={adminPhone}
                          onChangeText={setAdminPhone}
                          placeholder="Admin Phone"
                          style={styles.textInput}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel}>EMERGENCY CONTACT</Text>
                        <TextInput 
                          value={emergencyPhone}
                          onChangeText={setEmergencyPhone}
                          placeholder="Emergency Phone"
                          style={styles.textInput}
                        />
                      </View>
                    </View>
                  </View>
                </View>

                <TouchableOpacity onPress={handleSave} disabled={isSaving} style={styles.primaryGradientSaveBtn}>
                  {isSaving ? <ActivityIndicator size="small" color="#fff" /> : <Save size={16} color="#fff" />}
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '900' }}>Save School Info</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* --- PANEL 2: BRANDING (EMOTION COLORS) --- */}
            {activeTab === "branding" && (
              <View style={{ gap: 20 }}>
                <View style={{ borderBottomWidth: 1.5, borderBottomColor: '#f1f5f9', paddingBottom: 12 }}>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#1e293b' }}>Student Emotion Colors</Text>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 2 }}>
                    Customize the exact colors students see during their check-ins.
                  </Text>
                </View>

                {/* Custom Segment Switch */}
                <View style={styles.segmentSelectorContainer}>
                  <TouchableOpacity 
                    onPress={() => setActiveBrandingSubTab("scale")}
                    style={[styles.segmentBtn, activeBrandingSubTab === "scale" && styles.segmentBtnActive]}
                  >
                    <Text style={[styles.segmentBtnText, activeBrandingSubTab === "scale" && styles.segmentBtnTextActive]}>
                      Feeling Scale (1-10)
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => setActiveBrandingSubTab("puzzle")}
                    style={[styles.segmentBtn, activeBrandingSubTab === "puzzle" && styles.segmentBtnActive]}
                  >
                    <Text style={[styles.segmentBtnText, activeBrandingSubTab === "puzzle" && styles.segmentBtnTextActive]}>
                      Emotion Puzzle
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Sub Tab: 1-10 Scale */}
                {activeBrandingSubTab === "scale" && (
                  <View style={styles.sectionInnerCard}>
                    <Text style={styles.sectionInnerTitle}>⏱️ Clock Emotion Colors</Text>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', marginBottom: 14 }}>
                      These colors appear on the sliding clock screen (Scale 1 to 10).
                    </Text>

                    <View style={{ gap: 10 }}>
                      {[
                        { num: "1", label: "Very Bad" },
                        { num: "2", label: "Sad" },
                        { num: "3", label: "Low Energy" },
                        { num: "4", label: "Hurt" },
                        { num: "5", label: "Okay" },
                        { num: "6", label: "Calm" },
                        { num: "7", label: "Happy" },
                        { num: "8", label: "Great" },
                        { num: "9", label: "Amazing" },
                        { num: "10", label: "Excellent" }
                      ].map((item) => (
                        <View key={item.num} style={styles.brandingColorRow}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                            <View style={[styles.numberBadgeCircle, { backgroundColor: clockColors[item.num] }]}>
                              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>{item.num}</Text>
                            </View>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>{item.label}</Text>
                          </View>
                          
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <View style={[styles.colorPreviewBlockSquare, { backgroundColor: clockColors[item.num] }]} />
                            <TextInput 
                              value={clockColors[item.num]}
                              onChangeText={(val) => setClockColors(prev => ({ ...prev, [item.num]: val }))}
                              style={styles.brandingColorInput}
                            />
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Sub Tab: Puzzle Piece */}
                {activeBrandingSubTab === "puzzle" && (
                  <View style={styles.sectionInnerCard}>
                    <Text style={styles.sectionInnerTitle}>🧩 Puzzle Emotion Colors</Text>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', marginBottom: 14 }}>
                      These colors are used when students select a specific emotion for their puzzle lightbulb.
                    </Text>

                    <View style={{ gap: 10 }}>
                      {[
                        { name: "Happy", emoji: "😊" },
                        { name: "Sad", emoji: "😢" },
                        { name: "Mad", emoji: "😡" },
                        { name: "Scared", emoji: "😨" },
                        { name: "Worried", emoji: "😟" },
                        { name: "Excited", emoji: "🤩" }
                      ].map((item) => (
                        <View key={item.name} style={styles.brandingColorRow}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                            <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>{item.name}</Text>
                          </View>
                          
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <View style={[styles.colorPreviewBlockSquare, { backgroundColor: puzzleColors[item.name] }]} />
                            <TextInput 
                              value={puzzleColors[item.name]}
                              onChangeText={(val) => setPuzzleColors(prev => ({ ...prev, [item.name]: val }))}
                              style={styles.brandingColorInput}
                            />
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <TouchableOpacity onPress={handleSave} disabled={isSaving} style={styles.primaryGradientSaveBtn}>
                  {isSaving ? <ActivityIndicator size="small" color="#fff" /> : <Save size={16} color="#fff" />}
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '900' }}>Save Branding Colors</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* --- PANEL 3: CLASSES & USERS --- */}
            {activeTab === "classes" && (
              <View style={{ gap: 20 }}>
                <View style={{ borderBottomWidth: 1.5, borderBottomColor: '#f1f5f9', paddingBottom: 12 }}>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#1e293b' }}>Classes & Roster</Text>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 2 }}>
                    Manage classroom rooms, assigned teachers, and student capacities.
                  </Text>
                </View>

                {/* Scorecards */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={[styles.scoreBadgeBox, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
                    <Text style={[styles.scoreBadgeCount, { color: '#059669' }]}>{classesList.length}</Text>
                    <Text style={[styles.scoreBadgeLabel, { color: '#047857' }]}>CLASSES</Text>
                  </View>

                  <View style={[styles.scoreBadgeBox, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
                    <Text style={[styles.scoreBadgeCount, { color: '#2563eb' }]}>
                      {new Set(classesList.map(c => c.teacher).filter(Boolean)).size}
                    </Text>
                    <Text style={[styles.scoreBadgeLabel, { color: '#1d4ed8' }]}>TEACHERS</Text>
                  </View>

                  <View style={[styles.scoreBadgeBox, { backgroundColor: '#fdf2f8', borderColor: '#fbcfe8' }]}>
                    <Text style={[styles.scoreBadgeCount, { color: '#db2777' }]}>
                      {classesList.reduce((sum, c) => sum + (c.students_count || 0), 0)}
                    </Text>
                    <Text style={[styles.scoreBadgeLabel, { color: '#be185d' }]}>STUDENTS</Text>
                  </View>
                </View>

                {/* Class List */}
                <View style={styles.sectionInnerCard}>
                  <Text style={styles.sectionInnerTitle}>📁 Class Management</Text>
                  <View style={{ gap: 10 }}>
                    {classesList.map((cls, i) => (
                      <View key={i} style={styles.classItemRow}>
                        <View style={styles.classIconPill}>
                          <GraduationCap size={16} color="#059669" />
                        </View>
                        
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={{ fontSize: 14, fontWeight: '900', color: '#1e293b' }}>{cls.name}</Text>
                            <View style={{ backgroundColor: '#d1fae5', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                              <Text style={{ color: '#065f46', fontSize: 9, fontWeight: '900' }}>{cls.section || 'A'}</Text>
                            </View>
                          </View>
                          <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 1 }}>
                            👤 {cls.teacher || 'Unassigned'}
                          </Text>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Users size={12} color="#64748b" />
                          <Text style={{ fontSize: 12, fontWeight: '800', color: '#334155' }}>
                            {cls.students_count || 0}/{cls.max_students || 30}
                          </Text>
                          <TouchableOpacity onPress={() => handleDeleteClass(i)}>
                            <Trash2 size={15} color="#ef4444" style={{ marginLeft: 6 }} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Add New Class */}
                <View style={styles.sectionInnerCard}>
                  <Text style={styles.sectionInnerTitle}>➕ Add New Classroom</Text>
                  <View style={{ gap: 12 }}>
                    <TextInput 
                      placeholder="Class Name (e.g. KG)" 
                      value={newClassName}
                      onChangeText={setNewClassName}
                      style={styles.textInput}
                    />
                    
                    <TextInput 
                      placeholder="Section (e.g. B)" 
                      value={newClassSection}
                      onChangeText={setNewClassSection}
                      style={styles.textInput}
                    />

                    <TextInput 
                      placeholder="Assign Teacher Name" 
                      value={newClassTeacher}
                      onChangeText={setNewClassTeacher}
                      style={styles.textInput}
                    />

                    <TouchableOpacity onPress={handleAddClass} style={styles.addButton}>
                      <Plus size={16} color="#fff" />
                      <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>Create Classroom</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* --- PANEL 4: ADMIN ACCOUNTS --- */}
            {activeTab === "admins" && (
              <View style={{ gap: 20 }}>
                <View style={{ borderBottomWidth: 1.5, borderBottomColor: '#f1f5f9', paddingBottom: 12 }}>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#1e293b' }}>Admin Accounts</Text>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 2 }}>
                    Manage platform administrators, credentials, and permissions.
                  </Text>
                </View>

                {/* stats cards */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={[styles.scoreBadgeBox, { backgroundColor: '#f5f3ff', borderColor: '#ddd6fe' }]}>
                    <Text style={[styles.scoreBadgeCount, { color: '#7c3aed' }]}>
                      {adminsList.filter(a => a.role === "Super Admin").length}
                    </Text>
                    <Text style={[styles.scoreBadgeLabel, { color: '#6d28d9' }]}>SUPER ADMINS</Text>
                  </View>

                  <View style={[styles.scoreBadgeBox, { backgroundColor: '#f0fdfa', borderColor: '#ccfbf1' }]}>
                    <Text style={[styles.scoreBadgeCount, { color: '#0d9488' }]}>
                      {adminsList.filter(a => a.role !== "Super Admin").length}
                    </Text>
                    <Text style={[styles.scoreBadgeLabel, { color: '#0f766e' }]}>TEACHER ACCOUNTS</Text>
                  </View>
                </View>

                {/* Admins List */}
                <View style={styles.sectionInnerCard}>
                  <Text style={styles.sectionInnerTitle}>🔑 Registered Credentials</Text>
                  <View style={{ gap: 10 }}>
                    {adminsList.map((adm, i) => (
                      <View key={i} style={styles.classItemRow}>
                        <View style={[styles.classIconPill, { backgroundColor: adm.role === 'Super Admin' ? '#f5f3ff' : '#f0fdfa' }]}>
                          <Shield size={16} color={adm.role === 'Super Admin' ? '#7c3aed' : '#0d9488'} />
                        </View>
                        
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 14, fontWeight: '900', color: '#1e293b' }}>{adm.username}</Text>
                          <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 1 }}>
                            Role: {adm.role}
                          </Text>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                          <TouchableOpacity onPress={() => {
                            setEditingAdmin(adm.username);
                            setEditAdminForm({ username: adm.username, password: "" });
                          }}>
                            <Settings size={16} color="#6366f1" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setConfirmDeleteAdmin(adm.username)}>
                            <Trash2 size={16} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Edit Form Modal */}
                {editingAdmin && (
                  <Modal visible={true} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalContentCard}>
                        <Text style={styles.modalHeaderTitle}>✏️ Edit Admin: {editingAdmin}</Text>
                        
                        <View style={{ gap: 12, marginTop: 16 }}>
                          <View>
                            <Text style={styles.inputLabel}>NEW USERNAME</Text>
                            <TextInput 
                              value={editAdminForm.username}
                              onChangeText={text => setEditAdminForm(prev => ({ ...prev, username: text }))}
                              style={styles.textInput}
                            />
                          </View>
                          
                          <View>
                            <Text style={styles.inputLabel}>NEW PASSWORD (LEAVE BLANK TO UNCHANGE)</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <TextInput 
                                placeholder="New Password..."
                                secureTextEntry={!showEditAdminPass}
                                value={editAdminForm.password}
                                onChangeText={text => setEditAdminForm(prev => ({ ...prev, password: text }))}
                                style={[styles.textInput, { flex: 1 }]}
                              />
                              <TouchableOpacity 
                                onPress={() => setShowEditAdminPass(!showEditAdminPass)}
                                style={{ position: 'absolute', right: 14 }}
                              >
                                {showEditAdminPass ? <EyeOff size={16} color="#64748b" /> : <Eye size={16} color="#64748b" />}
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                          <TouchableOpacity 
                            onPress={() => {
                              setEditingAdmin(null);
                              setEditAdminForm({ username: "", password: "" });
                            }} 
                            style={[styles.segmentBtn, { backgroundColor: '#f1f5f9' }]}
                          >
                            <Text style={{ fontWeight: '800', color: '#475569' }}>Cancel</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            onPress={handleUpdateAdmin} 
                            style={[styles.segmentBtn, { backgroundColor: '#6366f1' }]}
                          >
                            <Text style={{ fontWeight: '800', color: '#fff' }}>Save Changes</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Modal>
                )}

                {/* Delete Confirmation Modal */}
                {confirmDeleteAdmin && (
                  <Modal visible={true} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalContentCard}>
                        <AlertTriangle size={32} color="#ef4444" style={{ alignSelf: 'center', marginBottom: 12 }} />
                        <Text style={[styles.modalHeaderTitle, { textAlign: 'center' }]}>Delete Admin Account?</Text>
                        <Text style={{ fontSize: 12, color: '#64748b', textAlign: 'center', marginTop: 6 }}>
                          Are you sure you want to permanently delete the credentials of "{confirmDeleteAdmin}"? This action is irreversible.
                        </Text>

                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                          <TouchableOpacity 
                            onPress={() => setConfirmDeleteAdmin(null)} 
                            style={[styles.segmentBtn, { backgroundColor: '#f1f5f9' }]}
                          >
                            <Text style={{ fontWeight: '800', color: '#475569' }}>Cancel</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            onPress={() => handleDeleteAdmin(confirmDeleteAdmin)} 
                            style={[styles.segmentBtn, { backgroundColor: '#ef4444' }]}
                          >
                            <Text style={{ fontWeight: '800', color: '#fff' }}>Delete Account</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Modal>
                )}

                {/* Register New Account */}
                <View style={styles.sectionInnerCard}>
                  <Text style={styles.sectionInnerTitle}>➕ Enlist Access Account</Text>
                  <View style={{ gap: 12 }}>
                    <TextInput 
                      placeholder="Username (e.g. samiran)" 
                      value={newAdminUser}
                      onChangeText={setNewAdminUser}
                      style={styles.textInput}
                    />

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TextInput 
                        placeholder="Secure Password PIN" 
                        value={newAdminPass}
                        onChangeText={setNewAdminPass}
                        secureTextEntry={!showAdminPass}
                        style={[styles.textInput, { flex: 1 }]}
                      />
                      <TouchableOpacity 
                        onPress={() => setShowAdminPass(!showAdminPass)}
                        style={{ position: 'absolute', right: 14 }}
                      >
                        {showAdminPass ? <EyeOff size={16} color="#64748b" /> : <Eye size={16} color="#64748b" />}
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.inputLabel}>ACCOUNT ROLE</Text>
                    <View style={styles.segmentSelectorContainer}>
                      <TouchableOpacity 
                        onPress={() => setNewAdminRole("Super Admin")}
                        style={[styles.segmentBtn, newAdminRole === "Super Admin" && styles.segmentBtnActive]}
                      >
                        <Text style={[styles.segmentBtnText, newAdminRole === "Super Admin" && styles.segmentBtnTextActive]}>
                          Super Admin
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        onPress={() => setNewAdminRole("Teacher")}
                        style={[styles.segmentBtn, newAdminRole === "Teacher" && styles.segmentBtnActive]}
                      >
                        <Text style={[styles.segmentBtnText, newAdminRole === "Teacher" && styles.segmentBtnTextActive]}>
                          Teacher
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={handleAddAdminUser} style={styles.addButton}>
                      <Plus size={16} color="#fff" />
                      <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>Register Account</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* --- PANEL 5: OTP CONFIG --- */}
            {activeTab === "otp" && (
              <View style={{ gap: 20 }}>
                <View style={{ borderBottomWidth: 1.5, borderBottomColor: '#f1f5f9', paddingBottom: 12 }}>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#1e293b' }}>OTP Gate Settings</Text>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 2 }}>
                    Manage dynamic check-in keys, auto expiration thresholds, and restricted hours.
                  </Text>
                </View>

                {/* Custom Subtabs */}
                <View style={styles.segmentSelectorContainer}>
                  <TouchableOpacity 
                    onPress={() => setActiveOtpSubTab("manage")}
                    style={[styles.segmentBtn, activeOtpSubTab === "manage" && styles.segmentBtnActive]}
                  >
                    <Text style={[styles.segmentBtnText, activeOtpSubTab === "manage" && styles.segmentBtnTextActive]}>
                      Manage OTPs
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => setActiveOtpSubTab("history")}
                    style={[styles.segmentBtn, activeOtpSubTab === "history" && styles.segmentBtnActive]}
                  >
                    <Text style={[styles.segmentBtnText, activeOtpSubTab === "history" && styles.segmentBtnTextActive]}>
                      OTP History Log
                    </Text>
                  </TouchableOpacity>
                </View>

                {activeOtpSubTab === "manage" && (
                  <View style={{ gap: 16 }}>
                    {/* Rules */}
                    <View style={styles.sectionInnerCard}>
                      <Text style={styles.sectionInnerTitle}>🔑 Expiration & Entry Rules</Text>
                      
                      <View style={{ gap: 14 }}>
                        <Text style={styles.inputLabel}>AUTO-EXPIRATION VALUE</Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                          <TextInput 
                            keyboardType="numeric"
                            value={String(otpExpValue)}
                            onChangeText={v => setOtpExpValue(Number(v) || 0)}
                            style={[styles.textInput, { flex: 1 }]}
                          />
                          <View style={[styles.segmentSelectorContainer, { flex: 1.5, padding: 2 }]}>
                            {["Days", "Months", "Years"].map(unit => (
                              <TouchableOpacity 
                                key={unit}
                                onPress={() => setOtpExpUnit(unit)}
                                style={[styles.segmentBtn, otpExpUnit === unit && styles.segmentBtnActive, { paddingVertical: 6 }]}
                              >
                                <Text style={{ fontSize: 10, fontWeight: '800', color: otpExpUnit === unit ? '#0f172a' : '#64748b' }}>{unit}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>

                        <View style={styles.rowToggle}>
                          <View style={{ flex: 1, marginRight: 10 }}>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>Active Time restriction</Text>
                            <Text style={{ fontSize: 10, color: '#64748b' }}>Limit PIN logins to school schedule hours</Text>
                          </View>
                          <Switch value={otpTimeRangeEnabled} onValueChange={setOtpTimeRangeEnabled} />
                        </View>

                        {otpTimeRangeEnabled && (
                          <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.inputLabel}>START TIME</Text>
                              <TextInput value={otpStartTime} onChangeText={setOtpStartTime} style={styles.textInput} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.inputLabel}>END TIME</Text>
                              <TextInput value={otpEndTime} onChangeText={setOtpEndTime} style={styles.textInput} />
                            </View>
                          </View>
                        )}

                        <TouchableOpacity onPress={handleSave} disabled={isSaving} style={styles.primaryGradientSaveBtn}>
                          {isSaving ? <ActivityIndicator size="small" color="#fff" /> : <Save size={16} color="#fff" />}
                          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '900' }}>Save OTP Rules</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Bulk generation */}
                    <View style={styles.sectionInnerCard}>
                      <Text style={styles.sectionInnerTitle}>⚡ Group Auto-Generation</Text>
                      <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>
                        Instantly generate new keys for selected groups or the entire student body.
                      </Text>

                      <View style={{ gap: 10 }}>
                        <Text style={styles.inputLabel}>TARGET CLASS FILTER</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                          {["All", ...Array.from(new Set(classesList.map(c => c.name)))].map(clsName => (
                            <TouchableOpacity 
                              key={clsName} 
                              onPress={() => setSelectedOtpClass(clsName)}
                              style={[
                                styles.tabButton, 
                                { paddingVertical: 6, paddingHorizontal: 12 },
                                selectedOtpClass === clsName ? { backgroundColor: '#8b5cf6' } : { backgroundColor: '#f1f5f9' }
                              ]}
                            >
                              <Text style={{ fontSize: 11, fontWeight: '800', color: selectedOtpClass === clsName ? '#fff' : '#475569' }}>{clsName}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>

                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                          <TouchableOpacity 
                            onPress={() => handleBulkGenerate("all")}
                            disabled={isOtpGenerating}
                            style={[styles.addButton, { flex: 1, backgroundColor: '#8b5cf6' }]}
                          >
                            {isOtpGenerating ? <ActivityIndicator size="small" color="#fff" /> : <RefreshCw size={14} color="#fff" />}
                            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>All Students</Text>
                          </TouchableOpacity>

                          <TouchableOpacity 
                            onPress={() => handleBulkGenerate("class")}
                            disabled={isOtpGenerating}
                            style={[styles.addButton, { flex: 1, backgroundColor: '#a855f7' }]}
                          >
                            {isOtpGenerating ? <ActivityIndicator size="small" color="#fff" /> : <Sparkles size={14} color="#fff" />}
                            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>Active Filter Group</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    {/* Manual Custom Assignment */}
                    <View style={styles.sectionInnerCard}>
                      <Text style={styles.sectionInnerTitle}>✍️ Manual Student OTP Assignment</Text>
                      
                      <View style={{ gap: 12 }}>
                        <View>
                          <Text style={styles.inputLabel}>SEARCH STUDENT BY ROLL OR NAME</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TextInput 
                              placeholder="Type name or roll number..."
                              value={manualOtpSearch}
                              onChangeText={text => {
                                setManualOtpSearch(text);
                                setShowOtpSuggestions(text.length > 0);
                              }}
                              style={[styles.textInput, { flex: 1 }]}
                            />
                            <Search size={16} color="#64748b" style={{ position: 'absolute', right: 14 }} />
                          </View>

                          {/* Autocomplete Suggestions list */}
                          {showOtpSuggestions && (
                            <View style={styles.suggestionsContainer}>
                              {studentsList
                                .filter(s => s.name.toLowerCase().includes(manualOtpSearch.toLowerCase()) || s.roll_number.toLowerCase().includes(manualOtpSearch.toLowerCase()))
                                .slice(0, 4)
                                .map(student => (
                                  <TouchableOpacity 
                                    key={student.roll_number}
                                    onPress={() => {
                                      setSelectedManualStudent(student);
                                      setManualOtpSearch(`${student.name} (${student.roll_number})`);
                                      setShowOtpSuggestions(false);
                                    }}
                                    style={styles.suggestionItem}
                                  >
                                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>{student.name}</Text>
                                    <Text style={{ fontSize: 10, color: '#64748b' }}>Roll: {student.roll_number} • Class: {student.class_name}</Text>
                                  </TouchableOpacity>
                                ))}
                            </View>
                          )}
                        </View>

                        {selectedManualStudent && (
                          <View style={{ backgroundColor: '#f5f3ff', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ddd6fe' }}>
                            <Text style={{ fontSize: 11, fontWeight: '900', color: '#6d28d9' }}>SELECTED STUDENT DETAILS</Text>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b', marginTop: 2 }}>{selectedManualStudent.name}</Text>
                            <Text style={{ fontSize: 11, color: '#64748b' }}>Class: {selectedManualStudent.class_name}-{selectedManualStudent.section_name} • Current OTP: {selectedManualStudent.otp ? (typeof selectedManualStudent.otp === 'object' ? selectedManualStudent.otp.code : selectedManualStudent.otp) : 'None'}</Text>
                          </View>
                        )}

                        <TextInput 
                          placeholder="Type 4-Digit PIN Access Code (e.g. 1234)"
                          value={customOtpCode}
                          onChangeText={setCustomOtpCode}
                          maxLength={4}
                          keyboardType="numeric"
                          style={styles.textInput}
                        />

                        <TouchableOpacity onPress={handleManualOtpSet} style={styles.addButton}>
                          <Lock size={15} color="#fff" />
                          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '800' }}>Assign PIN Access</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Student List View */}
                    <View style={styles.sectionInnerCard}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={styles.sectionInnerTitle}>📋 Student PIN Database</Text>
                        <TextInput 
                          placeholder="Quick search..."
                          value={otpSearchQuery}
                          onChangeText={setOtpSearchQuery}
                          style={[styles.textInput, { width: 120, paddingVertical: 6, paddingHorizontal: 10, fontSize: 11 }]}
                        />
                      </View>

                      <View style={{ gap: 10 }}>
                        {filteredStudents.slice(0, 10).map((std, idx) => (
                          <View key={idx} style={styles.classItemRow}>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>{std.name}</Text>
                              <Text style={{ fontSize: 10, color: '#64748b' }}>Roll: {std.roll_number} • Class: {std.class_name}</Text>
                            </View>

                            <View style={{ alignItems: 'flex-end', gap: 4 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <View style={{ backgroundColor: '#f3e8ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                  <Text style={{ fontFamily: 'monospace', fontWeight: '900', color: '#7c3aed', fontSize: 13 }}>{std.otp ? (typeof std.otp === 'object' ? std.otp.code : std.otp) : '----'}</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleRegenerateSingleOtp(std.roll_number)}>
                                  <RefreshCw size={14} color="#64748b" />
                                </TouchableOpacity>
                              </View>
                              <Text style={{ fontSize: 9, fontWeight: '900', color: std.otp ? '#059669' : '#dc2626' }}>
                                {std.otp ? '🔑 ACTIVE' : '❌ NOT ASSIGNED'}
                              </Text>
                            </View>
                          </View>
                        ))}
                        {filteredStudents.length > 10 && (
                          <Text style={{ fontSize: 10, color: '#64748b', textAlign: 'center', marginTop: 4 }}>
                            + {filteredStudents.length - 10} more students. Use filter or search.
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                )}

                {activeOtpSubTab === "history" && (
                  <View style={styles.sectionInnerCard}>
                    <Text style={styles.sectionInnerTitle}>🕒 OTP Verification Log</Text>
                    <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 14 }}>
                      Audit log of checked-in students and utilized OTP codes.
                    </Text>

                    <View style={{ gap: 10 }}>
                      {otpHistory.slice(0, 15).map((log, i) => (
                        <View key={i} style={styles.classItemRow}>
                          <View style={[styles.classIconPill, { backgroundColor: '#ecfdf5' }]}>
                            <CheckCircle2 size={16} color="#059669" />
                          </View>
                          
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>
                              {log.student_name || `Roll: ${log.roll_number}`}
                            </Text>
                            <Text style={{ fontSize: 10, color: '#64748b' }}>
                              Used OTP: {log.otp_used} • Time: {new Date(log.timestamp).toLocaleString()}
                            </Text>
                          </View>

                          <View style={{ backgroundColor: '#e6f4ea', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                            <Text style={{ color: '#137333', fontSize: 9, fontWeight: '900' }}>VERIFIED</Text>
                          </View>
                        </View>
                      ))}
                      {otpHistory.length === 0 && (
                        <Text style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', paddingVertical: 20 }}>
                          No historical verification logs found.
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* --- PANEL 6: EMOTIONAL QUESTIONS --- */}
            {activeTab === "questions" && (
              <View style={{ gap: 20 }}>
                <View style={{ borderBottomWidth: 1.5, borderBottomColor: '#f1f5f9', paddingBottom: 12 }}>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#1e293b' }}>Wellness Questions</Text>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 2 }}>
                    Design custom wellness questions presented to students on check-in.
                  </Text>
                </View>

                {/* Subtabs */}
                <View style={styles.segmentSelectorContainer}>
                  <TouchableOpacity 
                    onPress={() => setActiveQSubTab("manage")}
                    style={[styles.segmentBtn, activeQSubTab === "manage" && styles.segmentBtnActive]}
                  >
                    <Text style={[styles.segmentBtnText, activeQSubTab === "manage" && styles.segmentBtnTextActive]}>
                      Question Bank
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => setActiveQSubTab("history")}
                    style={[styles.segmentBtn, activeQSubTab === "history" && styles.segmentBtnActive]}
                  >
                    <Text style={[styles.segmentBtnText, activeQSubTab === "history" && styles.segmentBtnTextActive]}>
                      Daily Responses Log
                    </Text>
                  </TouchableOpacity>
                </View>

                {activeQSubTab === "manage" && (
                  <View style={{ gap: 16 }}>
                    {/* Questions list */}
                    <View style={styles.sectionInnerCard}>
                      <Text style={styles.sectionInnerTitle}>⏱️ Active Check-in Prompts</Text>
                      
                      <View style={{ gap: 10 }}>
                        {questionsList.map((q) => (
                          <View key={q.id} style={styles.classItemRow}>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>{q.text}</Text>
                              <Text style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                                Audience: {q.targetType.toUpperCase()} ({q.targetValue})
                              </Text>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                              <Switch 
                                value={q.enabled !== false} 
                                onValueChange={() => handleToggleQuestion(q.id)} 
                              />
                              <TouchableOpacity onPress={() => handleDeleteQuestion(q.id)}>
                                <Trash2 size={16} color="#ef4444" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                        {questionsList.length === 0 && (
                          <Text style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', paddingVertical: 20 }}>
                            No custom questions in bank. Global defaults will be used.
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Add question */}
                    <View style={styles.sectionInnerCard}>
                      <Text style={styles.sectionInnerTitle}>➕ Add Targeted Wellness Question</Text>
                      
                      <View style={{ gap: 12 }}>
                        <View>
                          <Text style={styles.inputLabel}>QUESTION PROMPT TEXT</Text>
                          <TextInput 
                            placeholder="e.g. Did you feel safe on the school bus today?"
                            value={newQText}
                            onChangeText={setNewQText}
                            style={styles.textInput}
                          />
                        </View>

                        <Text style={styles.inputLabel}>TARGET AUDIENCE</Text>
                        <View style={styles.segmentSelectorContainer}>
                          {["global", "class", "student"].map(aud => (
                            <TouchableOpacity 
                              key={aud}
                              onPress={() => {
                                setNewQTargetType(aud);
                                setNewQTargetValue("");
                                setNewQTargetSearch("");
                                setSelectedQStudent(null);
                              }}
                              style={[styles.segmentBtn, newQTargetType === aud && styles.segmentBtnActive]}
                            >
                              <Text style={[styles.segmentBtnText, newQTargetType === aud && styles.segmentBtnTextActive]}>
                                {aud.toUpperCase()}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>

                        {newQTargetType === "class" && (
                          <View>
                            <Text style={styles.inputLabel}>SELECT CLASS TARGET</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                              {Array.from(new Set(classesList.map(c => c.name))).map(clsName => (
                                <TouchableOpacity 
                                  key={clsName}
                                  onPress={() => setNewQTargetValue(clsName)}
                                  style={[
                                    styles.tabButton, 
                                    { paddingVertical: 6, paddingHorizontal: 12 },
                                    newQTargetValue === clsName ? { backgroundColor: '#f59e0b' } : { backgroundColor: '#f1f5f9' }
                                  ]}
                                >
                                  <Text style={{ fontSize: 11, fontWeight: '800', color: newQTargetValue === clsName ? '#fff' : '#475569' }}>
                                    {clsName}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        )}

                        {newQTargetType === "student" && (
                          <View>
                            <Text style={styles.inputLabel}>SEARCH STUDENT TARGET</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <TextInput 
                                placeholder="Type target student name or roll..."
                                value={newQTargetSearch}
                                onChangeText={text => {
                                  setNewQTargetSearch(text);
                                  setShowQSuggestions(text.length > 0);
                                }}
                                style={[styles.textInput, { flex: 1 }]}
                              />
                              <Search size={16} color="#64748b" style={{ position: 'absolute', right: 14 }} />
                            </View>

                            {/* Autocomplete Suggestions list */}
                            {showQSuggestions && (
                              <View style={styles.suggestionsContainer}>
                                {studentsList
                                  .filter(s => s.name.toLowerCase().includes(newQTargetSearch.toLowerCase()) || s.roll_number.toLowerCase().includes(newQTargetSearch.toLowerCase()))
                                  .slice(0, 4)
                                  .map(student => (
                                    <TouchableOpacity 
                                      key={student.roll_number}
                                      onPress={() => {
                                        setSelectedQStudent(student);
                                        setNewQTargetSearch(`${student.name} (${student.roll_number})`);
                                        setShowQSuggestions(false);
                                      }}
                                      style={styles.suggestionItem}
                                    >
                                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>{student.name}</Text>
                                      <Text style={{ fontSize: 10, color: '#64748b' }}>Roll: {student.roll_number} • Class: {student.class_name}</Text>
                                    </TouchableOpacity>
                                  ))}
                              </View>
                            )}
                          </View>
                        )}

                        <TouchableOpacity onPress={handleAddQuestion} style={[styles.addButton, { backgroundColor: '#f59e0b' }]}>
                          <Plus size={16} color="#fff" />
                          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>Enlist Prompt</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}

                {activeQSubTab === "history" && (
                  <View style={styles.sectionInnerCard}>
                    <Text style={styles.sectionInnerTitle}>💬 Student Answers Timeline</Text>
                    <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 14 }}>
                      Wellness checked-in details and students emotional prompt answers.
                    </Text>

                    <View style={{ gap: 10 }}>
                      {responsesHistory.slice(0, 15).map((resp, i) => (
                        <View key={i} style={styles.classItemRow}>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>
                                {resp.student_name || `Roll: ${resp.roll_number}`}
                              </Text>
                              <View style={{ backgroundColor: '#fef3c7', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                                <Text style={{ color: '#d97706', fontSize: 9, fontWeight: '900' }}>
                                  Score: {resp.mood_score || 5}/10
                                </Text>
                              </View>
                            </View>
                            <Text style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                              Q: "{resp.question_text || 'How are you feeling today?'}"
                            </Text>
                            <Text style={{ fontSize: 11, fontWeight: '800', color: '#0f172a', marginTop: 1 }}>
                              A: {resp.answer_text || 'No textual comments'}
                            </Text>
                          </View>
                          
                          <Text style={{ fontSize: 18 }}>
                            {resp.mood_score >= 8 ? '🤩' : resp.mood_score >= 6 ? 'Calm' : '😢'}
                          </Text>
                        </View>
                      ))}
                      {responsesHistory.length === 0 && (
                        <Text style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', paddingVertical: 20 }}>
                          No student response data available for today.
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* --- PANEL 7: NOTIFICATIONS --- */}
            {activeTab === "notifications" && (
              <View style={{ gap: 20 }}>
                <View style={{ borderBottomWidth: 1.5, borderBottomColor: '#f1f5f9', paddingBottom: 12 }}>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#1e293b' }}>Notifications Config</Text>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 2 }}>
                    Manage alert delivery channels, templates, and sensitivity limits.
                  </Text>
                </View>

                {/* Recipient email */}
                <View style={styles.sectionInnerCard}>
                  <Text style={styles.sectionInnerTitle}>✉️ Alert Recipient Email</Text>
                  <View style={{ gap: 12 }}>
                    <TextInput 
                      placeholder="Admin notification email address..."
                      value={adminNotificationEmail}
                      onChangeText={setAdminNotificationEmail}
                      keyboardType="email-address"
                      style={styles.textInput}
                    />
                  </View>
                </View>

                {/* Delivery Channels Grid */}
                <View style={styles.sectionInnerCard}>
                  <Text style={styles.sectionInnerTitle}>📡 Alert Delivery Channels</Text>
                  <View style={{ gap: 14 }}>
                    {Object.keys(notifChannels).map(channel => (
                      <View key={channel} style={{ borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 8 }}>
                        <Text style={{ fontSize: 12, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' }}>
                          {channel} notifications
                        </Text>
                        
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                          {["email", "push", "sms"].map(medium => (
                            <View key={medium} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b' }}>
                                {medium.toUpperCase()}
                              </Text>
                              <Switch 
                                value={notifChannels[channel][medium]}
                                onValueChange={v => setNotifChannels(prev => ({
                                  ...prev,
                                  [channel]: { ...prev[channel], [medium]: v }
                                }))}
                              />
                            </View>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Sensitivity level */}
                <View style={styles.sectionInnerCard}>
                  <Text style={styles.sectionInnerTitle}>🎚️ Emergency Alert Sensitivity</Text>
                  <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>
                    Control how aggressively alerts are triggered.
                  </Text>
                  
                  <View style={styles.segmentSelectorContainer}>
                    {["Low", "Medium", "High"].map(level => (
                      <TouchableOpacity 
                        key={level}
                        onPress={() => setNotifSensitivity(level as any)}
                        style={[styles.segmentBtn, notifSensitivity === level && styles.segmentBtnActive]}
                      >
                        <Text style={[styles.segmentBtnText, notifSensitivity === level && styles.segmentBtnTextActive]}>
                          {level}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Templates */}
                <View style={styles.sectionInnerCard}>
                  <Text style={styles.sectionInnerTitle}>📝 Message Templates</Text>
                  <View style={{ gap: 12 }}>
                    <View>
                      <Text style={styles.inputLabel}>WELLNESS CRITICAL ALERT TEMPLATE</Text>
                      <TextInput 
                        multiline
                        value={notifTemplates.wellness}
                        onChangeText={text => setNotifTemplates(prev => ({ ...prev, wellness: text }))}
                        style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
                      />
                    </View>

                    <View>
                      <Text style={styles.inputLabel}>ATTENDANCE TRIGGER TEMPLATE</Text>
                      <TextInput 
                        multiline
                        value={notifTemplates.attendance}
                        onChangeText={text => setNotifTemplates(prev => ({ ...prev, attendance: text }))}
                        style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
                      />
                    </View>

                    <View>
                      <Text style={styles.inputLabel}>PARENT UPDATE TEMPLATE</Text>
                      <TextInput 
                        multiline
                        value={notifTemplates.parent}
                        onChangeText={text => setNotifTemplates(prev => ({ ...prev, parent: text }))}
                        style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
                      />
                    </View>
                  </View>
                </View>

                <TouchableOpacity onPress={handleSave} disabled={isSaving} style={styles.primaryGradientSaveBtn}>
                  {isSaving ? <ActivityIndicator size="small" color="#fff" /> : <Save size={16} color="#fff" />}
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '900' }}>Save Notifications Config</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* --- PANEL 8: PRIVACY & SECURITY --- */}
            {activeTab === "security" && (
              <View style={{ gap: 20 }}>
                <View style={{ borderBottomWidth: 1.5, borderBottomColor: '#f1f5f9', paddingBottom: 12 }}>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#1e293b' }}>Privacy & Security</Text>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 2 }}>
                    Manage data security rules, JWT keys, timeouts, and admin audit logs.
                  </Text>
                </View>

                {/* Session Timeout */}
                <View style={styles.sectionInnerCard}>
                  <Text style={styles.sectionInnerTitle}>⏳ Session Timeout Interval</Text>
                  <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>
                    Log out admin sessions automatically after {sessionTimeout} minutes of inactivity.
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Sliders size={18} color="#64748b" />
                    <TextInput 
                      keyboardType="numeric"
                      value={String(sessionTimeout)}
                      onChangeText={v => setSessionTimeout(Number(v) || 0)}
                      style={[styles.textInput, { flex: 1 }]}
                    />
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>Minutes</Text>
                  </View>
                </View>

                {/* JWT Secret */}
                <View style={styles.sectionInnerCard}>
                  <Text style={styles.sectionInnerTitle}>🔑 Web Token JWT Secret Key</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput 
                      value={showJwt ? jwtSecret : "••••••••••••••••••••••••••••••••"}
                      editable={showJwt}
                      onChangeText={setJwtSecret}
                      style={[styles.textInput, { flex: 1, fontFamily: 'monospace', fontSize: 11 }]}
                    />
                    <View style={{ position: 'absolute', right: 10, flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity onPress={() => setShowJwt(!showJwt)}>
                        {showJwt ? <EyeOff size={16} color="#64748b" /> : <Eye size={16} color="#64748b" />}
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleCopyJwt}>
                        <Copy size={16} color="#64748b" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* switches toggles */}
                <View style={styles.sectionInnerCard}>
                  <Text style={styles.sectionInnerTitle}>🛡️ Security Controls</Text>
                  <View style={{ gap: 12 }}>
                    <View style={styles.rowToggle}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>Multi-Device Logins</Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }}>Allow simultaneous admin dashboard sessions</Text>
                      </View>
                      <Switch 
                        value={secToggles.multiDevice} 
                        onValueChange={v => setSecToggles(prev => ({ ...prev, multiDevice: v }))} 
                      />
                    </View>

                    <View style={styles.rowToggle}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>Parent Portal Consent Gate</Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }}>Require digital consent for parent telemetry access</Text>
                      </View>
                      <Switch 
                        value={secToggles.consent} 
                        onValueChange={v => setSecToggles(prev => ({ ...prev, consent: v }))} 
                      />
                    </View>

                    <View style={styles.rowToggle}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>Automatic Cloud Backups</Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }}>Initiate automated DB snapshots hourly</Text>
                      </View>
                      <Switch 
                        value={secToggles.backup} 
                        onValueChange={v => setSecToggles(prev => ({ ...prev, backup: v }))} 
                      />
                    </View>

                    <View style={styles.rowToggle}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>IP Restriction Filter</Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }}>Limit DB access to whitelist IP gateways</Text>
                      </View>
                      <Switch 
                        value={secToggles.ipRestrict} 
                        onValueChange={v => setSecToggles(prev => ({ ...prev, ipRestrict: v }))} 
                      />
                    </View>

                    <View style={styles.rowToggle}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>System Audit Logging</Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }}>Trace modifications on student rosters</Text>
                      </View>
                      <Switch 
                        value={secToggles.audit} 
                        onValueChange={v => setSecToggles(prev => ({ ...prev, audit: v }))} 
                      />
                    </View>
                  </View>
                </View>

                {/* Audit log Console */}
                <View style={styles.sectionInnerCard}>
                  <Text style={styles.sectionInnerTitle}>📜 Admin Activity Audit Trail</Text>
                  <View style={{ gap: 10 }}>
                    {auditLogs.slice(0, 10).map((log, i) => (
                      <View key={i} style={styles.classItemRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>
                            {log.action}
                          </Text>
                          <Text style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                            User: {log.username} • IP: {log.ip_address}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 9, color: '#94a3b8' }}>
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </Text>
                      </View>
                    ))}
                    {auditLogs.length === 0 && (
                      <Text style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', paddingVertical: 20 }}>
                        No recent admin modifications traced.
                      </Text>
                    )}
                  </View>
                </View>

                <TouchableOpacity onPress={handleSave} disabled={isSaving} style={styles.primaryGradientSaveBtn}>
                  {isSaving ? <ActivityIndicator size="small" color="#fff" /> : <Save size={16} color="#fff" />}
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '900' }}>Save Security Policies</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* --- PANEL 9: AI INSIGHTS --- */}
            {activeTab === "ai" && (
              <View style={{ gap: 20 }}>
                <View style={{ borderBottomWidth: 1.5, borderBottomColor: '#f1f5f9', paddingBottom: 12 }}>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#1e293b' }}>AI Intelligence settings</Text>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 2 }}>
                    Manage real-time predictive mood models, triggers, and weekly analytics.
                  </Text>
                </View>

                {/* status banner */}
                <View style={styles.aiStatusBanner}>
                  <Bot size={24} color="#059669" />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '900', color: '#065f46' }}>
                      AI PREDICTIVE SYSTEM ACTIVE
                    </Text>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: '#047857', marginTop: 1 }}>
                      Currently analyzing emotional profiles of {aiStats.students} students across {aiStats.classes} classes.
                    </Text>
                  </View>
                </View>

                {/* Live Trends Analytics */}
                <View style={styles.sectionInnerCard}>
                  <Text style={styles.sectionInnerTitle}>📈 Live AI Wellness Trend Traces</Text>
                  <View style={{ gap: 10 }}>
                    {aiInsightsList.map((ins, i) => (
                      <View key={i} style={styles.classItemRow}>
                        <View style={[styles.classIconPill, { backgroundColor: '#fef2f2' }]}>
                          <AlertTriangle size={15} color="#dc2626" />
                        </View>
                        
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 12, fontWeight: '800', color: '#1e293b' }}>
                            {ins.message}
                          </Text>
                          <Text style={{ fontSize: 10, color: '#dc2626', fontWeight: '800', marginTop: 2 }}>
                            Class: {ins.class_name} • Risk Factor: {ins.risk_factor}%
                          </Text>
                        </View>
                      </View>
                    ))}
                    {aiInsightsList.length === 0 && (
                      <Text style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', paddingVertical: 20 }}>
                        All student groups show stable, high-wellness emotional forecasts! 🌟
                      </Text>
                    )}
                  </View>
                </View>

                {/* Sensitivity thresholds */}
                <View style={styles.sectionInnerCard}>
                  <Text style={styles.sectionInnerTitle}>🎚️ AI Model Sensitivities</Text>
                  <View style={{ gap: 14 }}>
                    <View>
                      <Text style={styles.inputLabel}>EMOTIONAL ALERT THRESHOLD (SCORE &lt;= X)</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <TextInput 
                          keyboardType="numeric"
                          value={String(aiAlertThreshold)}
                          onChangeText={v => setAiAlertThreshold(Number(v) || 0)}
                          style={[styles.textInput, { flex: 1 }]}
                        />
                        <Text style={{ fontSize: 12, fontWeight: '800', color: '#1e293b' }}>Mood Rating Scale</Text>
                      </View>
                    </View>

                    <View>
                      <Text style={styles.inputLabel}>ATTENDANCE DROPOUT RISK TRIGGER PERCENTAGE</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <TextInput 
                          keyboardType="numeric"
                          value={String(aiAttendanceRisk)}
                          onChangeText={v => setAiAttendanceRisk(Number(v) || 0)}
                          style={[styles.textInput, { flex: 1 }]}
                        />
                        <Text style={{ fontSize: 12, fontWeight: '800', color: '#1e293b' }}>Percent (%)</Text>
                      </View>
                    </View>

                    <View>
                      <Text style={styles.inputLabel}>EMOTIONAL BURNOUT TIMEWINDOW LIMIT</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <TextInput 
                          keyboardType="numeric"
                          value={String(aiBurnoutDays)}
                          onChangeText={v => setAiBurnoutDays(Number(v) || 0)}
                          style={[styles.textInput, { flex: 1 }]}
                        />
                        <Text style={{ fontSize: 12, fontWeight: '800', color: '#1e293b' }}>Consecutive Days</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* AI feature switches */}
                <View style={styles.sectionInnerCard}>
                  <Text style={styles.sectionInnerTitle}>🧠 AI Features Configuration</Text>
                  <View style={{ gap: 12 }}>
                    <View style={styles.rowToggle}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>AI Analytics Engine</Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }}>Activate real-time emotional telemetry scans</Text>
                      </View>
                      <Switch 
                        value={aiToggles.aiEngine} 
                        onValueChange={v => setAiToggles(prev => ({ ...prev, aiEngine: v }))} 
                      />
                    </View>

                    <View style={styles.rowToggle}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>Predictive Mood Shifts</Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }}>Forecast emotional low shifts based on timeline models</Text>
                      </View>
                      <Switch 
                        value={aiToggles.predictive} 
                        onValueChange={v => setAiToggles(prev => ({ ...prev, predictive: v }))} 
                      />
                    </View>

                    <View style={styles.rowToggle}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>Attendance Correlation</Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }}>Cross-check academic absence with mood score dips</Text>
                      </View>
                      <Switch 
                        value={aiToggles.correlation} 
                        onValueChange={v => setAiToggles(prev => ({ ...prev, correlation: v }))} 
                      />
                    </View>

                    <View style={styles.rowToggle}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>Auto-Trigger Alerts</Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }}>Push notification emails directly to admins during burnout detection</Text>
                      </View>
                      <Switch 
                        value={aiToggles.autoAlert} 
                        onValueChange={v => setAiToggles(prev => ({ ...prev, autoAlert: v }))} 
                      />
                    </View>
                  </View>
                </View>

                <TouchableOpacity onPress={handleSave} disabled={isSaving} style={[styles.primaryGradientSaveBtn, { backgroundColor: '#10b981', shadowColor: '#10b981' }]}>
                  {isSaving ? <ActivityIndicator size="small" color="#fff" /> : <Save size={16} color="#fff" />}
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '900' }}>Save AI Settings</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* --- PANEL 10: ADVANCED --- */}
            {activeTab === "advanced" && (
              <View style={{ gap: 20 }}>
                <View style={{ borderBottomWidth: 1.5, borderBottomColor: '#f1f5f9', paddingBottom: 12 }}>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#1e293b' }}>Advanced Settings</Text>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 2 }}>
                    Manage data backups, webhooks, system logs, and factory reset parameters.
                  </Text>
                </View>

                {/* System Health Grid */}
                <View style={styles.sectionInnerCard}>
                  <Text style={styles.sectionInnerTitle}>🏥 Core System Diagnostics</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    <View style={styles.diagnosticCard}>
                      <Text style={{ fontSize: 10, color: '#64748b', fontWeight: '900' }}>API LATENCY</Text>
                      <Text style={{ fontSize: 16, fontWeight: '900', color: '#059669', marginTop: 2 }}>
                        {sysHealth.api}ms
                      </Text>
                      <Text style={{ fontSize: 8, color: '#059669', fontWeight: '800' }}>99.9% UPTIME</Text>
                    </View>

                    <View style={styles.diagnosticCard}>
                      <Text style={{ fontSize: 10, color: '#64748b', fontWeight: '900' }}>DB INTEGRITY</Text>
                      <Text style={{ fontSize: 16, fontWeight: '900', color: '#059669', marginTop: 2 }}>
                        {sysHealth.db}%
                      </Text>
                      <Text style={{ fontSize: 8, color: '#059669', fontWeight: '800' }}>HEALTHY</Text>
                    </View>

                    <View style={styles.diagnosticCard}>
                      <Text style={{ fontSize: 10, color: '#64748b', fontWeight: '900' }}>SYS MEMORY</Text>
                      <Text style={{ fontSize: 16, fontWeight: '900', color: '#eab308', marginTop: 2 }}>
                        {sysHealth.memory}%
                      </Text>
                      <Text style={{ fontSize: 8, color: '#eab308', fontWeight: '800' }}>OPTIMIZED</Text>
                    </View>

                    <View style={styles.diagnosticCard}>
                      <Text style={{ fontSize: 10, color: '#64748b', fontWeight: '900' }}>UPTIME</Text>
                      <Text style={{ fontSize: 14, fontWeight: '900', color: '#3b82f6', marginTop: 4 }}>
                        {sysHealth.uptime}
                      </Text>
                      <Text style={{ fontSize: 8, color: '#3b82f6', fontWeight: '800' }}>ACTIVE SESSION</Text>
                    </View>
                  </View>
                </View>

                {/* API and Webhooks */}
                <View style={styles.sectionInnerCard}>
                  <Text style={styles.sectionInnerTitle}>🔌 API & Webhook Integrations</Text>
                  
                  <View style={{ gap: 12 }}>
                    <View>
                      <Text style={styles.inputLabel}>DEVELOPER SECRET API ACCESS KEY</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput 
                          value={apiKey}
                          editable={false}
                          style={[styles.textInput, { flex: 1, fontFamily: 'monospace', fontSize: 11, backgroundColor: '#f1f5f9' }]}
                        />
                        <TouchableOpacity 
                          onPress={() => {
                            Clipboard.setString(apiKey);
                            Alert.alert("Copied", "Secret API key copied to clipboard!");
                          }}
                          style={{ position: 'absolute', right: 14 }}
                        >
                          <Copy size={16} color="#64748b" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View>
                      <Text style={styles.inputLabel}>OUTBOUND WEBHOOK GATEWAY ENDPOINT</Text>
                      <TextInput 
                        placeholder="https://yourserver.com/api/webhook"
                        value={webhookUrl}
                        onChangeText={setWebhookUrl}
                        style={styles.textInput}
                      />
                    </View>
                  </View>
                </View>

                {/* Data actions */}
                <View style={styles.sectionInnerCard}>
                  <Text style={styles.sectionInnerTitle}>🗄️ Database Management</Text>
                  
                  <View style={{ gap: 10 }}>
                    <TouchableOpacity 
                      onPress={handleBackupDatabase}
                      disabled={isBackingUp}
                      style={styles.actionBtnSecondary}
                    >
                      {isBackingUp ? <ActivityIndicator size="small" color="#9333ea" /> : <Database size={15} color="#9333ea" />}
                      <Text style={{ color: '#9333ea', fontWeight: '800', fontSize: 13 }}>Backup Cloud Database</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      onPress={handleExportDatabase}
                      disabled={isExporting}
                      style={[styles.actionBtnSecondary, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}
                    >
                      {isExporting ? <ActivityIndicator size="small" color="#2563eb" /> : <ExternalLink size={15} color="#2563eb" />}
                      <Text style={{ color: '#2563eb', fontWeight: '800', fontSize: 13 }}>Export Roster JSON Dump</Text>
                    </TouchableOpacity>

                    {lastBackup && (
                      <Text style={{ fontSize: 10, color: '#059669', textAlign: 'center', fontWeight: '700' }}>
                        Last Successful Backup: {lastBackup}
                      </Text>
                    )}

                    <TouchableOpacity 
                      onPress={handleResetAdvanced}
                      style={styles.dangerButton}
                    >
                      <AlertTriangle size={15} color="#fff" />
                      <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>Factory Reset Roster Database</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* System Toggles */}
                <View style={styles.sectionInnerCard}>
                  <Text style={styles.sectionInnerTitle}>⚙️ Features Configuration</Text>
                  <View style={{ gap: 12 }}>
                    <View style={styles.rowToggle}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>Visual Animations</Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }}>Activate motion transit graphics inside app screens</Text>
                      </View>
                      <Switch 
                        value={advToggles.animations} 
                        onValueChange={v => setAdvToggles(prev => ({ ...prev, animations: v }))} 
                      />
                    </View>

                    <View style={styles.rowToggle}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>Audio Sound Effects</Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }}>Play sound alerts during student check-in clicks</Text>
                      </View>
                      <Switch 
                        value={advToggles.sounds} 
                        onValueChange={v => setAdvToggles(prev => ({ ...prev, sounds: v }))} 
                      />
                    </View>

                    <View style={styles.rowToggle}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>Parent Portal Interface</Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }}>Support parent device login credentials endpoints</Text>
                      </View>
                      <Switch 
                        value={advToggles.parentPortal} 
                        onValueChange={v => setAdvToggles(prev => ({ ...prev, parentPortal: v }))} 
                      />
                    </View>

                    <View style={styles.rowToggle}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>Production Mode</Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }}>Optimize React bundle operations & secure endpoints</Text>
                      </View>
                      <Switch 
                        value={advToggles.productionMode} 
                        onValueChange={v => setAdvToggles(prev => ({ ...prev, productionMode: v }))} 
                      />
                    </View>

                    <View style={styles.rowToggle}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>Trace Debug Logging</Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }}>Store telemetry diagnostic trace strings</Text>
                      </View>
                      <Switch 
                        value={advToggles.debugMode} 
                        onValueChange={v => setAdvToggles(prev => ({ ...prev, debugMode: v }))} 
                      />
                    </View>
                  </View>
                </View>

                {/* Debug console */}
                <View style={styles.sectionInnerCard}>
                  <Text style={styles.sectionInnerTitle}>📟 Diagnostic Console Log</Text>
                  <ScrollView style={styles.consoleContainer}>
                    {sysLogs.map((logStr, idx) => (
                      <Text key={idx} style={styles.consoleText}>
                        {logStr}
                      </Text>
                    ))}
                    {sysLogs.length === 0 && (
                      <Text style={styles.consoleText}>
                        [SYSTEM DEBUG] Listening on REST API endpoint triggers...
                      </Text>
                    )}
                  </ScrollView>
                </View>

                <TouchableOpacity onPress={handleSave} disabled={isSaving} style={styles.primaryGradientSaveBtn}>
                  {isSaving ? <ActivityIndicator size="small" color="#fff" /> : <Save size={16} color="#fff" />}
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '900' }}>Save Advanced Config</Text>
                </TouchableOpacity>
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
  },
  sectionInnerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8
  },
  sectionInnerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 14
  },
  logoThumbnailBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  logoThumbnailImage: {
    width: '100%',
    height: '100%'
  },
  colorPreviewDotSquare: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  primaryGradientSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#a855f7',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 10
  },
  segmentSelectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 4,
    borderRadius: 12,
    gap: 4
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8
  },
  segmentBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  segmentBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b'
  },
  segmentBtnTextActive: {
    color: '#0f172a'
  },
  brandingColorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  numberBadgeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  colorPreviewBlockSquare: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  brandingColorInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    width: 80,
    backgroundColor: '#f8fafc',
    textAlign: 'center'
  },
  scoreBadgeBox: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center'
  },
  scoreBadgeCount: {
    fontSize: 20,
    fontWeight: '900'
  },
  scoreBadgeLabel: {
    fontSize: 8,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.5
  },
  classItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 12
  },
  classIconPill: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    marginTop: 4,
    padding: 4,
    maxHeight: 160
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  modalContentCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a'
  },
  aiStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    padding: 14,
    borderRadius: 16,
    gap: 12
  },
  diagnosticCard: {
    width: (width - 92) / 2,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12
  },
  consoleContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    height: 120
  },
  consoleText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#10b981',
    lineHeight: 14
  }
});
