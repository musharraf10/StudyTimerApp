import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Switch,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import {
  User,
  Settings,
  Award,
  BookOpen,
  Clock,
  TrendingUp,
  LogOut,
  Calendar,
  ChevronRight,
  Bell,
  Camera,
} from "lucide-react-native";

import { AuthContext } from "../context/AuthContext";
import { AuthService } from "../utils/authService";
import AccountSettingsModal from "../components/AccountSettingsModal";
import AchievementsModal from "../components/AchievementsModal";
import StudySettings from "../components/StudySettingsModel";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function ProfileScreen({ navigation }) {
  const { user, setUser } = useContext(AuthContext);

  // Animation values
  const scrollY = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  // Modal states
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showStudyPreferences, setShowStudyPreferences] = useState(false);

  // Study stats state
  const [studyStats, setStudyStats] = useState({
    weeklyGoal: 20,
    completedGoal: 15,
  });

  // User settings
  const [userSettings, setUserSettings] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    notificationsEnabled: true,
    studyReminders: true,
    achievementNotifications: true,
    emailNotifications: false,
    dailyGoal: 2,
    weeklyHoursTarget: 14,
    dailySessionsTarget: 3,
    weeklySessionsTarget: 21,
    preferredStudyStartTime: "09:00",
    preferredStudyEndTime: "17:00",
    bestFocusTime: "morning",
    studyDaysOfWeek: [1, 2, 3, 4, 5],
    currentGoals: [
      {
        id: 1,
        title: "Complete JEE Main Mathematics",
        deadline: "2025-08-30",
        priority: "high",
        completed: false,
      },
      {
        id: 2,
        title: "NEET Biology Revision",
        deadline: "2025-07-25",
        priority: "medium",
        completed: false,
      },
      {
        id: 3,
        title: "CAT Quantitative Aptitude",
        deadline: "2025-09-15",
        priority: "high",
        completed: false,
      },
    ],
  });

  // Request image picker permissions
  useEffect(() => {
    (async () => {
      const { status: libraryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      if (libraryStatus !== "granted" || cameraStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant access to photos and camera."
        );
      }
    })();
  }, []);

  // Handle image upload
  const handleImageUpload = async () => {
    Alert.alert("Choose Image", "Select an image source", [
      {
        text: "Gallery",
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          });
          if (!result.canceled && result.assets) {
            const uri = result.assets[0].uri;
            try {
              const updatedUser = await AuthService.updateAvatar(uri);
              setUser(updatedUser);
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          }
        },
      },
      {
        text: "Camera",
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          });
          if (!result.canceled && result.assets) {
            const uri = result.assets[0].uri;
            try {
              const updatedUser = await AuthService.updateAvatar(uri);
              setUser(updatedUser);
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await AuthService.logout();
            setUser(null);
          } catch (error) {
            Alert.alert("Error", "Failed to sign out. Please try again.");
          }
        },
      },
    ]);
  };

  const handleSaveStudySettings = useCallback((newSettings) => {
    console.log("Saving study settings:", newSettings);
    setUserSettings((prev) => ({
      ...prev,
      dailyGoal: newSettings.dailyHoursTarget,
      weeklyHoursTarget: newSettings.weeklyHoursTarget,
      dailySessionsTarget: newSettings.dailySessionsTarget,
      weeklySessionsTarget: newSettings.weeklySessionsTarget,
      preferredStudyStartTime: newSettings.preferredStudyStartTime,
      preferredStudyEndTime: newSettings.preferredStudyEndTime,
      bestFocusTime: newSettings.bestFocusTime,
      studyDaysOfWeek: newSettings.studyDaysOfWeek,
      currentGoals: newSettings.currentGoals,
    }));
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "N/A";
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: "clamp",
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -20],
    extrapolate: "clamp",
  });

  // Memoized modal props
  const accountSettingsProps = useMemo(
    () => ({
      visible: showAccountSettings,
      onClose: () => {
        console.log("Closing Account Settings");
        setShowAccountSettings(false);
      },
      userSettings,
      setUserSettings,
      user,
      setUser,
    }),
    [showAccountSettings, userSettings, user]
  );

  const achievementsProps = useMemo(
    () => ({
      visible: showAchievements,
      onClose: () => {
        console.log("Closing Achievements");
        setShowAchievements(false);
      },
      achievements,
    }),
    [showAchievements]
  );

  const studySettingsProps = useMemo(
    () => ({
      visible: showStudyPreferences,
      onClose: () => {
        console.log("Closing Study Settings");
        setShowStudyPreferences(false);
      },
      userSettings,
      setUserSettings,
      onSave: handleSaveStudySettings,
    }),
    [showStudyPreferences, userSettings, handleSaveStudySettings]
  );

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        style={{ zIndex: 5 }}
      >
        {/* Profile Header */}
        <Animated.View
          style={[
            {
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslateY }],
            },
          ]}
        >
          <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                {user?.avatar ? (
                  <Image
                    source={{ uri: user.avatar }}
                    style={styles.avatar}
                    onError={() =>
                      Alert.alert("Error", "Failed to load avatar image.")
                    }
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <User size={40} color="#6366F1" />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.editAvatarButton}
                  onPress={handleImageUpload}
                >
                  <Camera size={16} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={styles.userName}>
                {userSettings.displayName || "User"}
              </Text>
              <Text style={styles.userEmail}>
                {userSettings.email || "No email"}
              </Text>
              <View style={styles.memberSince}>
                <Calendar size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.memberSinceText}>
                  Member since{" "}
                  {user?.createdAt ? formatDate(user.createdAt) : "Recently"}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Achievements Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <View style={styles.achievementsPreview}>
            {achievements
              .filter((a) => a.earned)
              .slice(0, 4)
              .map((achievement) => (
                <View
                  key={achievement.id}
                  style={styles.achievementPreviewCard}
                >
                  <Text style={styles.achievementPreviewIcon}>
                    {achievement.icon}
                  </Text>
                  <Text style={styles.achievementPreviewTitle}>
                    {achievement.title}
                  </Text>
                </View>
              ))}
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              console.log("Opening Account Settings");
              setShowAccountSettings(true);
            }}
          >
            <View style={styles.menuItemLeft}>
              <Settings size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>Account Settings</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              console.log("Opening Achievements");
              setShowAchievements(true);
            }}
          >
            <View style={styles.menuItemLeft}>
              <Award size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>Achievements</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              console.log("Opening Study Settings");
              setShowStudyPreferences(true);
            }}
          >
            <View style={styles.menuItemLeft}>
              <BookOpen size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>Study Settings</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Bell size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>Notifications</Text>
            </View>
            <Switch
              value={userSettings.notificationsEnabled}
              onValueChange={(value) =>
                setUserSettings({
                  ...userSettings,
                  notificationsEnabled: value,
                })
              }
              trackColor={{ false: "#E5E7EB", true: "#6366F1" }}
              thumbColor={
                userSettings.notificationsEnabled ? "#ffffff" : "#f4f3f4"
              }
            />
          </TouchableOpacity>
        </View>

        {/* Account Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Login Method</Text>
              <View style={styles.loginMethodBadge}>
                <Text style={styles.loginMethodText}>
                  {user?.loginMethod === "google" ? "🔗 Google" : "📧 Email"}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Status</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Weekly Progress</Text>
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  {studyStats.completedGoal}/{studyStats.weeklyGoal}h
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          (studyStats.completedGoal / studyStats.weeklyGoal) *
                          100
                        }%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#fff" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </Animated.ScrollView>

      {/* Modals */}
      <AccountSettingsModal {...accountSettingsProps} />
      <AchievementsModal {...achievementsProps} />
      <StudySettings {...studySettingsProps} />
    </View>
  );
}

