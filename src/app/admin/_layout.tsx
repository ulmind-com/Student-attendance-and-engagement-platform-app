import React, { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform, Dimensions, TouchableOpacity } from 'react-native';
import { LayoutDashboard, Users, CalendarCheck, Bell, Settings, Clock, Menu } from 'lucide-react-native';

const { width } = Dimensions.get('window');

function TabBarIcon({ focused, IconComponent, name }: { focused: boolean, IconComponent: any, name: string }) {
  return (
    <View style={[styles.tabIconContainer, focused && styles.tabIconContainerFocused]}>
      <IconComponent size={20} color={focused ? "#9333ea" : "#94a3b8"} />
      <Text style={[styles.tabLabel, { color: focused ? "#9333ea" : "#94a3b8" }]}>{name}</Text>
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

export default function AdminLayout() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
      setCurrentTime(timeStr);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header matching screenshot */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Menu size={20} color="#334155" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle} numberOfLines={1}>Student Attanda...</Text>
        
        <View style={styles.clockContainer}>
          <Clock size={12} color="#a855f7" />
          <Text style={styles.clockText}>{currentTime}</Text>
        </View>
      </View>

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Dashboard", tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} IconComponent={LayoutDashboard} name="Dashboard" /> }} />
        <Tabs.Screen name="students" options={{ title: "Students", tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} IconComponent={Users} name="Students" /> }} />
        <Tabs.Screen name="attendance" options={{ title: "Attendance", tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} IconComponent={CalendarCheck} name="Attendance" /> }} />
        <Tabs.Screen name="alerts" options={{ title: "Alerts", tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} IconComponent={Bell} name="Alerts" /> }} />
        <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} IconComponent={Settings} name="Settings" /> }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    zIndex: 10,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
    color: '#9333ea',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  clockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#faf5ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  clockText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#a855f7',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  tabIconContainerFocused: {
    backgroundColor: '#faf5ff',
    paddingTop: 8,
    paddingBottom: 8,
    marginTop: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
  },
  activeDot: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#a855f7',
  }
});
