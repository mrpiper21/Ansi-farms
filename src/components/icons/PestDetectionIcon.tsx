import React, { FC, useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Line, Rect, G, Text } from 'react-native-svg';

type PestDetectionIconProps = {
  size?: number;
  color?: string;
};

const PestDetectionIcon: FC<PestDetectionIconProps> = ({ size = 100, color = '#66BB6A' }) => {
  const leafAnimation = useRef(new Animated.Value(1)).current;
  const miteAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(0)).current;
  const scanAnimation = useRef(new Animated.Value(0)).current;
  const magnifyAnimation = useRef(new Animated.Value(1)).current;
  const alertAnimation = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const leafBreathing = Animated.loop(
      Animated.sequence([
        Animated.timing(leafAnimation, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(leafAnimation, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const miteMovement = Animated.loop(
      Animated.sequence([
        Animated.timing(miteAnimation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(miteAnimation, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    const pulsing = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    const scanning = Animated.loop(
      Animated.timing(scanAnimation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const magnifying = Animated.loop(
      Animated.sequence([
        Animated.timing(magnifyAnimation, {
          toValue: 1.1,
          duration: 1250,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(magnifyAnimation, {
          toValue: 1,
          duration: 1250,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const alertBlinking = Animated.loop(
      Animated.sequence([
        Animated.timing(alertAnimation, {
          toValue: 0.3,
          duration: 500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(alertAnimation, {
          toValue: 0.8,
          duration: 500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    leafBreathing.start();
    miteMovement.start();
    pulsing.start();
    scanning.start();
    magnifying.start();
    alertBlinking.start();

    return () => {
      leafBreathing.stop();
      miteMovement.stop();
      pulsing.stop();
      scanning.stop();
      magnifying.stop();
      alertBlinking.stop();
    };
  }, []);

  const AnimatedSvg = Animated.createAnimatedComponent(Svg);
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);
  const AnimatedPath = Animated.createAnimatedComponent(Path);
  const AnimatedG = Animated.createAnimatedComponent(G);

  const miteTranslateX = miteAnimation.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 5, 3, -3, 0],
  });

  const miteTranslateY = miteAnimation.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, -3, 5, 2, 0],
  });

  const pulseScale = pulseAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1.2, 1.4],
  });

  const pulseOpacity = pulseAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0],
  });

  const scanTranslateY = scanAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, size * 0.6],
  });

  const scanOpacity = scanAnimation.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, 0.7, 0.7, 0],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <AnimatedSvg width={size} height={size} viewBox="0 0 200 200">
        {/* Background Circle */}
        <Circle
          cx="100"
          cy="100"
          r="95"
          fill="rgba(102, 187, 106, 0.15)"
          stroke="rgba(102, 187, 106, 0.3)"
          strokeWidth="2"
        />

        {/* Animated Leaves */}
        <AnimatedPath
          d="M70 120 Q100 80 130 120 Q100 140 70 120 Z"
          fill={color}
          scale={leafAnimation}
        />
        <AnimatedPath
          d="M60 140 Q90 100 120 140 Q90 160 60 140 Z"
          fill={color}
          opacity="0.8"
          scale={leafAnimation}
        />

        {/* Animated Spider Mites */}
        <AnimatedG translateX={miteTranslateX} translateY={miteTranslateY}>
          <Circle cx="85" cy="110" r="2" fill="#FF3D00" />
          <Circle cx="110" cy="125" r="1.5" fill="#FF3D00" />
          <Circle cx="95" cy="135" r="1.8" fill="#FF3D00" />
          <Circle cx="75" cy="145" r="1.2" fill="#FF3D00" />
        </AnimatedG>

        {/* Animated Magnifying Glass */}
        <AnimatedG scale={magnifyAnimation}>
          <Circle
            cx="140"
            cy="80"
            r="20"
            fill="none"
            stroke="#00B0FF"
            strokeWidth="3"
          />
          <Line
            x1="155"
            y1="95"
            x2="170"
            y2="110"
            stroke="#1976D2"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </AnimatedG>

        {/* Detection Pulse Circles */}
        <AnimatedCircle
          cx="95"
          cy="125"
          r="15"
          fill="none"
          stroke="#FFC107"
          strokeWidth="2"
          scale={pulseScale}
          opacity={pulseOpacity}
        />

        {/* Scanning Line */}
        <AnimatedG translateY={scanTranslateY} opacity={scanOpacity}>
          <Line
            x1="50"
            y1="40"
            x2="150"
            y2="40"
            stroke="#00E5FF"
            strokeWidth="2"
          />
        </AnimatedG>

        {/* Tech Elements */}
        <Rect x="30" y="30" width="6" height="6" fill="#00BCD4" opacity="0.9" />
        <Rect x="170" y="40" width="4" height="4" fill="#FFC107" opacity="0.9" />
        <Rect x="40" y="170" width="5" height="5" fill="#66BB6A" opacity="0.9" />

        {/* Alert Icon */}
        <AnimatedG opacity={alertAnimation}>
          <Circle cx="172" cy="152" r="12" fill="#FF5252" />
          <Text
            x="172"
            y="157"
            textAnchor="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
          >
            !
          </Text>
        </AnimatedG>
      </AnimatedSvg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PestDetectionIcon;