import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { CheckCircle2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface SuccessScreenProps {
  navigation: any;
}

export default function SuccessScreen({ navigation }: SuccessScreenProps) {
  const handleReturnHome = () => {
    // Navigate back to the initial login screen
    navigation.navigate('LoginScreen');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ede9fe', '#fdf2f8', '#e0f2fe']}
        style={StyleSheet.absoluteFillObject}
      />

      <MotiView
        from={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 12 } as any}
        style={styles.card}
      >
        {/* Glow Line Indicator */}
        <View style={styles.glowLine} />

        {/* Success Done Animation */}
        <View style={styles.lottieWrapper}>
          <LottieView
            source={require('../../assets/lottie/Done.json')}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400, type: 'timing' }}
          style={styles.contentWrapper}
        >
          <Text style={styles.titleText}>Check-in Complete! 🎉</Text>
          <Text style={styles.descriptionText}>
            Amazing job! Your attendance and emotional wellness check-in have been successfully marked on the classroom record for today.
          </Text>

          <TouchableOpacity
            onPress={handleReturnHome}
            activeOpacity={0.8}
            style={styles.homeButton}
          >
            <LinearGradient
              colors={['#8b5cf6', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Return Home 🏠</Text>
            </LinearGradient>
          </TouchableOpacity>
        </MotiView>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: Math.min(width - 48, 360),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 36,
    padding: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  glowLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#8b5cf6',
  },
  lottieWrapper: {
    width: 140,
    height: 140,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  contentWrapper: {
    alignItems: 'center',
  },
  titleText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  homeButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
});
