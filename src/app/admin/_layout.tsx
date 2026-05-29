import React, { useState, useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Text, StyleSheet, Platform, Dimensions, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LayoutDashboard, Users, CalendarCheck, Bell, Settings, Clock, LogOut } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

function TabBarIcon({ focused, IconComponent, name }: { focused: boolean, IconComponent: any, name: string }) {
  return (
    <View style={[styles.tabIconContainer, focused && styles.tabIconContainerFocused]}>
      <IconComponent size={20} color={focused ? "#9333ea" : "#94a3b8"} />
      <Text style={[styles.tabLabel, { color: focused ? "#9333ea" : "#94a3b8" }]} numberOfLines={1}>{name}</Text>
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

export default function AdminLayout() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Auth Guard
  useEffect(() => {
    (async () => {
      try {
        const username = await AsyncStorage.getItem("adminUsername");
        if (!username) {
          setIsAuthenticated(false);
          router.replace('/');
        } else {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Failed to fetch adminUsername:", err);
        setIsAuthenticated(false);
        router.replace('/');
      }
    })();
  }, []);

  // Clock Polling
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

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out from the Admin Dashboard?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("adminUsername");
            await AsyncStorage.removeItem("adminRole");
            router.replace('/');
          }
        }
      ]
    );
  };

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#a855f7" />
        <Text style={{ fontSize: 14, fontWeight: '800', color: '#a855f7', marginTop: 12 }}>
          Securing connection...
        </Text>
      </View>
    );
  }

  if (isAuthenticated === false) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Premium Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={handleSignOut}>
          <LogOut size={16} color="#f43f5e" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle} numberOfLines={1}>Student Attendance</Text>
        
        <View style={styles.clockContainer}>
          <Clock size={11} color="#8b5cf6" />
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 52 : 44,
    paddingBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    zIndex: 10,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
    marginHorizontal: 8,
    letterSpacing: -0.3,
  },
  clockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f5f3ff',
    borderWidth: 1,
    borderColor: '#ddd6fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
  },
  clockText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7c3aed',
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
    paddingTop: Platform.OS === 'web' ? 12 : 8,
    paddingHorizontal: Platform.OS === 'web' ? 12 : 2,
    borderRadius: 16,
    width: Platform.OS === 'web' ? 'auto' : (width / 5) - 4,
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
