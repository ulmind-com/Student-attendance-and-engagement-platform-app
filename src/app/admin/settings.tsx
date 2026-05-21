import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { Building2, ChevronDown, MapPin, Phone, Mail } from 'lucide-react-native';

export default function SettingsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 26, fontWeight: '900', color: '#1e293b' }}>Platform Settings</Text>
          <Text style={{ fontSize: 15, fontWeight: '500', color: '#64748b', marginTop: 4, lineHeight: 22 }}>
            Configure every aspect of your emotional wellness platform.
          </Text>
        </View>

        {/* Dropdown Selector */}
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#0ea5e9', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 16, marginBottom: 16, zIndex: 10 }}>
          <Building2 size={20} color="#fff" />
          <Text style={{ flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '800', color: '#fff' }}>School Info</Text>
          <ChevronDown size={20} color="#fff" />
        </TouchableOpacity>

        {/* Settings Panel Content */}
        <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 }}>
          <Text style={{ fontSize: 22, fontWeight: '900', color: '#1e293b' }}>School Information</Text>
          <Text style={{ fontSize: 15, fontWeight: '500', color: '#64748b', marginTop: 8, lineHeight: 22, marginBottom: 24 }}>
            Configure your school's identity, contacts, and branding details.
          </Text>

          <View style={{ borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 20, padding: 20 }}>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <Text style={{ fontSize: 18 }}>🏫</Text>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#1e293b' }}>School Details</Text>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', letterSpacing: 1, marginBottom: 8 }}>SCHOOL NAME</Text>
              <View style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 }}>
                <Text style={{ fontSize: 15, fontWeight: '500', color: '#1e293b' }}>Student Attandance & Engageme</Text>
              </View>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', letterSpacing: 1, marginBottom: 8 }}>SCHOOL LOGO</Text>
              <View style={{ width: 120, height: 120, borderRadius: 16, borderWidth: 2, borderColor: '#e9d5ff', padding: 4 }}>
                <Image source={{ uri: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=200" }} style={{ flex: 1, borderRadius: 12 }} />
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                <MapPin size={12} color="#64748b" />
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', letterSpacing: 1 }}>ADDRESS</Text>
              </View>
              <View style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 }}>
                <Text style={{ fontSize: 15, fontWeight: '500', color: '#1e293b' }}>Allentown,US</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                  <Phone size={12} color="#64748b" />
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', letterSpacing: 1 }}>PHONE</Text>
                </View>
                <View style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, height: 50 }} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                  <Mail size={12} color="#64748b" />
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', letterSpacing: 1 }}>EMAIL</Text>
                </View>
                <View style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, height: 50 }} />
              </View>
            </View>

          </View>
        </View>

      </ScrollView>
    </View>
  );
}
