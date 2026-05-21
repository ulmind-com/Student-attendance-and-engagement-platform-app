import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, Modal, Alert, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Search, MoreVertical, ShieldAlert, HeartPulse, ShieldCheck, UserPlus, Upload, X, Save, CheckCircle2, Users, AlertTriangle, BarChart2, Lightbulb, ClipboardList, Pencil, AlertOctagon, Calendar, UserCheck, UserX, ChevronLeft, ChevronRight, Clock, Eye, Download } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://kids-attendance-production.up.railway.app';

export default function StudentsScreen() {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive" | "present" | "calendar">("all");
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_URL}/students`);
      if (res.ok) setStudents(await res.json());
    } catch (e) { console.error("Failed to fetch students"); }
  };

  const activeStudents = students.filter(s => s.status !== "inactive");
  const inactiveStudents = students.filter(s => s.status === "inactive");
  const presentCount = students.filter(s => s.timeline?.some((e: any) => e.day === "Today" || e.date === new Date().toISOString().split('T')[0])).length;

  const getFilteredList = () => {
    let list = activeTab === "active" ? activeStudents : activeTab === "inactive" ? inactiveStudents : students;
    if (searchTerm) list = list.filter(s => s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    return list;
  };

  const filteredStudents = getFilteredList();

  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        
        {/* Header */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 26, fontWeight: '900', color: '#1e293b' }}>Student Profiles</Text>
          <Text style={{ fontSize: 15, fontWeight: '500', color: '#64748b', marginTop: 4 }}>Manage and track your students' wellness.</Text>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14, paddingVertical: 12 }}>
            <Upload size={16} color="#1e293b" style={{ marginRight: 8 }} />
            <Text style={{ color: '#1e293b', fontWeight: '800', fontSize: 16 }}>CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsAddModalOpen(true)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#9333ea', borderRadius: 14, paddingVertical: 12 }}>
            <UserPlus size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Add Student</Text>
          </TouchableOpacity>
        </View>

        {/* Stat Squares Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          {[
            { id: "all", label: "ALL", value: students.length || 6, icon: Users, color: "#3b82f6", bg: "#fff", border: activeTab === 'all' ? '#a855f7' : '#e2e8f0' },
            { id: "active", label: "ACTIVE", value: activeStudents.length || 5, icon: UserCheck, color: "#16a34a", bg: "#f0fdf4", border: 'transparent' },
            { id: "inactive", label: "INACTIVE", value: inactiveStudents.length || 1, icon: UserX, color: "#dc2626", bg: "#fef2f2", border: 'transparent' },
            { id: "present", label: "PRESENT", value: presentCount || 0, icon: CheckCircle2, color: "#9333ea", bg: "#faf5ff", border: 'transparent' },
            { id: "calendar", label: "CALENDAR", value: "0d", icon: Calendar, color: "#d97706", bg: "#fffbeb", border: 'transparent' },
          ].map((tab, i) => (
            <TouchableOpacity 
              key={tab.id} 
              onPress={() => setActiveTab(tab.id as any)}
              style={{ width: (width - 64) / 3, backgroundColor: tab.bg, borderWidth: 1, borderColor: tab.border, borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center' }}
            >
              <tab.icon size={20} color={tab.color} style={{ marginBottom: 8 }} />
              <Text style={{ fontSize: 24, fontWeight: '900', color: tab.color }}>{tab.value}</Text>
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#64748b', marginTop: 4 }}>{tab.label}</Text>
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

        {/* List */}
        <View style={{ gap: 16 }}>
          {filteredStudents.map(student => (
            <View 
              key={student.rollNumber} 
              style={{ backgroundColor: '#fff', padding: 16, borderRadius: 24, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 }}
            >
              <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginRight: 16, overflow: 'hidden' }}>
                {student.profilePhoto ? (
                  <Image source={{ uri: student.profilePhoto }} style={{ width: 50, height: 50 }} />
                ) : (
                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#94a3b8' }}>{student.firstName[0]}</Text>
                )}
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: '#1e293b' }}>
                  {student.firstName} {student.lastInitial}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '500', color: '#64748b', marginTop: 2 }}>
                  Roll: {student.rollNumber} • {student.class_name || student.class}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity>
                  <Users size={18} color="#f97316" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <MoreVertical size={18} color="#94a3b8" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <X size={18} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {filteredStudents.length === 0 && (
             <View style={{ padding: 40, alignItems: 'center' }}>
               <Text style={{ fontSize: 16, fontWeight: '700', color: '#94a3b8' }}>No students found</Text>
             </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}
