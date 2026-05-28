import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  Modal, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator, 
  Dimensions, 
  Switch 
} from 'react-native';
import { 
  Search, 
  MoreVertical, 
  ShieldAlert, 
  HeartPulse, 
  ShieldCheck, 
  UserPlus, 
  Upload, 
  X, 
  Save, 
  CheckCircle2, 
  Users, 
  AlertTriangle, 
  BarChart2, 
  Lightbulb, 
  ClipboardList, 
  Pencil, 
  AlertOctagon, 
  Calendar, 
  UserCheck, 
  UserX, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Eye, 
  Download, 
  Trash2,
  Lock,
  Smile
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
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

export default function StudentsScreen() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive" | "present">("all");
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Add Form state
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastInitial, setNewLastInitial] = useState("");
  const [newRollNumber, setNewRollNumber] = useState("");
  const [newClass, setNewClass] = useState("");
  const [newOtp, setNewOtp] = useState("");
  const [newParentConsent, setNewParentConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail Modal internal tab
  const [detailTab, setDetailTab] = useState<"timeline" | "edit" | "consent">("timeline");
  
  // Edit Form state (bound to selectedStudent)
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastInitial, setEditLastInitial] = useState("");
  const [editClass, setEditClass] = useState("");
  const [editOtp, setEditOtp] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [editParentConsent, setEditParentConsent] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [studentsRes, classesRes] = await Promise.all([
        fetch(`${API_URL}/students`),
        fetch(`${API_URL}/settings/classes`)
      ]);
      
      if (studentsRes.ok) {
        setStudents(await studentsRes.json());
      }
      if (classesRes.ok) {
        const classData = await classesRes.json();
        setClasses(Array.isArray(classData) ? classData : (classData.classes || []));
      }
    } catch (e) {
      console.error("Failed to fetch dashboard data", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!newFirstName || !newLastInitial || !newRollNumber || !newClass || !newOtp) {
      Alert.alert("Missing Fields", "Please complete all fields to add a student.");
      return;
    }
    
    setIsSubmitting(true);
    const payload = {
      firstName: newFirstName.trim(),
      lastInitial: newLastInitial.trim().toUpperCase(),
      rollNumber: newRollNumber.trim().toUpperCase(),
      class: newClass,
      otp: newOtp.trim(),
      parentConsent: newParentConsent,
      status: "active",
      timeline: []
    };

    try {
      const res = await fetch(`${API_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Alert.alert("Success", `${newFirstName} has been enrolled successfully!`);
        setIsAddModalOpen(false);
        // Clear inputs
        setNewFirstName("");
        setNewLastInitial("");
        setNewRollNumber("");
        setNewClass("");
        setNewOtp("");
        setNewParentConsent(true);
        // Refresh list
        fetchData();
      } else {
        const err = await res.json().catch(() => ({}));
        Alert.alert("Failed", err.message || "Failed to enroll student.");
      }
    } catch (e) {
      Alert.alert("Network Error", "Unable to contact the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDetail = (student: any) => {
    setSelectedStudent(student);
    setEditFirstName(student.firstName);
    setEditLastInitial(student.lastInitial || "");
    setEditClass(student.class_name || student.class || "");
    setEditOtp(student.otp ? (typeof student.otp === 'object' ? student.otp.code : student.otp) : "");
    setEditStatus(student.status || "active");
    setEditParentConsent(student.parentConsent !== false);
    setDetailTab("timeline");
    setIsDetailModalOpen(true);
  };

  const handleUpdateStudent = async () => {
    if (!selectedStudent) return;
    if (!editFirstName || !editLastInitial || !editClass) {
      Alert.alert("Missing Fields", "Please enter first name, last initial, and class.");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      ...selectedStudent,
      firstName: editFirstName.trim(),
      lastInitial: editLastInitial.trim().toUpperCase(),
      class: editClass,
      otp: editOtp.trim(),
      status: editStatus,
      parentConsent: editParentConsent
    };

    try {
      const res = await fetch(`${API_URL}/students/${selectedStudent.rollNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Alert.alert("Success", "Student records updated successfully!");
        setIsDetailModalOpen(false);
        fetchData();
      } else {
        const err = await res.json().catch(() => ({}));
        Alert.alert("Failed", err.message || "Failed to update record.");
      }
    } catch (e) {
      Alert.alert("Network Error", "Unable to update student records.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    Alert.alert(
      "Confirm Deletion",
      `Are you absolutely sure you want to remove ${selectedStudent.firstName} ${selectedStudent.lastInitial}? This action is permanent.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete Student", 
          style: "destructive", 
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/students/${selectedStudent.rollNumber}`, {
                method: 'DELETE'
              });
              if (res.ok) {
                Alert.alert("Removed", "Student profile has been deleted.");
                setIsDetailModalOpen(false);
                fetchData();
              } else {
                Alert.alert("Failed", "Failed to delete student records.");
              }
            } catch (e) {
              Alert.alert("Network Error", "Unable to delete student.");
            }
          }
        }
      ]
    );
  };

  const activeStudents = students.filter(s => s.status !== "inactive");
  const inactiveStudents = students.filter(s => s.status === "inactive");
  
  const getFilteredList = () => {
    let list = students;
    if (activeTab === "active") list = activeStudents;
    else if (activeTab === "inactive") list = inactiveStudents;
    else if (activeTab === "present") {
      list = students.filter(s => s.timeline?.some((e: any) => e.day === "Today" || e.date === getUSATodayDateStr()));
    }
    
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(s => 
        s.firstName.toLowerCase().includes(q) || 
        s.rollNumber.toLowerCase().includes(q) ||
        (s.lastInitial && s.lastInitial.toLowerCase().includes(q))
      );
    }
    return list;
  };

  const filteredStudents = getFilteredList();

  const getMoodColor = (score: number) => {
    if (score >= 8) return '#22c55e'; // Green
    if (score >= 5) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
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
          <Text style={{ fontSize: 26, fontWeight: '900', color: '#1e293b', letterSpacing: -0.5 }}>Student Profiles</Text>
          <Text style={{ fontSize: 15, fontWeight: '500', color: '#64748b', marginTop: 4 }}>Manage and track your students' wellness.</Text>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14, paddingVertical: 12 }}>
            <Upload size={16} color="#1e293b" style={{ marginRight: 8 }} />
            <Text style={{ color: '#1e293b', fontWeight: '800', fontSize: 15 }}>Bulk CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsAddModalOpen(true)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#9333ea', borderRadius: 14, paddingVertical: 12 }}>
            <UserPlus size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Add Student</Text>
          </TouchableOpacity>
        </View>

        {/* Stat Squares Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          {[
            { id: "all", label: "ALL ENROLLED", value: students.length, icon: Users, color: "#3b82f6", bg: "#eff6ff" },
            { id: "active", label: "ACTIVE", value: activeStudents.length, icon: UserCheck, color: "#16a34a", bg: "#f0fdf4" },
            { id: "inactive", label: "INACTIVE", value: inactiveStudents.length, icon: UserX, color: "#dc2626", bg: "#fef2f2" },
            { id: "present", label: "PRESENT TODAY", value: students.filter(s => s.timeline?.some((e: any) => e.day === "Today" || e.date === getUSATodayDateStr())).length, icon: CheckCircle2, color: "#9333ea", bg: "#faf5ff" },
          ].map((tab) => (
            <TouchableOpacity 
              key={tab.id} 
              onPress={() => setActiveTab(tab.id as any)}
              activeOpacity={0.8}
              style={{ 
                width: (width - 50) / 2, 
                backgroundColor: tab.bg, 
                borderWidth: activeTab === tab.id ? 2 : 1, 
                borderColor: activeTab === tab.id ? tab.color : '#f1f5f9', 
                borderRadius: 20, 
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: activeTab === tab.id ? 0.08 : 0,
                shadowRadius: 6,
                elevation: activeTab === tab.id ? 1 : 0
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <tab.icon size={20} color={tab.color} />
                <Text style={{ fontSize: 24, fontWeight: '900', color: tab.color }}>{tab.value}</Text>
              </View>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', letterSpacing: 0.5 }}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.02, shadowRadius: 5, marginBottom: 24 }}>
          <Search size={20} color="#94a3b8" />
          <TextInput 
            placeholder="Search students by name or roll..." 
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={{ flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '500', color: '#334155' }}
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* List of Students */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#9333ea" style={{ marginTop: 20 }} />
        ) : (
          <View style={{ gap: 14 }}>
            {filteredStudents.map(student => {
              const checkedInToday = student.timeline?.find((e: any) => e.day === "Today" || e.date === getUSATodayDateStr());
              return (
                <TouchableOpacity 
                  key={student.rollNumber} 
                  onPress={() => handleOpenDetail(student)}
                  activeOpacity={0.8}
                  style={{ backgroundColor: '#fff', padding: 16, borderRadius: 24, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#f8fafc' }}
                >
                  <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#faf5ff', alignItems: 'center', justifyContent: 'center', marginRight: 16, overflow: 'hidden', borderWidth: 2, borderColor: '#e9d5ff' }}>
                    {student.profilePhoto ? (
                      <Image source={{ uri: student.profilePhoto }} style={{ width: 50, height: 50 }} />
                    ) : (
                      <Text style={{ fontSize: 18, fontWeight: '900', color: '#a855f7' }}>{student.firstName[0]}</Text>
                    )}
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#1e293b' }}>
                      {student.firstName} {student.lastInitial}.
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748b', marginTop: 3 }}>
                      Roll: {student.rollNumber} • {student.class}
                    </Text>
                  </View>

                  {/* Status Indicator */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    {checkedInToday ? (
                      <View style={{ backgroundColor: getMoodBg(checkedInToday.score), paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={{ fontSize: 15 }}>{checkedInToday.emoji || '😊'}</Text>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: getMoodColor(checkedInToday.score) }}>{checkedInToday.score}/10</Text>
                      </View>
                    ) : (
                      <View style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 }}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b' }}>PENDING</Text>
                      </View>
                    )}
                    <ChevronRight size={18} color="#cbd5e1" />
                  </View>
                </TouchableOpacity>
              );
            })}
            
            {filteredStudents.length === 0 && (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#94a3b8' }}>No students found</Text>
              </View>
            )}
          </View>
        )}

      </ScrollView>

      {/* Add Student Modal */}
      <Modal visible={isAddModalOpen} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, maxHeight: '85%' }}>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 22, fontWeight: '900', color: '#1e293b' }}>Enrol New Student</Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)} style={{ backgroundColor: '#f1f5f9', padding: 8, borderRadius: 20 }}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 40 }}>
              
              <View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>FIRST NAME</Text>
                <TextInput 
                  placeholder="e.g. John" 
                  value={newFirstName} 
                  onChangeText={setNewFirstName}
                  style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: '#1e293b' }}
                />
              </View>

              <View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>LAST INITIAL</Text>
                <TextInput 
                  placeholder="e.g. D (single letter)" 
                  value={newLastInitial} 
                  onChangeText={setNewLastInitial}
                  maxLength={1}
                  style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: '#1e293b' }}
                />
              </View>

              <View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>ROLL NUMBER</Text>
                <TextInput 
                  placeholder="e.g. A105" 
                  value={newRollNumber} 
                  onChangeText={setNewRollNumber}
                  style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: '#1e293b' }}
                />
              </View>

              <View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>ASSIGNED CLASS</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {classes.length > 0 ? classes.map((c, idx) => {
                    const cName = typeof c === 'string' ? c : c.name;
                    return (
                      <TouchableOpacity 
                        key={`${cName}-${idx}`}
                        onPress={() => setNewClass(cName)}
                        style={{ backgroundColor: newClass === cName ? '#faf5ff' : '#f8fafc', borderWidth: 1.5, borderColor: newClass === cName ? '#9333ea' : '#cbd5e1', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 }}
                      >
                        <Text style={{ color: newClass === cName ? '#9333ea' : '#475569', fontWeight: '800', fontSize: 13 }}>{cName}</Text>
                      </TouchableOpacity>
                    );
                  }) : (
                    ['Pre-K', 'Kindergarten', 'Grade 1'].map((cName) => (
                      <TouchableOpacity 
                        key={cName}
                        onPress={() => setNewClass(cName)}
                        style={{ backgroundColor: newClass === cName ? '#faf5ff' : '#f8fafc', borderWidth: 1.5, borderColor: newClass === cName ? '#9333ea' : '#cbd5e1', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 }}
                      >
                        <Text style={{ color: newClass === cName ? '#9333ea' : '#475569', fontWeight: '800', fontSize: 13 }}>{cName}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              </View>

              <View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>4-DIGIT OTP PASSWORD</Text>
                <TextInput 
                  placeholder="e.g. 1234" 
                  value={newOtp} 
                  onChangeText={setNewOtp}
                  maxLength={4}
                  keyboardType="numeric"
                  style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: '#1e293b' }}
                />
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, marginTop: 8 }}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>Parental Consent Form</Text>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 2 }}>Mark parent consent paperwork as approved</Text>
                </View>
                <Switch value={newParentConsent} onValueChange={setNewParentConsent} trackColor={{ true: '#a855f7' }} />
              </View>

              <TouchableOpacity 
                onPress={handleAddStudent} 
                disabled={isSubmitting}
                style={{ backgroundColor: '#9333ea', borderRadius: 18, paddingVertical: 16, alignItems: 'center', marginTop: 12 }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Enroll Student</Text>
                )}
              </TouchableOpacity>

            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Detail & Edit Modal */}
      {selectedStudent && (
        <Modal visible={isDetailModalOpen} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, height: height * 0.85 }}>
              
              {/* Header inside modal */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#fdf2f8', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#fbcfe8' }}>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: '#db2777' }}>{selectedStudent.firstName[0]}</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: '#1e293b' }}>{selectedStudent.firstName} {selectedStudent.lastInitial}.</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b' }}>Roll: {selectedStudent.rollNumber} • {selectedStudent.class}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setIsDetailModalOpen(false)} style={{ backgroundColor: '#f1f5f9', padding: 8, borderRadius: 20 }}>
                  <X size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              {/* Sub-Tabs */}
              <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', marginBottom: 20 }}>
                {[
                  { id: "timeline", label: "Timeline", icon: Clock },
                  { id: "edit", label: "Edit Profile", icon: Pencil },
                  { id: "consent", label: "Consent Documents", icon: ShieldCheck }
                ].map((tab) => (
                  <TouchableOpacity 
                    key={tab.id}
                    onPress={() => setDetailTab(tab.id as any)}
                    style={{ flex: 1, alignItems: 'center', paddingBottom: 12, borderBottomWidth: detailTab === tab.id ? 2 : 0, borderColor: '#9333ea' }}
                  >
                    <tab.icon size={16} color={detailTab === tab.id ? '#9333ea' : '#64748b'} style={{ marginBottom: 4 }} />
                    <Text style={{ fontSize: 12, fontWeight: '800', color: detailTab === tab.id ? '#9333ea' : '#64748b' }}>{tab.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Modal scroll area */}
              <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                
                {detailTab === "timeline" && (
                  <View style={{ gap: 16 }}>
                    <Text style={{ fontSize: 16, fontWeight: '900', color: '#1e293b' }}>Attendance & Wellness Timeline</Text>
                    
                    {/* SVG/Visually styled mood graph container */}
                    <View style={{ backgroundColor: '#faf5ff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#e9d5ff' }}>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#9333ea', marginBottom: 12 }}>Wellness Pattern</Text>
                      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-end', height: 60, justifyContent: 'space-between', paddingHorizontal: 8 }}>
                        {(selectedStudent.timeline || [
                          { day: "Day 1", score: 8 },
                          { day: "Day 2", score: 6 },
                          { day: "Day 3", score: 9 },
                          { day: "Day 4", score: 7 },
                          { day: "Day 5", score: 8 }
                        ]).map((t: any, idx: number) => (
                          <View key={idx} style={{ alignItems: 'center', flex: 1 }}>
                            <View style={{ width: 14, height: (t.score || 7) * 5, backgroundColor: getMoodColor(t.score || 7), borderRadius: 6 }} />
                            <Text style={{ fontSize: 9, fontWeight: '800', color: '#64748b', marginTop: 6 }}>{t.day || `D${idx+1}`}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Timeline List */}
                    <View style={{ gap: 12 }}>
                      {(selectedStudent.timeline && selectedStudent.timeline.length > 0) ? (
                        selectedStudent.timeline.map((entry: any, index: number) => (
                          <View key={index} style={{ borderLeftWidth: 2, borderColor: '#e2e8f0', marginLeft: 10, paddingLeft: 16, paddingBottom: 4 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: getMoodColor(entry.score), marginLeft: -21 }} />
                              <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>{entry.day || "Today"}</Text>
                              <View style={{ backgroundColor: getMoodBg(entry.score), paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                                <Text style={{ fontSize: 10, fontWeight: '800', color: getMoodColor(entry.score) }}>Score: {entry.score}/10</Text>
                              </View>
                            </View>

                            <View style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 16, marginTop: 4 }}>
                              {entry.emotions && entry.emotions.length > 0 && (
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                                  {entry.emotions.map((em: string) => (
                                    <View key={em} style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                                      <Text style={{ fontSize: 10, fontWeight: '800', color: '#475569' }}>{em}</Text>
                                    </View>
                                  ))}
                                </View>
                              )}
                              {entry.journal_text ? (
                                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start' }}>
                                  <Lock size={12} color="#94a3b8" style={{ marginTop: 2 }} />
                                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569', fontStyle: 'italic', lineHeight: 18 }}>
                                    "{entry.journal_text}"
                                  </Text>
                                </View>
                              ) : (
                                <Text style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>No private thoughts shared.</Text>
                              )}
                            </View>
                          </View>
                        ))
                      ) : (
                        <View style={{ padding: 24, alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 20 }}>
                          <Smile size={32} color="#cbd5e1" style={{ marginBottom: 8 }} />
                          <Text style={{ fontSize: 13, fontWeight: '700', color: '#94a3b8' }}>No daily check-ins recorded yet.</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {detailTab === "edit" && (
                  <View style={{ gap: 16 }}>
                    <Text style={{ fontSize: 16, fontWeight: '900', color: '#1e293b' }}>Modify Student Details</Text>
                    
                    <View>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>FIRST NAME</Text>
                      <TextInput 
                        placeholder="First Name" 
                        value={editFirstName} 
                        onChangeText={setEditFirstName}
                        style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: '#1e293b' }}
                      />
                    </View>

                    <View>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>LAST INITIAL</Text>
                      <TextInput 
                        placeholder="Last Initial" 
                        value={editLastInitial} 
                        onChangeText={setEditLastInitial}
                        maxLength={1}
                        style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: '#1e293b' }}
                      />
                    </View>

                    <View>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>CLASS</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {classes.length > 0 ? classes.map((c, idx) => {
                          const cName = typeof c === 'string' ? c : c.name;
                          return (
                            <TouchableOpacity 
                              key={`${cName}-${idx}`}
                              onPress={() => setEditClass(cName)}
                              style={{ backgroundColor: editClass === cName ? '#faf5ff' : '#f8fafc', borderWidth: 1.5, borderColor: editClass === cName ? '#9333ea' : '#cbd5e1', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 }}
                            >
                              <Text style={{ color: editClass === cName ? '#9333ea' : '#475569', fontWeight: '800', fontSize: 12 }}>{cName}</Text>
                            </TouchableOpacity>
                          );
                        }) : (
                          ['Pre-K', 'Kindergarten', 'Grade 1'].map((cName) => (
                            <TouchableOpacity 
                              key={cName}
                              onPress={() => setEditClass(cName)}
                              style={{ backgroundColor: editClass === cName ? '#faf5ff' : '#f8fafc', borderWidth: 1.5, borderColor: editClass === cName ? '#9333ea' : '#cbd5e1', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 }}
                            >
                              <Text style={{ color: editClass === cName ? '#9333ea' : '#475569', fontWeight: '800', fontSize: 12 }}>{cName}</Text>
                            </TouchableOpacity>
                          ))
                        )}
                      </View>
                    </View>

                    <View>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>OTP PASSWORD</Text>
                      <TextInput 
                        placeholder="OTP Password" 
                        value={editOtp} 
                        onChangeText={setEditOtp}
                        maxLength={4}
                        keyboardType="numeric"
                        style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: '#1e293b' }}
                      />
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: 14, borderRadius: 16 }}>
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>Enrollment Status</Text>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 2 }}>Toggle active status in classroom roster</Text>
                      </View>
                      <Switch 
                        value={editStatus === "active"} 
                        onValueChange={(val) => setEditStatus(val ? "active" : "inactive")} 
                        trackColor={{ true: '#a855f7' }}
                      />
                    </View>

                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                      <TouchableOpacity 
                        onPress={handleDeleteStudent}
                        style={{ flex: 1, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fca5a5', borderRadius: 16, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                      >
                        <Trash2 size={16} color="#ef4444" />
                        <Text style={{ color: '#ef4444', fontWeight: '800', fontSize: 14 }}>Delete student</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        onPress={handleUpdateStudent}
                        disabled={isSubmitting}
                        style={{ flex: 1, backgroundColor: '#9333ea', borderRadius: 16, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                      >
                        <Save size={16} color="#fff" />
                        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Save Changes</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {detailTab === "consent" && (
                  <View style={{ gap: 16 }}>
                    <Text style={{ fontSize: 16, fontWeight: '900', color: '#1e293b' }}>Parental Consent Form Records</Text>
                    
                    <View style={{ backgroundColor: editParentConsent ? '#f0fdf4' : '#fffbeb', borderWidth: 1.5, borderColor: editParentConsent ? '#86efac' : '#fcd34d', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                      {editParentConsent ? (
                        <ShieldCheck size={36} color="#16a34a" />
                      ) : (
                        <ShieldAlert size={36} color="#d97706" />
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '900', color: '#1e293b' }}>
                          {editParentConsent ? "Approved & Checked" : "Pending Document"}
                        </Text>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b', marginTop: 4, lineHeight: 18 }}>
                          {editParentConsent 
                            ? "Signed consent details are safely uploaded on system server databases."
                            : "Awaiting physical paperwork or upload before enabling check-ins."}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: 14, borderRadius: 16, marginTop: 8 }}>
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>Sign-off Status</Text>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 2 }}>Manual override parental signature</Text>
                      </View>
                      <Switch value={editParentConsent} onValueChange={setEditParentConsent} trackColor={{ true: '#10b981' }} />
                    </View>

                    <TouchableOpacity style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 16, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                      <Upload size={16} color="#475569" />
                      <Text style={{ color: '#475569', fontWeight: '800', fontSize: 14 }}>Upload Signed Scan (PDF/JPG)</Text>
                    </TouchableOpacity>
                  </View>
                )}

              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
