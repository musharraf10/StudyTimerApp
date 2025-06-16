import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet, // Import StyleSheet
  ScrollView,
  TouchableOpacity,
  Alert,
  Image, // For avatar image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  User, // From lucide-react-native for avatar placeholder
  Settings,
  Award,
  BookOpen,
  Clock,
  TrendingUp,
  LogOut,
  Edit3,
  Mail,
  Calendar,
} from "lucide-react-native"; // Using lucide-react-native for icons
// If you use react-native-vector-icons/MaterialIcons, you need to import Icon from there
// import Icon from "react-native-vector-icons/MaterialIcons";

import { AuthContext } from "../context/AuthContext"; // Your existing AuthContext
import { AuthService } from "../utils/authService"; // Your existing AuthService
// import { CommonActions } from "@react-navigation/native"; // Not explicitly used in your handleSignOut, but keep if needed elsewhere
// import { router } from "expo-router"; // Uncomment if you are using expo-router for navigation

export default function ProfileScreen({ navigation }) {
  const { user, setUser } = useContext(AuthContext); // Use user from AuthContext directly

  // No longer need user1 state if user is directly from AuthContext
  // useEffect(() => {
  //   const getUser = async () => {
  //     const currentUser = await AuthService.getCurrentUser();
  //     setUser1(currentUser);
  //   };
  //   getUser();
  // }, []);

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await AuthService.logout();
          setUser(null);
          // Optional: If you want to navigate back to login after logout
          // If using react-navigation:
          // navigation.dispatch(
          //   CommonActions.reset({
          //     index: 0,
          //     routes: [{ name: 'Login' }], // Replace 'Login' with your login screen route name
          //   })
          // );
          // If using expo-router:
          // router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "N/A";
    }
  };

  // Mock studyStats as it's commented out in your original
  // You would integrate your StudyContext here if available
  const studyStats = {
    todayHours: 2.5,
    currentStreak: 7,
    totalSessions: 42,
  };

  const achievements = [
    { id: 1, title: "7 Day Streak", icon: "🔥", earned: true },
    { id: 2, title: "Early Bird", icon: "🌅", earned: true },
    { id: 3, title: "Night Owl", icon: "🦉", earned: false },
    { id: 4, title: "Consistent Reader", icon: "📚", earned: true },
    { id: 5, title: "First Session", icon: "✨", earned: true },
    { id: 6, title: "Deep Focus", icon: "🧠", earned: false },
  ];

  return (
    <View style={localStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={localStyles.header}
        >
          <View style={localStyles.profileSection}>
            <View style={localStyles.avatarContainer}>
              {user?.avatar ? ( // Assuming your user object from AuthContext has an 'avatar' property
                <Image
                  source={{ uri: user.avatar }}
                  style={localStyles.avatar}
                />
              ) : (
                <View style={localStyles.avatarPlaceholder}>
                  <User size={40} color="#6366F1" />
                </View>
              )}
              <TouchableOpacity style={localStyles.editAvatarButton}>
                <Edit3 size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={localStyles.userName}>
              {user?.displayName || "User"}
            </Text>
            <Text style={localStyles.userEmail}>
              {user?.email || "No email"}
            </Text>

            <View style={localStyles.memberSince}>
              <Calendar size={16} color="rgba(255,255,255,0.8)" />
              <Text style={localStyles.memberSinceText}>
                Member since{" "}
                {user?.createdAt ? formatDate(user.createdAt) : "Recently"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Overview */}
        <View style={localStyles.statsOverview}>
          <View style={localStyles.statItem}>
            <Clock size={24} color="#6366F1" />
            <Text style={localStyles.statValue}>
              {studyStats.todayHours.toFixed(1)}h
            </Text>
            <Text style={localStyles.statLabel}>Today</Text>
          </View>

          <View style={localStyles.statItem}>
            <TrendingUp size={24} color="#10B981" />
            <Text style={localStyles.statValue}>
              {studyStats.currentStreak}
            </Text>
            <Text style={localStyles.statLabel}>Day Streak</Text>
          </View>

          <View style={localStyles.statItem}>
            <BookOpen size={24} color="#F59E0B" />
            <Text style={localStyles.statValue}>
              {studyStats.totalSessions}
            </Text>
            <Text style={localStyles.statLabel}>Sessions</Text>
          </View>
        </View>

        {/* Achievements */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Achievements</Text>
          <View style={localStyles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  localStyles.achievementCard,
                  !achievement.earned && localStyles.achievementCardLocked,
                ]}
              >
                <Text style={localStyles.achievementIcon}>
                  {achievement.icon}
                </Text>
                <Text
                  style={[
                    localStyles.achievementTitle,
                    !achievement.earned && localStyles.achievementTitleLocked,
                  ]}
                >
                  {achievement.title}
                </Text>
                {!achievement.earned && (
                  <View style={localStyles.lockedOverlay}>
                    <Text style={localStyles.lockedText}>🔒</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Menu Options */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Settings</Text>

          <TouchableOpacity style={localStyles.menuItem}>
            <View style={localStyles.menuItemLeft}>
              <Settings size={20} color="#6B7280" />
              <Text style={localStyles.menuItemText}>Account Settings</Text>
            </View>
            <Text style={localStyles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={localStyles.menuItem}>
            <View style={localStyles.menuItemLeft}>
              <Award size={20} color="#6B7280" />
              <Text style={localStyles.menuItemText}>Achievements</Text>
            </View>
            <Text style={localStyles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={localStyles.menuItem}>
            <View style={localStyles.menuItemLeft}>
              <BookOpen size={20} color="#6B7280" />
              <Text style={localStyles.menuItemText}>Study Preferences</Text>
            </View>
            <Text style={localStyles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={localStyles.menuItem}>
            <View style={localStyles.menuItemLeft}>
              <Mail size={20} color="#6B7280" />
              <Text style={localStyles.menuItemText}>Notifications</Text>
            </View>
            <Text style={localStyles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Account Info */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Account Information</Text>

          <View style={localStyles.infoCard}>
            <View style={localStyles.infoRow}>
              <Text style={localStyles.infoLabel}>Login Method</Text>
              <View style={localStyles.loginMethodBadge}>
                <Text style={localStyles.loginMethodText}>
                  {user?.loginMethod === "google" ? "🔗 Google" : "📧 Email"}
                </Text>
              </View>
            </View>

            <View style={localStyles.infoRow}>
              <Text style={localStyles.infoLabel}>Account Status</Text>
              <View style={localStyles.statusBadge}>
                <Text style={localStyles.statusText}>Active</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={localStyles.signOutButton}
          onPress={handleSignOut}
        >
          <LogOut size={20} color="#fff" />
          <Text style={localStyles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// --- IMPORTANT: Style Definitions ---
// If you have these styles already defined in your Home.js (or Home.jsx)
// and exported as 'styles', you can remove this localStyles object.
// Otherwise, keep this here or move it to a dedicated ProfileStyles.js file
// and import it.
const localStyles = StyleSheet.create({
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
  profileSection: {
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)", // Fallback background
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 24,
    // fontFamily: "Inter-Bold",
    color: "#fff",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    // fontFamily: "Inter-Regular",
    color: "rgba(255,255,255,0.8)",
    marginBottom: 12,
  },
  memberSince: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  memberSinceText: {
    fontSize: 14,
    // fontFamily: "Inter-Regular",
    color: "rgba(255,255,255,0.7)",
  },
  statsOverview: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: -20,
    gap: 16,
  },
  statItem: {
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
  statValue: {
    fontSize: 20,
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
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    // fontFamily: "Inter-SemiBold",
    color: "#1F2937",
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  achievementCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  achievementCardLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    // fontFamily: "Inter-SemiBold",
    color: "#1F2937",
    textAlign: "center",
  },
  achievementTitleLocked: {
    color: "#9CA3AF",
  },
  lockedOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  lockedText: {
    fontSize: 16,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    // fontFamily: "Inter-Medium",
    color: "#374151",
  },
  menuItemArrow: {
    fontSize: 20,
    color: "#9CA3AF",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    // fontFamily: "Inter-Medium",
    color: "#6B7280",
  },
  loginMethodBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  loginMethodText: {
    fontSize: 12,
    // fontFamily: "Inter-SemiBold",
    color: "#6366F1",
  },
  statusBadge: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    // fontFamily: "Inter-SemiBold",
    color: "#10B981",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 40,
    gap: 8,
  },
  signOutText: {
    color: "#fff",
    fontSize: 16,
    // fontFamily: "Inter-SemiBold",
  },
});
