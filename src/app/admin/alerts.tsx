import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Search, Calendar as CalendarIcon, Printer, Clock } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function AlertsScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const heatmapDays = Array(30).fill(0);

  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        
        {/* Header */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 26, fontWeight: '900', color: '#1e293b' }}>Smart Alerts</Text>
            <View style={{ backgroundColor: '#fee2e2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '800' }}>3 Active</Text>
            </View>
          </View>
          <Text style={{ fontSize: 15, fontWeight: '500', color: '#64748b', marginTop: 4, lineHeight: 22 }}>
            Emotionally intelligent notifications requiring attention.
          </Text>
        </View>

        {/* Search */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 }}>
          <Search size={20} color="#94a3b8" />
          <TextInput 
            placeholder="Search student or roll..." 
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '500', color: '#334155' }}
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* Date & Print Stack */}
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3e8ff', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, marginBottom: 16, gap: 10 }}>
          <Clock size={18} color="#9333ea" />
          <Text style={{ color: '#9333ea', fontWeight: '800', fontSize: 16 }}>21/05/2026</Text>
          <CalendarIcon size={18} color="#1e293b" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
        
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, marginBottom: 24, gap: 10 }}>
          <Printer size={18} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Print PDF</Text>
        </TouchableOpacity>

        {/* Alert Frequency Heatmap */}
        <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#1e293b', marginBottom: 20 }}>
            Alert Frequency (Last 30 Days)
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {heatmapDays.map((_, i) => (
              <View 
                key={i} 
                style={{ 
                  width: (width - 40 - 40 - (9 * 8)) / 10, 
                  height: 32, 
                  backgroundColor: i === 29 ? '#fce7f3' : i >= 27 ? '#ffedd5' : '#f1f5f9', 
                  borderRadius: 8, 
                  borderWidth: i === 29 ? 2 : 0, 
                  borderColor: '#9333ea',
                }} 
              />
            ))}
          </View>
        </View>

        {/* Alert Card */}
        <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 }}>
          
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
            <View style={{ position: 'relative' }}>
              <Image source={{ uri: "https://res.cloudinary.com/dsz45r37k/image/upload/v1/kids-attendance/student_michael.jpg" }} style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#f1f5f9' }} />
              <View style={{ position: 'absolute', bottom: -4, right: -4, backgroundColor: '#fff', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' }}>
                <Text style={{ fontSize: 10, fontWeight: '800' }}>Sad</Text>
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: '#1e293b' }}>Michael S</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748b', marginTop: 2 }}>Roll: A001</Text>
                </View>
                
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' }} />
                    <Text style={{ fontSize: 11, fontWeight: '900', color: '#ef4444' }}>NEW</Text>
                  </View>
                  <View style={{ backgroundColor: '#f3e8ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                    <Text style={{ color: '#9333ea', fontSize: 11, fontWeight: '800' }}>Emotional Alert</Text>
                  </View>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '900', color: '#dc2626' }}>Score: 2/10</Text>
                <Text style={{ color: '#cbd5e1' }}>•</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} color="#64748b" />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748b' }}>Recently</Text>
                </View>
              </View>

              <Text style={{ fontSize: 15, fontWeight: '600', color: '#334155', marginTop: 12, lineHeight: 22 }}>
                Student checked in with a low score (2/10) and requires attention.
              </Text>
            </View>
          </View>

        </View>

      </ScrollView>
    </View>
  );
}
