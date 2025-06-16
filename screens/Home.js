import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated, // Import Animated from 'react-native'
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Clock,
  TrendingUp,
  Target,
  Award,
  Calendar,
  BookOpen,
  Flame,
} from "lucide-react-native";
import { AuthContext } from "../context/AuthContext"; // Import AuthContext to get user data
// import { useStudy } from "../../contexts/StudyContext"; // Uncomment if you have StudyContext
// import { StudyService } from "../../services/studyService"; // Uncomment if you have StudyService

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  // Use user from AuthContext
  const { user } = useContext(AuthContext);

  // Mock studyStats (if StudyContext isn't fully integrated yet)
  const studyStats = {
    todayHours: 3.75,
    currentStreak: 12,
    totalSessions: 55,
    weeklyHours: [2, 3, 1.5, 4, 3.5, 0, 1], // Example for 7 days
  };

  const [quote, setQuote] = useState({ text: "", author: "" });

  // Use standard Animated.Value for animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  useEffect(() => {
    loadQuote();

    // Animate entrance using Animated.spring from React Native's built-in Animated API
    Animated.spring(fadeAnim, {
      toValue: 1,
      tension: 100, // Adjust for desired springiness
      friction: 10,
      delay: 300,
      useNativeDriver: true, // Use native driver for performance
    }).start();

    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 100,
      friction: 10,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, []); // Empty dependency array means this runs once on mount

  // Placeholder for quote loading
  const loadQuote = async () => {
    setQuote({
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
    });
  };

  // The animated style definition
  const headerAnimatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <View style={homeStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={homeStyles.header}
        >
          {/* Apply the animated style directly to Animated.View */}
          <Animated.View
            style={[homeStyles.headerContent, headerAnimatedStyle]}
          >
            <Text style={homeStyles.greeting}>{getGreeting()}</Text>
            <Text style={homeStyles.userName}>
              {user?.displayName || "Student"} {/* Use user from AuthContext */}
            </Text>
            <Text style={homeStyles.headerSubtitle}>
              Ready to focus and achieve your goals?
            </Text>
          </Animated.View>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={homeStyles.statsContainer}>
          <View style={homeStyles.statsRow}>
            <View style={[homeStyles.statCard, homeStyles.primaryCard]}>
              <Clock size={24} color="#6366F1" />
              <Text style={homeStyles.statValue}>
                {formatHours(studyStats.todayHours)}
              </Text>
              <Text style={homeStyles.statLabel}>Today</Text>
            </View>

            <View style={[homeStyles.statCard, homeStyles.secondaryCard]}>
              <Flame size={24} color="#F59E0B" />
              <Text style={homeStyles.statValue}>
                {studyStats.currentStreak}
              </Text>
              <Text style={homeStyles.statLabel}>Day Streak</Text>
            </View>
          </View>

          <View style={homeStyles.statsRow}>
            <View style={[homeStyles.statCard, homeStyles.accentCard]}>
              <Target size={24} color="#10B981" />
              <Text style={homeStyles.statValue}>
                {studyStats.totalSessions}
              </Text>
              <Text style={homeStyles.statLabel}>Sessions</Text>
            </View>

            <View style={[homeStyles.statCard, homeStyles.warningCard]}>
              <TrendingUp size={24} color="#EF4444" />
              <Text style={homeStyles.statValue}>
                {formatHours(studyStats.weeklyHours.reduce((a, b) => a + b, 0))}
              </Text>
              <Text style={homeStyles.statLabel}>This Week</Text>
            </View>
          </View>
        </View>

        {/* Weekly Progress Chart */}
        <View style={homeStyles.chartContainer}>
          <Text style={homeStyles.sectionTitle}>Weekly Progress</Text>
          <View style={homeStyles.chart}>
            {studyStats.weeklyHours.map((hours, index) => {
              const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
              const maxHours = Math.max(...studyStats.weeklyHours, 1);
              const height = (hours / maxHours) * 100;

              return (
                <View key={index} style={homeStyles.chartBar}>
                  <View style={homeStyles.barContainer}>
                    <View style={[homeStyles.bar, { height: `${height}%` }]} />
                  </View>
                  <Text style={homeStyles.barLabel}>{days[index]}</Text>
                  <Text style={homeStyles.barValue}>{hours.toFixed(1)}h</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Quote of the Day */}
        {quote.text && (
          <View style={homeStyles.quoteContainer}>
            <Text style={homeStyles.sectionTitle}>Daily Inspiration</Text>
            <View style={homeStyles.quoteCard}>
              <Text style={homeStyles.quoteText}>"{quote.text}"</Text>
              <Text style={homeStyles.quoteAuthor}>— {quote.author}</Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={homeStyles.actionsContainer}>
          <Text style={homeStyles.sectionTitle}>Quick Actions</Text>
          <View style={homeStyles.actionGrid}>
            <TouchableOpacity style={homeStyles.actionCard}>
              <BookOpen size={32} color="#6366F1" />
              <Text style={homeStyles.actionTitle}>Start Reading</Text>
              <Text style={homeStyles.actionSubtitle}>
                Begin a study session
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={homeStyles.actionCard}>
              <Calendar size={32} color="#10B981" />
              <Text style={homeStyles.actionTitle}>Schedule</Text>
              <Text style={homeStyles.actionSubtitle}>Plan your day</Text>
            </TouchableOpacity>

            <TouchableOpacity style={homeStyles.actionCard}>
              <Award size={32} color="#F59E0B" />
              <Text style={homeStyles.actionTitle}>Achievements</Text>
              <Text style={homeStyles.actionSubtitle}>View your badges</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Styles for HomeScreen
const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  greeting: {
    fontSize: 16,
    // fontFamily: "Inter-Regular", // Ensure custom fonts are loaded globally
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    // fontFamily: "Inter-Bold",
    color: "#fff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    // fontFamily: "Inter-Regular",
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
  statsContainer: {
    padding: 20,
    marginTop: -20,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#6366F1",
  },
  secondaryCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  accentCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  warningCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
  },
  statValue: {
    fontSize: 24,
    // fontFamily: "Inter-Bold",
    color: "#1F2937",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    // fontFamily: "Inter-Medium",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chartContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    // fontFamily: "Inter-SemiBold",
    color: "#1F2937",
    marginBottom: 16,
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
  },
  chartBar: {
    flex: 1,
    alignItems: "center",
  },
  barContainer: {
    height: 80,
    width: 20,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  bar: {
    backgroundColor: "#6366F1",
    borderRadius: 10,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    // fontFamily: "Inter-Medium",
    color: "#6B7280",
    marginTop: 8,
  },
  barValue: {
    fontSize: 9,
    // fontFamily: "Inter-Regular",
    color: "#9CA3AF",
    marginTop: 2,
  },
  quoteContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  quoteCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#6366F1",
  },
  quoteText: {
    fontSize: 16,
    // fontFamily: "Inter-Regular",
    color: "#374151",
    lineHeight: 24,
    fontStyle: "italic",
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 14,
    // fontFamily: "Inter-Medium",
    color: "#6B7280",
    textAlign: "right",
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  actionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    width: (width - 60) / 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#1F2937",
    marginTop: 12,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    // fontFamily: "Inter-Regular",
    color: "#6B7280",
    textAlign: "center",
  },
});
