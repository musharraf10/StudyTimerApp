import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Switch,
  Dimensions,
  Modal,
} from "react-native";
import { X, Edit3, Lock, Eye, EyeOff, Check, UserX } from "lucide-react-native";
import { AuthService } from "../utils/authService";

const AccountSettingsModal = ({
  visible,
  onClose,
  userSettings,
  setUserSettings,
  user,
  setUser,
}) => {
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

  const handleSaveSettings = async (field, value) => {
    try {
      const updatedSettings = { ...userSettings, [field]: value };
      setUserSettings(updatedSettings);

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

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Account Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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
};

// Styles remain the same as in the original ProfileScreen
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: Dimensions.get("window").height * 0.9,
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
  settingSection: {
    marginTop: 16,
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
});

export default AccountSettingsModal;
