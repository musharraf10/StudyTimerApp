import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Feather";

const { width, height } = Dimensions.get("window");

const StudySettings = ({
  visible = true,
  onClose = () => {},
  initialSettings = {},
  onSave = () => {},
}) => {
  const [settings, setSettings] = useState({
    // Study Targets
    dailyHoursTarget: 2,
    weeklyHoursTarget: 14,
    dailySessionsTarget: 3,
    weeklySessionsTarget: 21,

    // Study Time Preferences
    preferredStudyStartTime: "09:00",
    preferredStudyEndTime: "17:00",
    bestFocusTime: "morning",
    studyDaysOfWeek: [1, 2, 3, 4, 5],

    // Goals
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

    ...initialSettings,
  });

  const [newGoal, setNewGoal] = useState({
    title: "",
    deadline: "",
    priority: "medium",
  });
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [slideAnim] = useState(new Animated.Value(height));
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const daysOfWeek = [
    { id: 1, name: "Mon", fullName: "Monday" },
    { id: 2, name: "Tue", fullName: "Tuesday" },
    { id: 3, name: "Wed", fullName: "Wednesday" },
    { id: 4, name: "Thu", fullName: "Thursday" },
    { id: 5, name: "Fri", fullName: "Friday" },
    { id: 6, name: "Sat", fullName: "Saturday" },
    { id: 0, name: "Sun", fullName: "Sunday" },
  ];

  const focusTimeOptions = [
    {
      id: "morning",
      label: "Morning",
      time: "6-12 AM",
      icon: "sunrise",
      colors: ["#fb923c", "#fbbf24"],
    },
    {
      id: "afternoon",
      label: "Afternoon",
      time: "12-6 PM",
      icon: "sun",
      colors: ["#fbbf24", "#f97316"],
    },
    {
      id: "evening",
      label: "Evening",
      time: "6-10 PM",
      icon: "sunset",
      colors: ["#f97316", "#a855f7"],
    },
    {
      id: "night",
      label: "Night",
      time: "10 PM-2 AM",
      icon: "moon",
      colors: ["#a855f7", "#4f46e5"],
    },
  ];

  const priorityColors = {
    high: ["#ef4444", "#dc2626"],
    medium: ["#eab308", "#f97316"],
    low: ["#10b981", "#059669"],
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleDayOfWeek = (dayId) => {
    const newDays = settings.studyDaysOfWeek.includes(dayId)
      ? settings.studyDaysOfWeek.filter((d) => d !== dayId)
      : [...settings.studyDaysOfWeek, dayId];
    updateSetting("studyDaysOfWeek", newDays);
  };

  const addGoal = () => {
    if (!newGoal.title.trim()) return;

    const goal = {
      id: Date.now(),
      title: newGoal.title,
      deadline: newGoal.deadline,
      priority: newGoal.priority,
      completed: false,
    };

    updateSetting("currentGoals", [...settings.currentGoals, goal]);
    setNewGoal({ title: "", deadline: "", priority: "medium" });
    setShowAddGoal(false);
  };

  const deleteGoal = (goalId) => {
    updateSetting(
      "currentGoals",
      settings.currentGoals.filter((g) => g.id !== goalId)
    );
  };

  const toggleGoalCompletion = (goalId) => {
    updateSetting(
      "currentGoals",
      settings.currentGoals.map((g) =>
        g.id === goalId ? { ...g, completed: !g.completed } : g
      )
    );
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const StudyTargetCard = ({ target, value, onUpdate }) => (
    <View style={styles.targetCard}>
      <LinearGradient
        colors={target.colors}
        style={styles.targetIconContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Icon name={target.icon} size={20} color="white" />
      </LinearGradient>
      <Text style={styles.targetLabel}>{target.label}</Text>
      <View style={styles.targetInputContainer}>
        <TextInput
          style={styles.targetInput}
          value={value.toString()}
          onChangeText={(text) => onUpdate(parseInt(text) || 0)}
          keyboardType="numeric"
          maxLength={2}
        />
        {target.unit && <Text style={styles.targetUnit}>{target.unit}</Text>}
      </View>
    </View>
  );

  const FocusTimeCard = ({ option, isSelected, onSelect }) => (
    <TouchableOpacity
      style={[styles.focusTimeCard, isSelected && styles.focusTimeCardSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      {isSelected ? (
        <LinearGradient
          colors={option.colors}
          style={styles.focusTimeCardGradient}
        >
          <Icon name={option.icon} size={24} color="white" />
          <Text style={styles.focusTimeLabel}>{option.label}</Text>
          <Text style={styles.focusTimeTime}>{option.time}</Text>
          <View style={styles.focusTimeCheck}>
            <Icon name="check" size={16} color="white" />
          </View>
        </LinearGradient>
      ) : (
        <View style={styles.focusTimeCardContent}>
          <Icon name={option.icon} size={24} color="#6b7280" />
          <Text style={styles.focusTimeLabelUnselected}>{option.label}</Text>
          <Text style={styles.focusTimeTimeUnselected}>{option.time}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.6)" barStyle="light-content" />
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
        >
          {/* Header */}
          <LinearGradient
            colors={["#4f46e5", "#7c3aed", "#ec4899"]}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.headerTitle}>Study Settings</Text>
                <Text style={styles.headerSubtitle}>
                  Customize your learning experience
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Icon name="x" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Study Targets */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={["#3b82f6", "#06b6d4"]}
                  style={styles.sectionIcon}
                >
                  <Icon name="target" size={20} color="white" />
                </LinearGradient>
                <Text style={styles.sectionTitle}>Study Targets</Text>
              </View>

              <View style={styles.targetsGrid}>
                <StudyTargetCard
                  target={{
                    icon: "clock",
                    label: "Daily Hours",
                    colors: ["#3b82f6", "#06b6d4"],
                    unit: "hrs",
                  }}
                  value={settings.dailyHoursTarget}
                  onUpdate={(value) => updateSetting("dailyHoursTarget", value)}
                />
                <StudyTargetCard
                  target={{
                    icon: "calendar",
                    label: "Weekly Hours",
                    colors: ["#10b981", "#14b8a6"],
                    unit: "hrs",
                  }}
                  value={settings.weeklyHoursTarget}
                  onUpdate={(value) =>
                    updateSetting("weeklyHoursTarget", value)
                  }
                />
                <StudyTargetCard
                  target={{
                    icon: "book-open",
                    label: "Daily Sessions",
                    colors: ["#f59e0b", "#f97316"],
                    unit: "",
                  }}
                  value={settings.dailySessionsTarget}
                  onUpdate={(value) =>
                    updateSetting("dailySessionsTarget", value)
                  }
                />
                <StudyTargetCard
                  target={{
                    icon: "trending-up",
                    label: "Weekly Sessions",
                    colors: ["#ec4899", "#f43f5e"],
                    unit: "",
                  }}
                  value={settings.weeklySessionsTarget}
                  onUpdate={(value) =>
                    updateSetting("weeklySessionsTarget", value)
                  }
                />
              </View>
            </View>

            {/* Study Time Preferences */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={["#7c3aed", "#4f46e5"]}
                  style={styles.sectionIcon}
                >
                  <Icon name="clock" size={20} color="white" />
                </LinearGradient>
                <Text style={styles.sectionTitle}>Study Time Preferences</Text>
              </View>

              <View style={styles.timePreferencesGrid}>
                <View style={styles.timeInputCard}>
                  <Text style={styles.timeInputLabel}>
                    Preferred Start Time
                  </Text>
                  <TextInput
                    style={styles.timeInput}
                    value={settings.preferredStudyStartTime}
                    onChangeText={(text) =>
                      updateSetting("preferredStudyStartTime", text)
                    }
                    placeholder="09:00"
                  />
                </View>
                <View style={styles.timeInputCard}>
                  <Text style={styles.timeInputLabel}>Preferred End Time</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={settings.preferredStudyEndTime}
                    onChangeText={(text) =>
                      updateSetting("preferredStudyEndTime", text)
                    }
                    placeholder="17:00"
                  />
                </View>
              </View>
            </View>

            {/* Best Focus Time */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={["#f97316", "#ec4899"]}
                  style={styles.sectionIcon}
                >
                  <Icon name="sun" size={20} color="white" />
                </LinearGradient>
                <Text style={styles.sectionTitle}>Best Focus Time</Text>
              </View>

              <View style={styles.focusTimeGrid}>
                {focusTimeOptions.map((option) => (
                  <FocusTimeCard
                    key={option.id}
                    option={option}
                    isSelected={settings.bestFocusTime === option.id}
                    onSelect={() => updateSetting("bestFocusTime", option.id)}
                  />
                ))}
              </View>
            </View>

            {/* Study Days */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={["#10b981", "#059669"]}
                  style={styles.sectionIcon}
                >
                  <Icon name="calendar" size={20} color="white" />
                </LinearGradient>
                <Text style={styles.sectionTitle}>Study Days</Text>
              </View>

              <View style={styles.daysContainer}>
                {daysOfWeek.map((day) => {
                  const isSelected = settings.studyDaysOfWeek.includes(day.id);
                  return (
                    <TouchableOpacity
                      key={day.id}
                      style={[
                        styles.dayButton,
                        isSelected && styles.dayButtonSelected,
                      ]}
                      onPress={() => toggleDayOfWeek(day.id)}
                      activeOpacity={0.7}
                    >
                      {isSelected ? (
                        <LinearGradient
                          colors={["#4f46e5", "#7c3aed"]}
                          style={styles.dayButtonGradient}
                        >
                          <Text style={styles.dayButtonTextSelected}>
                            {day.name}
                          </Text>
                        </LinearGradient>
                      ) : (
                        <Text style={styles.dayButtonText}>{day.name}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Goals */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={["#f43f5e", "#ec4899"]}
                  style={styles.sectionIcon}
                >
                  <Icon name="target" size={20} color="white" />
                </LinearGradient>
                <Text style={styles.sectionTitle}>Exam Goals</Text>
                <TouchableOpacity
                  style={styles.addGoalButton}
                  onPress={() => setShowAddGoal(true)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={["#4f46e5", "#7c3aed"]}
                    style={styles.addGoalButtonGradient}
                  >
                    <Icon name="plus" size={16} color="white" />
                    <Text style={styles.addGoalButtonText}>Add Goal</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Add Goal Form */}
              {showAddGoal && (
                <View style={styles.addGoalForm}>
                  <TextInput
                    style={styles.goalTitleInput}
                    value={newGoal.title}
                    onChangeText={(text) =>
                      setNewGoal({ ...newGoal, title: text })
                    }
                    placeholder="Enter exam goal (e.g., Complete JEE Main Mathematics)"
                    multiline
                  />

                  <View style={styles.goalFormRow}>
                    <TextInput
                      style={styles.goalDeadlineInput}
                      value={newGoal.deadline}
                      onChangeText={(text) =>
                        setNewGoal({ ...newGoal, deadline: text })
                      }
                      placeholder="2025-08-30"
                    />

                    <View style={styles.priorityButtons}>
                      {["high", "medium", "low"].map((priority) => (
                        <TouchableOpacity
                          key={priority}
                          style={[
                            styles.priorityButton,
                            newGoal.priority === priority &&
                              styles.priorityButtonSelected,
                          ]}
                          onPress={() => setNewGoal({ ...newGoal, priority })}
                          activeOpacity={0.7}
                        >
                          {newGoal.priority === priority ? (
                            <LinearGradient
                              colors={priorityColors[priority]}
                              style={styles.priorityButtonGradient}
                            >
                              <Text style={styles.priorityButtonTextSelected}>
                                {priority.charAt(0).toUpperCase() +
                                  priority.slice(1)}
                              </Text>
                            </LinearGradient>
                          ) : (
                            <Text style={styles.priorityButtonText}>
                              {priority.charAt(0).toUpperCase() +
                                priority.slice(1)}
                            </Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.goalFormActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setShowAddGoal(false)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={addGoal}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={["#4f46e5", "#7c3aed"]}
                        style={styles.addButtonGradient}
                      >
                        <Text style={styles.addButtonText}>Add Goal</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Goals List */}
              <View style={styles.goalsList}>
                {settings.currentGoals.map((goal) => (
                  <View key={goal.id} style={styles.goalCard}>
                    <View style={styles.goalContent}>
                      <TouchableOpacity
                        style={[
                          styles.goalCheckbox,
                          goal.completed && styles.goalCheckboxCompleted,
                        ]}
                        onPress={() => toggleGoalCompletion(goal.id)}
                        activeOpacity={0.7}
                      >
                        {goal.completed && (
                          <Icon name="check" size={14} color="white" />
                        )}
                      </TouchableOpacity>

                      <View style={styles.goalInfo}>
                        <Text
                          style={[
                            styles.goalTitle,
                            goal.completed && styles.goalTitleCompleted,
                          ]}
                        >
                          {goal.title}
                        </Text>
                        {goal.deadline && (
                          <Text style={styles.goalDeadline}>
                            Due: {new Date(goal.deadline).toLocaleDateString()}
                          </Text>
                        )}
                      </View>

                      <LinearGradient
                        colors={priorityColors[goal.priority]}
                        style={styles.priorityBadge}
                      >
                        <Text style={styles.priorityBadgeText}>
                          {goal.priority.toUpperCase()}
                        </Text>
                      </LinearGradient>

                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteGoal(goal.id)}
                        activeOpacity={0.7}
                      >
                        <Icon name="trash-2" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelFooterButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelFooterButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#4f46e5", "#7c3aed"]}
                style={styles.saveButtonGradient}
              >
                <Icon name="check" size={18} color="white" />
                <Text style={styles.saveButtonText}>Save Settings</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  container: {
    backgroundColor: "white",
    borderRadius: 24,
    width: "100%",
    maxHeight: height * 0.9,
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingTop: 40,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  targetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  targetCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    width: "48%",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  targetIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  targetLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  targetInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  targetInput: {
    width: 48,
    height: 40,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  targetUnit: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
    fontWeight: "500",
  },
  timePreferencesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeInputCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    width: "48%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timeInputLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
    fontWeight: "500",
  },
  timeInput: {
    height: 44,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  focusTimeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  focusTimeCard: {
    width: "48%",
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  focusTimeCardSelected: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  focusTimeCardGradient: {
    padding: 16,
    minHeight: 100,
    justifyContent: "space-between",
    position: "relative",
  },
  focusTimeCardContent: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    minHeight: 100,
    justifyContent: "space-between",
  },
  focusTimeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginTop: 8,
  },
  focusTimeLabelUnselected: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 8,
  },
  focusTimeTime: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  focusTimeTimeUnselected: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  focusTimeCheck: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dayButton: {
    width: "13%",
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  dayButtonSelected: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dayButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    textAlign: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#f3f4f6",
  },
  dayButtonTextSelected: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  addGoalButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  addGoalButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addGoalButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
  addGoalForm: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  goalTitleInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    minHeight: 48,
  },
  goalFormRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  goalDeadlineInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    flex: 1,
    marginRight: 12,
  },
  priorityButtons: {
    flexDirection: "row",
  },
  priorityButton: {
    marginLeft: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  priorityButtonSelected: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  priorityButtonGradient: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  priorityButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  priorityButtonTextSelected: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  goalFormActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    color: "#6b7280",
  },
  addButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  addButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  goalsList: {
    marginTop: 8,
  },
  goalCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  goalContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  goalCheckboxCompleted: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  goalInfo: {
    flex: 1,
    marginRight: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  goalTitleCompleted: {
    textDecorationLine: "line-through",
    color: "#6b7280",
  },
  goalDeadline: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  deleteButton: {
    padding: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#f9fafb",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  cancelFooterButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 16,
  },
  cancelFooterButtonText: {
    fontSize: 16,
    color: "#6b7280",
  },
  saveButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  saveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
});

export default StudySettings;
