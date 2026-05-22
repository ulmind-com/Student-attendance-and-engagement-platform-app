import React from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

const Touchable = ({ children, style, onPress, className, ...props }: any) => {
  return (
    <Pressable
      onPress={onPress}
      className={className}
      style={({ pressed }) => [
        style,
        pressed && { opacity: 0.6 }
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SuccessScreen() {
  return (
    <View className="flex-1 bg-white relative justify-center items-center px-6">
      <LinearGradient colors={['#ede9fe', '#fdf2f8', '#e0f2fe']} style={{ position: 'absolute', width: '100%', height: '100%' }} />
      
      <MotiView
        from={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 12 } as any}
        className="items-center bg-white/90 border border-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full relative overflow-hidden"
      >
        {/* Glow behind success */}
        <View className="absolute top-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
        
        {/* Done Lottie Animation */}
        <View style={{ width: 140, height: 140 }} className="mb-4">
          <LottieView
            source={require('../../assets/lottie/Done.json')}
            autoPlay
            loop={false}
            style={{ width: '100%', height: '100%' }}
          />
        </View>
        
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400, type: 'timing' }}
          className="items-center"
        >
          <Text className="text-2xl font-black text-slate-800 text-center mb-2">Check-in Complete! 🎉</Text>
          <Text className="text-slate-500 font-semibold text-sm text-center mb-8 leading-relaxed">
            Amazing job! Your attendance and emotional wellness check-in have been successfully recorded for today.
          </Text>
          
          <Touchable 
            onPress={() => router.replace('/')} 
            activeOpacity={0.8}
            className="w-full"
          >
            <LinearGradient
              colors={['#8b5cf6', '#ec4899']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              className="py-4 rounded-2xl items-center shadow-lg w-full"
            >
              <Text className="text-white font-black text-sm">Return Home 🏠</Text>
            </LinearGradient>
          </Touchable>
        </MotiView>
      </MotiView>
    </View>
  );
}
