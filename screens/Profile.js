import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  TextInput,
  Switch,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  User,
  Settings,
  Award,
  BookOpen,
  Clock,
  TrendingUp,
  LogOut,
  Edit3,
  Mail,
  Calendar,
  ChevronRight,
  Phone,
  Lock,
  Bell,
  UserX,
  Eye,
  EyeOff,
  Camera,
  Check,
  X,
} from "lucide-react-native";

import { AuthContext } from "../context/AuthContext";
import { AuthService } from "../utils/authService";
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
  const [showNotifications, setShowNotifications] = useState(false);

  // Settings states
  const [userSettings, setUserSettings] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    notificationsEnabled: true,
    studyReminders: true,
    achievementNotifications: true,
    emailNotifications: false,
    dailyGoal: 2,
    breakInterval: 25,
    sessionLength: 50,
  });

  const [isEditing, setIsEditing] = useState({
    name: false,
    password: false,
    phone: false,
  });

  const [tempValues, setTempValues] = useState({
    displayName: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const studyStats = {
    todayHours: 2.5,
    currentStreak: 7,
    totalSessions: 42,
    weeklyGoal: 20,
    completedGoal: 15,
  };

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

  const handleSaveSettings = async (field, value) => {
    try {
      // Here you would typically call your API to update user settings
      const updatedSettings = { ...userSettings, [field]: value };
      setUserSettings(updatedSettings);

      // Update user context if it's a user field
      if (field === "displayName" || field === "phone") {
        setUser({ ...user, [field]: value });
      }

      setIsEditing({ ...isEditing, [field]: false });
      Alert.alert("Success", "Settings updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update settings. Please try again.");
    }
  };

  const handlePasswordChange = async () => {
    if (tempValues.newPassword !== tempValues.confirmPassword) {
      Alert.alert("Error", "New passwords don't match!");
      return;
    }

    if (tempValues.newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long!");
      return;
    }

    try {
      // Here you would call your API to change password
      await AuthService.changePassword(
        tempValues.currentPassword,
        tempValues.newPassword
      );
      setTempValues({
        ...tempValues,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsEditing({ ...isEditing, password: false });
      Alert.alert("Success", "Password changed successfully!");
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to change password. Please check your current password."
      );
    }
  };

  const handleDeactivateAccount = () => {
    Alert.alert(
      "Deactivate Account",
      "Are you sure you want to deactivate your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: async () => {
            try {
              await AuthService.deactivateAccount();
              setUser(null);
            } catch (error) {
              Alert.alert("Error", "Failed to deactivate account.");
            }
          },
        },
      ]
    );
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
      return "N/A";
    }
  };

  const renderAccountSettingsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showAccountSettings}
      onRequestClose={() => setShowAccountSettings(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Account Settings</Text>
            <TouchableOpacity
              onPress={() => setShowAccountSettings(false)}
              style={styles.closeButton}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Display Name */}
            <View style={styles.settingSection}>
              <Text style={styles.settingLabel}>Display Name</Text>
              <View style={styles.settingRow}>
                {isEditing.name ? (
                  <View style={styles.editingContainer}>
                    <TextInput
                      style={styles.settingInput}
                      value={tempValues.displayName}
                      onChangeText={(text) =>
                        setTempValues({ ...tempValues, displayName: text })
                      }
                      placeholder="Enter display name"
                      autoFocus
                    />
                    <View style={styles.editingActions}>
                      <TouchableOpacity
                        onPress={() =>
                          handleSaveSettings(
                            "displayName",
                            tempValues.displayName
                          )
                        }
                        style={styles.saveButton}
                      >
                        <Check size={20} color="#10B981" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setIsEditing({ ...isEditing, name: false });
                          setTempValues({ ...tempValues, displayName: "" });
                        }}
                        style={styles.cancelButton}
                      >
                        <X size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.settingDisplay}>
                    <Text style={styles.settingValue}>
                      {userSettings.displayName}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setIsEditing({ ...isEditing, name: true });
                        setTempValues({
                          ...tempValues,
                          displayName: userSettings.displayName,
                        });
                      }}
                      style={styles.editButton}
                    >
                      <Edit3 size={18} color="#6366F1" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* Email */}
            <View style={styles.settingSection}>
              <Text style={styles.settingLabel}>Email Address</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingValue}>{userSettings.email}</Text>
                <Text style={styles.settingNote}>Email cannot be changed</Text>
              </View>
            </View>

            {/* Phone Number */}
            <View style={styles.settingSection}>
              <Text style={styles.settingLabel}>Phone Number</Text>
              <View style={styles.settingRow}>
                {isEditing.phone ? (
                  <View style={styles.editingContainer}>
                    <TextInput
                      style={styles.settingInput}
                      value={tempValues.phone}
                      onChangeText={(text) =>
                        setTempValues({ ...tempValues, phone: text })
                      }
                      placeholder="Enter phone number"
                      keyboardType="phone-pad"
                      autoFocus
                    />
                    <View style={styles.editingActions}>
                      <TouchableOpacity
                        onPress={() =>
                          handleSaveSettings("phone", tempValues.phone)
                        }
                        style={styles.saveButton}
                      >
                        <Check size={20} color="#10B981" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setIsEditing({ ...isEditing, phone: false });
                          setTempValues({ ...tempValues, phone: "" });
                        }}
                        style={styles.cancelButton}
                      >
                        <X size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.settingDisplay}>
                    <Text style={styles.settingValue}>
                      {userSettings.phone || "Not set"}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setIsEditing({ ...isEditing, phone: true });
                        setTempValues({
                          ...tempValues,
                          phone: userSettings.phone,
                        });
                      }}
                      style={styles.editButton}
                    >
                      <Edit3 size={18} color="#6366F1" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* Change Password */}
            <View style={styles.settingSection}>
              <Text style={styles.settingLabel}>Password</Text>
              {isEditing.password ? (
                <View style={styles.passwordContainer}>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      value={tempValues.currentPassword}
                      onChangeText={(text) =>
                        setTempValues({ ...tempValues, currentPassword: text })
                      }
                      placeholder="Current password"
                      secureTextEntry={!showPassword.current}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowPassword({
                          ...showPassword,
                          current: !showPassword.current,
                        })
                      }
                      style={styles.passwordToggle}
                    >
                      {showPassword.current ? (
                        <EyeOff size={20} color="#6B7280" />
                      ) : (
                        <Eye size={20} color="#6B7280" />
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      value={tempValues.newPassword}
                      onChangeText={(text) =>
                        setTempValues({ ...tempValues, newPassword: text })
                      }
                      placeholder="New password"
                      secureTextEntry={!showPassword.new}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowPassword({
                          ...showPassword,
                          new: !showPassword.new,
                        })
                      }
                      style={styles.passwordToggle}
                    >
                      {showPassword.new ? (
                        <EyeOff size={20} color="#6B7280" />
                      ) : (
                        <Eye size={20} color="#6B7280" />
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      value={tempValues.confirmPassword}
                      onChangeText={(text) =>
                        setTempValues({ ...tempValues, confirmPassword: text })
                      }
                      placeholder="Confirm new password"
                      secureTextEntry={!showPassword.confirm}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowPassword({
                          ...showPassword,
                          confirm: !showPassword.confirm,
                        })
                      }
                      style={styles.passwordToggle}
                    >
                      {showPassword.confirm ? (
                        <EyeOff size={20} color="#6B7280" />
                      ) : (
                        <Eye size={20} color="#6B7280" />
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.passwordActions}>
                    <TouchableOpacity
                      onPress={handlePasswordChange}
                      style={styles.savePasswordButton}
                    >
                      <Text style={styles.savePasswordText}>Save Password</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setIsEditing({ ...isEditing, password: false });
                        setTempValues({
                          ...tempValues,
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                      style={styles.cancelPasswordButton}
                    >
                      <Text style={styles.cancelPasswordText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setIsEditing({ ...isEditing, password: true })}
                  style={styles.changePasswordButton}
                >
                  <Lock size={20} color="#6366F1" />
                  <Text style={styles.changePasswordText}>Change Password</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Notifications */}
            <View style={styles.settingSection}>
              <Text style={styles.settingLabel}>Notifications</Text>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Push Notifications</Text>
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
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Study Reminders</Text>
                <Switch
                  value={userSettings.studyReminders}
                  onValueChange={(value) =>
                    setUserSettings({ ...userSettings, studyReminders: value })
                  }
                  trackColor={{ false: "#E5E7EB", true: "#6366F1" }}
                  thumbColor={
                    userSettings.studyReminders ? "#ffffff" : "#f4f3f4"
                  }
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>
                  Achievement Notifications
                </Text>
                <Switch
                  value={userSettings.achievementNotifications}
                  onValueChange={(value) =>
                    setUserSettings({
                      ...userSettings,
                      achievementNotifications: value,
                    })
                  }
                  trackColor={{ false: "#E5E7EB", true: "#6366F1" }}
                  thumbColor={
                    userSettings.achievementNotifications
                      ? "#ffffff"
                      : "#f4f3f4"
                  }
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Email Notifications</Text>
                <Switch
                  value={userSettings.emailNotifications}
                  onValueChange={(value) =>
                    setUserSettings({
                      ...userSettings,
                      emailNotifications: value,
                    })
                  }
                  trackColor={{ false: "#E5E7EB", true: "#6366F1" }}
                  thumbColor={
                    userSettings.emailNotifications ? "#ffffff" : "#f4f3f4"
                  }
                />
              </View>
            </View>

            {/* Danger Zone */}
            <View style={styles.dangerZone}>
              <TouchableOpacity
                onPress={handleDeactivateAccount}
                style={styles.deactivateButton}
              >
                <UserX size={20} color="#EF4444" />
                <Text style={styles.deactivateText}>Deactivate Account</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderAchievementsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showAchievements}
      onRequestClose={() => setShowAchievements(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Achievements</Text>
            <TouchableOpacity
              onPress={() => setShowAchievements(false)}
              style={styles.closeButton}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.achievementsContainer}>
              {achievements.map((achievement) => (
                <View
                  key={achievement.id}
                  style={[
                    styles.achievementDetailCard,
                    !achievement.earned && styles.achievementDetailCardLocked,
                  ]}
                >
                  <View style={styles.achievementDetailHeader}>
                    <Text style={styles.achievementDetailIcon}>
                      {achievement.icon}
                    </Text>
                    <View style={styles.achievementDetailInfo}>
                      <Text
                        style={[
                          styles.achievementDetailTitle,
                          !achievement.earned &&
                            styles.achievementDetailTitleLocked,
                        ]}
                      >
                        {achievement.title}
                      </Text>
                      <Text
                        style={[
                          styles.achievementDetailDescription,
                          !achievement.earned &&
                            styles.achievementDetailDescriptionLocked,
                        ]}
                      >
                        {achievement.description}
                      </Text>
                    </View>
                    {achievement.earned ? (
                      <View style={styles.earnedBadge}>
                        <Check size={16} color="#10B981" />
                      </View>
                    ) : (
                      <View style={styles.lockedBadge}>
                        <Text style={styles.lockedBadgeText}>🔒</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderStudyPreferencesModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showStudyPreferences}
      onRequestClose={() => setShowStudyPreferences(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Study Settings</Text>
            <TouchableOpacity
              onPress={() => setShowStudyPreferences(false)}
              style={styles.closeButton}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.preferenceSection}>
              <Text style={styles.preferenceLabel}>
                Daily Study Goal (hours)
              </Text>
              <View style={styles.preferenceSlider}>
                <Text style={styles.preferenceValue}>
                  {userSettings.dailyGoal}h
                </Text>
                {/* You can add a slider component here */}
              </View>
            </View>

            <View style={styles.preferenceSection}>
              <Text style={styles.preferenceLabel}>
                Pomodoro Break Interval (minutes)
              </Text>
              <View style={styles.preferenceSlider}>
                <Text style={styles.preferenceValue}>
                  {userSettings.breakInterval}min
                </Text>
              </View>
            </View>

            <View style={styles.preferenceSection}>
              <Text style={styles.preferenceLabel}>
                Study Session Length (minutes)
              </Text>
              <View style={styles.preferenceSlider}>
                <Text style={styles.preferenceValue}>
                  {userSettings.sessionLength}min
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

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

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
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
                  <Image source={{ uri: user.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <User size={40} color="#6366F1" />
                  </View>
                )}
                <TouchableOpacity style={styles.editAvatarButton}>
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

        {/* Stats Overview */}
        {/* <Animated.View style={[styles.statsOverview, { opacity: fadeAnim }]}>
          <View style={styles.statItem}>
            <Clock size={24} color="#6366F1" />
            <Text style={styles.statValue}>
              {studyStats.todayHours.toFixed(1)}h
            </Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>

          <View style={styles.statItem}>
            <TrendingUp size={24} color="#10B981" />
            <Text style={styles.statValue}>{studyStats.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>

          <View style={styles.statItem}>
            <BookOpen size={24} color="#F59E0B" />
            <Text style={styles.statValue}>{studyStats.totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
        </Animated.View> */}

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
            onPress={() => setShowAccountSettings(true)}
          >
            <View style={styles.menuItemLeft}>
              <Settings size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>Account Settings</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowAchievements(true)}
          >
            <View style={styles.menuItemLeft}>
              <Award size={20} color="#6B7280" />
              <Text style={styles.menuItemText}>Achievements</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowStudyPreferences(true)}
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
      {renderAccountSettingsModal()}
      {renderAchievementsModal()}
      {renderStudyPreferencesModal()}
    </View>
  );
}

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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: screenHeight * 0.9,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    paddingHorizontal: 20,
  },

  // Account Settings Styles
  settingSection: {
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  settingRow: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
  },
  settingDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingValue: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
  },
  settingNote: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  editButton: {
    padding: 4,
  },
  editingContainer: {
    gap: 8,
  },
  settingInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#374151",
  },
  editingActions: {
    flexDirection: "row",
    gap: 8,
  },
  saveButton: {
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  changePasswordButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
  },
  changePasswordText: {
    fontSize: 16,
    color: "#6366F1",
    fontWeight: "500",
  },
  passwordContainer: {
    gap: 12,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#374151",
  },
  passwordToggle: {
    padding: 12,
  },
  passwordActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  savePasswordButton: {
    flex: 1,
    backgroundColor: "#6366F1",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  savePasswordText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelPasswordButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelPasswordText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  switchLabel: {
    fontSize: 16,
    color: "#374151",
  },
  dangerZone: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#FEE2E2",
  },
  dangerZoneTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
    marginBottom: 12,
  },
  deactivateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  deactivateText: {
    fontSize: 16,
    color: "#EF4444",
    fontWeight: "500",
  },

  // Achievements Modal Styles
  achievementsContainer: {
    gap: 12,
  },
  achievementDetailCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  achievementDetailCardLocked: {
    opacity: 0.6,
    backgroundColor: "#F9FAFB",
  },
  achievementDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  achievementDetailIcon: {
    fontSize: 32,
  },
  achievementDetailInfo: {
    flex: 1,
  },
  achievementDetailTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  achievementDetailTitleLocked: {
    color: "#9CA3AF",
  },
  achievementDetailDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  achievementDetailDescriptionLocked: {
    color: "#D1D5DB",
  },
  earnedBadge: {
    backgroundColor: "#ECFDF5",
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  lockedBadge: {
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  lockedBadgeText: {
    fontSize: 16,
  },

  // Study Preferences Styles
  preferenceSection: {
    marginBottom: 24,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  preferenceSlider: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  preferenceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6366F1",
  },
});
