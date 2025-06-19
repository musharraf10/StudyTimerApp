// ReadingModeScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useContext } from "react";
import { StudyContext } from "../context/StudyContext";

const { width } = Dimensions.get("window");

export const ReadingModeScreen = ({ route, navigation }) => {
  const { subject, schedule, onComplete } = route.params;
  const {
    activeSchedules,
    setActiveSchedules,
    completedReadings,
    setCompletedReadings,
  } = useContext(StudyContext);

  // Timer state
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [startTime, setStartTime] = useState(new Date());
  const [durationAlertShown, setDurationAlertShown] = useState(false);

  // Animation values
  const pulseAnim = new Animated.Value(1);
  const cardScale = new Animated.Value(1);
  const buttonScale = new Animated.Value(1);

  // Find next subject
  const currentIndex = schedule.findIndex((item) => item.id === subject.id);
  const nextSubject = schedule[currentIndex + 1] || null;

  // Pulsing animation for timer
  useEffect(() => {
    if (isActive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isActive]);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev >= 59) {
            setMinutes((m) => {
              if (m >= 59) {
                setHours((h) => h + 1);
                return 0;
              }
              return m + 1;
            });
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // Duration alert
  useEffect(() => {
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes >= subject.duration && !durationAlertShown) {
      Alert.alert(
        "Duration Reached",
        `You have studied ${subject.subject} for ${subject.duration} minutes!`,
        [{ text: "OK", onPress: () => setDurationAlertShown(true) }]
      );
    }
  }, [minutes, hours, subject.duration, durationAlertShown]);

  const toggleTimer = () => {
    setIsActive(!isActive);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const completeReading = () => {
    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / (1000 * 60)); // Duration in minutes
    if (duration < 1) {
      Alert.alert(
        "Error",
        "Reading session too short. Please study for at least 1 minute."
      );
      return;
    }

    onComplete(duration); // Call the passed callback
    navigation.goBack();
  };

  const formatTime = () => {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const onNextSubjectPressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const onNextSubjectPressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View
        style={[
          styles.header,
          Platform.OS === "android" && { paddingTop: StatusBar.currentHeight },
        ]}
      >
        <Text style={styles.headerTitle}>Reading Mode</Text>
        <View style={styles.headerDivider} />
      </View>

      {/* Subject Card */}
      <View style={[styles.subjectCard, styles.currentSubjectCard]}>
        <Text style={styles.subjectLabel}>Current Subject</Text>
        <Text style={styles.subjectName}>{subject.subject}</Text>
        <View style={styles.durationBadge}>
          <Text style={styles.durationBadgeText}>
            {subject.duration} min scheduled
          </Text>
        </View>
      </View>

      {/* Timer Circle */}
      <View style={styles.timerContainer}>
        <Animated.View
          style={[
            styles.timerCircle,
            {
              transform: [{ scale: pulseAnim }],
              borderTopColor: isActive ? "#6366F1" : "#94A3B8",
            },
          ]}
        >
          <Text style={styles.timerText}>{formatTime()}</Text>
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[
                styles.timerButton,
                { backgroundColor: isActive ? "#6366F1" : "#10B981" },
              ]}
              onPress={toggleTimer}
              activeOpacity={0.8}
            >
              <Text style={styles.timerButtonText}>
                {isActive ? "Pause" : "Resume"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Next Subject Card */}
      {nextSubject && (
        <Animated.View style={{ transform: [{ scale: cardScale }] }}>
          <TouchableOpacity
            style={[styles.subjectCard, styles.nextSubjectCard]}
            onPress={() => {
              navigation.setParams({
                subject: nextSubject,
                schedule,
                onComplete: (duration) =>
                  markSubjectComplete(nextSubject, duration),
              });
              setSeconds(0);
              setMinutes(0);
              setHours(0);
              setStartTime(new Date());
              setDurationAlertShown(false);
            }}
            onPressIn={onNextSubjectPressIn}
            onPressOut={onNextSubjectPressOut}
            activeOpacity={0.9}
          >
            <Text style={styles.subjectLabel}>Next Subject</Text>
            <Text style={styles.subjectName}>{nextSubject.subject}</Text>
            <View style={styles.durationBadge}>
              <Text style={styles.durationBadgeText}>
                {nextSubject.duration} min scheduled
              </Text>
            </View>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#64748B"
              style={styles.nextIcon}
            />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Complete Button */}
      <TouchableOpacity
        style={styles.completeButton}
        onPress={completeReading}
        activeOpacity={0.8}
      >
        <Ionicons
          name="checkmark-circle"
          size={24}
          color="#FFFFFF"
          style={styles.completeIcon}
        />
        <Text style={styles.completeButtonText}>Complete Reading</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 16 : 0,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E293B",
    letterSpacing: -0.5,
  },
  headerDivider: {
    height: 4,
    width: 60,
    backgroundColor: "#6366F1",
    borderRadius: 2,
    marginTop: 12,
    opacity: 0.8,
  },
  subjectCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  currentSubjectCard: {
    borderTopWidth: 4,
    borderTopColor: "#6366F1",
  },
  nextSubjectCard: {
    position: "relative",
    borderTopWidth: 4,
    borderTopColor: "#94A3B8",
  },
  subjectLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  subjectName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  durationBadge: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },
  durationBadgeText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  timerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  timerCircle: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    borderWidth: 12,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  timerText: {
    fontSize: 42,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 20,
    letterSpacing: 1,
  },
  timerButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    borderRadius: 14,
    padding: 18,
    marginTop: "auto",
    marginBottom: 30,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  completeIcon: {
    marginRight: 10,
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  nextIcon: {
    position: "absolute",
    right: 20,
    top: "50%",
    marginTop: -10,
  },
});

export default ReadingModeScreen;
