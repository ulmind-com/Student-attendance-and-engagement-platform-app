import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { Search, Calendar as CalendarIcon } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://kids-attendance-production.up.railway.app';

export default function AttendanceScreen() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("2026-05-21");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(`${API_URL}/students`);
        if (res.ok) setStudents(await res.json());
      } catch (e) {
        console.error("Failed to fetch students", e);
      }
    };
    fetchStudents();
  }, []);

  const heatmapDays = useMemo(() => {
    const days = [];
    for(let i=29; i>=0; i--) {
      days.push({ id: i });
    }
    return days;
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        
        {/* Header */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 26, fontWeight: '900', color: '#1e293b' }}>Attendance Center</Text>
          <Text style={{ fontSize: 15, fontWeight: '500', color: '#64748b', marginTop: 4 }}>Live monitoring and daily tracking.</Text>
        </View>

        {/* Date Picker Button */}
        <TouchableOpacity style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3e8ff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginBottom: 24, gap: 10 }}>
          <CalendarIcon size={16} color="#9333ea" />
          <Text style={{ color: '#9333ea', fontWeight: '800', fontSize: 15 }}>21/05/2026</Text>
          <CalendarIcon size={16} color="#1e293b" />
        </TouchableOpacity>

        {/* Heatmap Card */}
        <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 }}>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#1e293b', width: '40%', lineHeight: 26 }}>
              Class Attendance Heatmap (Last 30 Days)
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '55%', justifyContent: 'flex-end', paddingTop: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#86efac' }}/><Text style={{ fontSize: 12, fontWeight: '700', color: '#64748b' }}>Present</Text></View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#fca5a5' }}/><Text style={{ fontSize: 12, fontWeight: '700', color: '#64748b' }}>Absent</Text></View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#fcd34d' }}/><Text style={{ fontSize: 12, fontWeight: '700', color: '#64748b' }}>Late</Text></View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#c084fc' }}/></View>
            </View>
          </View>

          {/* Heatmap Grid (3 rows of 10 tall pills) */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {heatmapDays.map((day, i) => (
              <View 
                key={i} 
                style={{ 
                  width: (width - 40 - 40 - (9 * 8)) / 10, // approximate width 
                  height: 32, 
                  backgroundColor: i === 28 ? '#e9d5ff' : '#fee2e2', 
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
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#1e293b', lineHeight: 26 }}>Daily Attendance{'\n'}Record</Text>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#64748b', marginTop: 4 }}>(21/05/2026)</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, width: '50%' }}>
              <Search size={16} color="#94a3b8" />
              <TextInput 
                placeholder="Search student..." 
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{ flex: 1, marginLeft: 8, fontSize: 13, fontWeight: '500', color: '#334155' }}
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
            <Text style={{ flex: 2, fontSize: 14, fontWeight: '800', color: '#94a3b8' }}>Student</Text>
            <Text style={{ flex: 1, fontSize: 14, fontWeight: '800', color: '#94a3b8' }}>Status</Text>
            <Text style={{ flex: 1, fontSize: 14, fontWeight: '800', color: '#94a3b8' }}>Mood</Text>
          </View>
          
          {/* Mock row just to show space */}
          <View style={{ height: 60 }} />

        </View>
      </ScrollView>
    </View>
  );
}
