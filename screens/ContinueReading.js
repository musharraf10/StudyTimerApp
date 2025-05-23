import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useContext, useRef, useEffect } from "react";
import { StudyContext } from "../context/StudyContext";
import { LinearGradient } from "expo-linear-gradient";

const ContinueReading = ({ schedule, navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const {
    activeSchedules,
    setActiveSchedules,
    completedReadings,
    setCompletedReadings,
  } = useContext(StudyContext);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const markSubjectComplete = (item, duration) => {
    const currentDate = new Date().toISOString().split("T")[0];
    setCompletedReadings([
      {
        id: `${item.id}-${currentDate}`,
        subject: item.subject,
        duration: duration || item.duration,
        date: currentDate,
        completedAt: new Date().toTimeString().slice(0, 5),
      },
      ...completedReadings,
    ]);
    setActiveSchedules({
      ...activeSchedules,
      [currentDate]: activeSchedules[currentDate].map((sub) =>
        sub.id === item.id
          ? { ...sub, completed: true, duration: duration || sub.duration }
          : sub
      ),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSubjectPress = (item) => {
    if (item.completed) {
      Alert.alert(
        "Subject Completed",
        `You have already completed ${item.subject}.`
      );
      return;
    }
    navigation.navigate("ReadingMode", {
      subject: item,
      schedule,
      onComplete: (duration) => markSubjectComplete(item, duration),
    });
  };

  const { date, time } = getCurrentDateTime();

  return (
    <Animated.View
      style={[
        styles.continueReadingContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={["#F9FAFB", "#F3F4F6"]}
        style={styles.gradientBackground}
      >
        <View style={styles.dateTimeContainer}>
          <Text style={styles.currentDate}>{date}</Text>
          <View style={styles.timeWrapper}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={20}
              color="#4F46E5"
            />
            <Text style={styles.currentTime}>{time}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Today's Focus</Text>
        {schedule.length > 0 ? (
          schedule.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={Animated.spring({
                delay: index * 100,
                duration: 400,
                useNativeDriver: true,
              })}
            >
              <TouchableOpacity
                style={[
                  styles.focusItem,
                  { backgroundColor: item.color || "#EDE9FE" },
                ]}
                onPress={() => handleSubjectPress(item)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["rgba(0,0,0,0.03)", "rgba(0,0,0,0.06)"]}
                  style={styles.focusTimeContainer}
                >
                  <Text style={styles.focusTime}>{item.duration}min</Text>
                </LinearGradient>
                <View style={styles.focusDetails}>
                  <Text style={styles.focusSubject}>{item.subject}</Text>
                  <View style={styles.statusContainer}>
                    <MaterialCommunityIcons
                      name={
                        item.completed ? "check-circle" : "arrow-right-circle"
                      }
                      size={16}
                      color={item.completed ? "#059669" : "#6366F1"}
                    />
                    <Text
                      style={[
                        styles.focusStatus,
                        { color: item.completed ? "#059669" : "#6366F1" },
                      ]}
                    >
                      {item.completed ? "Completed" : "Tap to start reading"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))
        ) : (
          <Animated.View style={styles.emptyFocus}>
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={48}
              color="#9CA3AF"
            />
            <Text style={styles.emptyFocusText}>
              No subjects scheduled for today
            </Text>
          </Animated.View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  continueReadingContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    margin: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  gradientBackground: {
    flex: 1,
    padding: 20,
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  timeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    padding: 8,
    borderRadius: 12,
  },
  currentDate: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  currentTime: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4F46E5",
    marginLeft: 4,
  },
  divider: {
    height: 2,
    backgroundColor: "#E5E7EB",
    marginBottom: 24,
    borderRadius: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  focusItem: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 90,
  },
  focusTimeContainer: {
    width: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  focusTime: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  focusDetails: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  focusSubject: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  focusStatus: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  emptyFocus: {
    alignItems: "center",
    paddingVertical: 48,
    backgroundColor: "#FFFFFF80",
    borderRadius: 16,
  },
  emptyFocusText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 12,
  },
});

export default ContinueReading;
