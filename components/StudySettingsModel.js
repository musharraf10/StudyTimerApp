import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Dimensions,
} from "react-native";
import {
  X,
  Clock,
  Calendar,
  Sun,
  Target,
  Plus,
  Trash2,
  Check,
} from "lucide-react-native";

const { height } = Dimensions.get("window");

const StudySettings = ({
  visible,
  onClose,
  userSettings,
  setUserSettings,
  onSave,
}) => {
  const [settings, setSettings] = useState({
    dailyHoursTarget: userSettings.dailyHoursTarget || 2,
    weeklyHoursTarget: userSettings.weeklyHoursTarget || 14,
    dailySessionsTarget: userSettings.dailySessionsTarget || 3,
    weeklySessionsTarget: userSettings.weeklySessionsTarget || 21,
    preferredStudyStartTime: userSettings.preferredStudyStartTime || "09:00",
    preferredStudyEndTime: userSettings.preferredStudyEndTime || "17:00",
    bestFocusTime: userSettings.bestFocusTime || "morning",
    studyDaysOfWeek: userSettings.studyDaysOfWeek || [1, 2, 3, 4, 5],
    currentGoals: userSettings.currentGoals || [
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

  const [newGoal, setNewGoal] = useState({
    title: "",
    deadline: "",
    priority: "medium",
  });
  const [showAddGoal, setShowAddGoal] = useState(false);

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
    { id: "morning", label: "Morning", time: "6-12 AM" },
    { id: "afternoon", label: "Afternoon", time: "12-6 PM" },
    { id: "evening", label: "Evening", time: "6-10 PM" },
    { id: "night", label: "Night", time: "10 PM-2 AM" },
  ];

  const priorityOptions = [
    { value: "high", label: "High", color: "#EF4444" },
    { value: "medium", label: "Medium", color: "#F59E0B" },
    { value: "low", label: "Low", color: "#10B981" },
  ];

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

  const StudyTargetCard = ({ target, value, onUpdate, unit }) => (
    <View style={styles.preferenceSection}>
      <Text style={styles.preferenceLabel}>{target}</Text>
      <View style={styles.preferenceInputContainer}>
        <TextInput
          style={styles.preferenceInput}
          value={value.toString()}
          onChangeText={(text) => onUpdate(parseInt(text) || 0)}
          keyboardType="numeric"
          maxLength={2}
        />
        {unit && <Text style={styles.preferenceUnit}>{unit}</Text>}
      </View>
    </View>
  );

  const FocusTimeCard = ({ option, isSelected, onSelect }) => (
    <TouchableOpacity
      style={[styles.focusTimeCard, isSelected && styles.focusTimeCardSelected]}
      onPress={onSelect}
    >
      <Text style={styles.focusTimeLabel}>{option.label}</Text>
      <Text style={styles.focusTimeTime}>{option.time}</Text>
      {isSelected && (
        <View style={styles.focusTimeCheck}>
          <Check size={16} color="#6366F1" />
        </View>
      )}
    </TouchableOpacity>
  );

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
            <Text style={styles.modalTitle}>Study Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Study Targets */}
            <StudyTargetCard
              target="Daily Hours Target"
              value={settings.dailyHoursTarget}
              onUpdate={(value) => updateSetting("dailyHoursTarget", value)}
              unit="hrs"
              icon={<Clock size={20} color="#6B7280" />}
            />
            <StudyTargetCard
              target="Weekly Hours Target"
              value={settings.weeklyHoursTarget}
              onUpdate={(value) => updateSetting("weeklyHoursTarget", value)}
              unit="hrs"
              icon={<Calendar size={20} color="#6B7280" />}
            />
            <StudyTargetCard
              target="Daily Sessions Target"
              value={settings.dailySessionsTarget}
              onUpdate={(value) => updateSetting("dailySessionsTarget", value)}
              icon={<Clock size={20} color="#6B7280" />}
            />
            <StudyTargetCard
              target="Weekly Sessions Target"
              value={settings.weeklySessionsTarget}
              onUpdate={(value) => updateSetting("weeklySessionsTarget", value)}
              icon={<Calendar size={20} color="#6B7280" />}
            />

            {/* Study Time Preferences */}
            <View style={styles.preferenceSection}>
              <Text style={styles.preferenceLabel}>Preferred Start Time</Text>
              <TextInput
                style={styles.preferenceInput}
                value={settings.preferredStudyStartTime}
                onChangeText={(text) =>
                  updateSetting("preferredStudyStartTime", text)
                }
                placeholder="09:00"
              />
            </View>
            <View style={styles.preferenceSection}>
              <Text style={styles.preferenceLabel}>Preferred End Time</Text>
              <TextInput
                style={styles.preferenceInput}
                value={settings.preferredStudyEndTime}
                onChangeText={(text) =>
                  updateSetting("preferredStudyEndTime", text)
                }
                placeholder="17:00"
              />
            </View>

            {/* Best Focus Time */}
            <View style={styles.preferenceSection}>
              <Text style={styles.preferenceLabel}>Best Focus Time</Text>
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
            <View style={styles.preferenceSection}>
              <Text style={styles.preferenceLabel}>Study Days</Text>
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
                    >
                      <Text
                        style={[
                          styles.dayButtonText,
                          isSelected && styles.dayButtonTextSelected,
                        ]}
                      >
                        {day.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Exam Goals */}
            <View style={styles.preferenceSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.preferenceLabel}>Exam Goals</Text>
                <TouchableOpacity
                  style={styles.addGoalButton}
                  onPress={() => setShowAddGoal(true)}
                >
                  <Plus size={20} color="#6366F1" />
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
                    placeholder="Enter exam goal"
                    multiline
                  />
                  <View style={styles.goalFormRow}>
                    <TextInput
                      style={styles.goalDeadlineInput}
                      value={newGoal.deadline}
                      onChangeText={(text) =>
                        setNewGoal({ ...newGoal, deadline: text })
                      }
                      placeholder="YYYY-MM-DD"
                    />
                    <View style={styles.priorityButtons}>
                      {priorityOptions.map((priority) => (
                        <TouchableOpacity
                          key={priority.value}
                          style={[
                            styles.priorityButton,
                            newGoal.priority === priority.value && {
                              backgroundColor: priority.color,
                            },
                          ]}
                          onPress={() =>
                            setNewGoal({ ...newGoal, priority: priority.value })
                          }
                        >
                          <Text
                            style={[
                              styles.priorityButtonText,
                              newGoal.priority === priority.value &&
                                styles.priorityButtonTextSelected,
                            ]}
                          >
                            {priority.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <View style={styles.goalFormActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setShowAddGoal(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={addGoal}
                    >
                      <Text style={styles.addButtonText}>Add Goal</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Goals List */}
              {settings.currentGoals.map((goal) => (
                <View key={goal.id} style={styles.goalCard}>
                  <TouchableOpacity
                    style={[
                      styles.goalCheckbox,
                      goal.completed && styles.goalCheckboxCompleted,
                    ]}
                    onPress={() => toggleGoalCompletion(goal.id)}
                  >
                    {goal.completed && <Check size={14} color="#fff" />}
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
                  <View
                    style={[
                      styles.priorityBadge,
                      {
                        backgroundColor: priorityOptions.find(
                          (p) => p.value === goal.priority
                        ).color,
                      },
                    ]}
                  >
                    <Text style={styles.priorityBadgeText}>
                      {goal.priority.toUpperCase()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteGoal(goal.id)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

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
    maxHeight: height * 0.9,
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
    marginTop: 16,
    paddingHorizontal: 20,
  },
  preferenceSection: {
    marginBottom: 24,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  preferenceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
  },
  preferenceInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 4,
  },
  preferenceUnit: {
    fontSize: 16,
    color: "#6B7280",
    marginLeft: 8,
  },
  focusTimeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  focusTimeCard: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  focusTimeCardSelected: {
    borderColor: "#6366F1",
    backgroundColor: "#EEF2FF",
  },
  focusTimeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  focusTimeTime: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  focusTimeCheck: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dayButton: {
    width: "13%",
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dayButtonSelected: {
    backgroundColor: "#EEF2FF",
    borderColor: "#6366F1",
  },
  dayButtonText: {
    fontSize: 14,
    color: "#6B7280",
  },
  dayButtonTextSelected: {
    color: "#6366F1",
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addGoalButton: {
    padding: 4,
  },
  addGoalForm: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  goalTitleInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
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
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 12,
  },
  priorityButtons: {
    flexDirection: "row",
  },
  priorityButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginLeft: 8,
  },
  priorityButtonText: {
    fontSize: 12,
    color: "#6B7280",
  },
  priorityButtonTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  goalFormActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: "#6B7280",
  },
  addButton: {
    backgroundColor: "#6366F1",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  goalCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  goalCheckboxCompleted: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  goalInfo: {
    flex: 1,
    marginRight: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  goalTitleCompleted: {
    textDecorationLine: "line-through",
    color: "#6B7280",
  },
  goalDeadline: {
    fontSize: 12,
    color: "#6B7280",
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
    color: "#fff",
  },
  deleteButton: {
    padding: 8,
  },
  saveButton: {
    backgroundColor: "#6366F1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default StudySettings;