// Achievements data
const achievements = [
  {
    id: 1,
    title: "7",
    icon: "🔥",
    earned: true,
    description: "Study for 7 consecutive days",
  },
  {
    id: 2,
    title: "Early Bird",
    icon: "🌅",
    earned: true,
    description: "Start studying before 8 AM",
  },
  {
    id: 3,
    title: "Night Owl",
    icon: "🦉",
    earned: false,
    description: "Study after 10 PM for 5 days",
  },
  {
    id: 4,
    title: "Consistent Reader",
    icon: "📚",
    earned: false,
    description: "Complete 20 reading sessions",
  },
  {
    id: 5,
    title: "First Session",
    icon: "✨",
    earned: true,
    description: "Complete your first study session",
  },
  {
    id: 6,
    title: "Deep Focus",
    icon: "🧠",
    earned: true,
    description: "Study for 3+ hours in a single session",
  },
  {
    id: 7,
    title: "Goal Crusher",
    icon: "🎯",
    earned: true,
    description: "Exceed weekly goal by 50%",
  },
  {
    id: 8,
    title: "Dedication",
    icon: "💪",
    earned: false,
    description: "Study for 30 consecutive days",
  },
];

// Styles
const styles = StyleSheet.create({
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
    zIndex: 10,
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
    backgroundColor: "rgba(255,255,255,0.2)",
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
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
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
    color: "rgba(255,255,255,0.7)",
  },
  statsOverview: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: -20,
    gap: 16,
    zIndex: 10,
    backgroundColor: "#F8FAFC",
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
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    textTransform: "uppercase",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
    zIndex: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  achievementsPreview: {
    flexDirection: "row",
    gap: 12,
  },
  achievementPreviewCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  achievementPreviewIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  achievementPreviewTitle: {
    fontSize: 10,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
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
    fontWeight: "500",
    color: "#374151",
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
    fontWeight: "500",
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
    fontWeight: "600",
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
    fontWeight: "600",
    color: "#10B981",
  },
  progressContainer: {
    alignItems: "flex-end",
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6366F1",
    marginBottom: 4,
  },
  progressBar: {
    width: 100,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 2,
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
    fontWeight: "600",
  },
});
