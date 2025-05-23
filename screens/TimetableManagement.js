import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  FlatList,
  Alert,
  Modal,
  Platform,
  StatusBar,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useContext } from "react";
import { StudyContext } from "../context/StudyContext";

const TimetableManagement = ({ scheduleTitle }) => {
  const {
    activeSchedules,
    setActiveSchedules,
    presets,
    setPresets,
    completedReadings,
  } = useContext(StudyContext);

  const [subTab, setSubTab] = useState("active");
  const [selectedPresetId, setSelectedPresetId] = useState(
    presets.find((p) => p.active)?.id || null
  );
  const [editingPreset, setEditingPreset] = useState(
    presets.find((p) => p.active) || null
  );
  const [newPresetName, setNewPresetName] = useState("");
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [addingSubject, setAddingSubject] = useState({
    day: null,
    presetId: null,
  });
  const [newSubject, setNewSubject] = useState({ subject: "", duration: "" });
  const [editingSubject, setEditingSubject] = useState(null);
  const [editSubjectData, setEditSubjectData] = useState({
    subject: "",
    duration: "",
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCreatePresetModal, setShowCreatePresetModal] = useState(false);
  const [createPresetName, setCreatePresetName] = useState("");
  const scrollViewRef = useRef(null);
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  // Sync editingPreset with presets
  useEffect(() => {
    if (!editingPreset && presets.length > 0) {
      const activePreset = presets.find((p) => p.active) || presets[0];
      setEditingPreset(activePreset);
      setSelectedPresetId(activePreset?.id || null);
    }
  }, [presets]);

  const getWeekDays = () => {
    const today = new Date();
    const days = [];
    for (let i = -4; i <= 2; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() + i);
      days.push({
        date: day.toISOString().split("T")[0],
        name: day.toLocaleDateString("en-US", { weekday: "long" }),
      });
    }
    return days;
  };

  const getDayStatus = (date) => {
    const today = new Date().toISOString().split("T")[0];
    const dayDate = new Date(date);
    const todayDate = new Date(today);
    if (dayDate.toDateString() === todayDate.toDateString()) return "current";
    if (dayDate < todayDate) return "past";
    return "future";
  };

  const getDayStyle = (status) => {
    switch (status) {
      case "current":
        return {
          backgroundColor: "#4F46E5",
          color: "#FFFFFF",
          elevation: 10,
          shadowOpacity: 0.4,
        };
      case "past":
        return {
          backgroundColor: "#14B8A6",
          color: "#FFFFFF",
          elevation: 4,
          shadowOpacity: 0.2,
        };
      case "future":
        return {
          backgroundColor: "#E5E7EB",
          color: "#1F2937",
          elevation: 4,
          shadowOpacity: 0.2,
        };
      default:
        return { backgroundColor: "#E5E7EB", color: "#1F2937" };
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const days = getWeekDays();
    const todayIndex = days.findIndex((day) => day.date === today);
    setCurrentDayIndex(todayIndex);
    if (scrollViewRef.current && todayIndex >= 0) {
      scrollViewRef.current.scrollTo({ x: todayIndex * 360, animated: false });
    }
  }, []);

  const navigateDay = (direction) => {
    const days = getWeekDays();
    const newIndex = Math.max(
      0,
      Math.min(currentDayIndex + direction, days.length - 1)
    );
    setCurrentDayIndex(newIndex);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: newIndex * 360, animated: true });
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleDropdown = () => {
    const toValue = isDropdownOpen ? 0 : 1;
    setIsDropdownOpen(!isDropdownOpen);
    Animated.spring(dropdownAnim, {
      toValue,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  const renderActiveTable = () => {
    const days = getWeekDays();
    const activePreset = presets.find((p) => p.active) || { days: {} };

    return (
      <View style={styles.activeTableContainer}>
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentDayIndex === 0 && styles.disabledNavButton,
            ]}
            onPress={() => navigateDay(-1)}
            disabled={currentDayIndex === 0}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={currentDayIndex === 0 ? "#9CA3AF" : "#1F2937"}
            />
          </TouchableOpacity>
          <Text style={styles.navDayText}>
            {days[currentDayIndex]?.name} (
            {new Date(days[currentDayIndex]?.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
            )
          </Text>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentDayIndex === days.length - 1 && styles.disabledNavButton,
            ]}
            onPress={() => navigateDay(1)}
            disabled={currentDayIndex === days.length - 1}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={
                currentDayIndex === days.length - 1 ? "#9CA3AF" : "#1F2937"
              }
            />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          ref={scrollViewRef}
          showsHorizontalScrollIndicator={false}
          snapToInterval={360}
          decelerationRate="fast"
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / 360);
            setCurrentDayIndex(newIndex);
          }}
        >
          {days.map((day, index) => {
            const status = getDayStatus(day.date);
            const dayStyle = getDayStyle(status);
            const subjects = (
              activeSchedules[day.date] ||
              activePreset.days[day.name] ||
              []
            ).map((sub, idx) => ({
              ...sub,
              id: sub.id || `${day.date}-${sub.subject}-${idx}`,
              completed: completedReadings.some(
                (cr) => cr.subject === sub.subject && cr.date === day.date
              ),
              duration:
                completedReadings.find(
                  (cr) => cr.subject === sub.subject && cr.date === day.date
                )?.duration || sub.duration,
            }));
            const sortedSubjects = subjects.sort((a, b) =>
              a.completed === b.completed ? 0 : a.completed ? 1 : -1
            );

            return (
              <View key={day.date} style={[styles.dayColumn, { width: 360 }]}>
                <View style={[styles.dayHeader, dayStyle]}>
                  <Text
                    style={[styles.dayHeaderText, { color: dayStyle.color }]}
                  >
                    {day.name}
                  </Text>
                  <Text style={[styles.dayDate, { color: dayStyle.color }]}>
                    {new Date(day.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </View>
                <FlatList
                  data={sortedSubjects}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.subjectItem,
                        {
                          backgroundColor: item.completed
                            ? "#10B981"
                            : "#EDE9FE",
                        },
                      ]}
                      onPress={() => {
                        const reading = completedReadings.find(
                          (cr) =>
                            cr.subject === item.subject && cr.date === day.date
                        );
                        Alert.alert(
                          "Subject Details",
                          `Subject: ${item.subject}\nDuration: ${
                            item.duration
                          }min\nStatus: ${
                            item.completed
                              ? `Completed at ${
                                  reading?.completedAt || "Unknown"
                                }`
                              : "Pending"
                          }`
                        );
                      }}
                    >
                      <View style={styles.subjectContent}>
                        {item.completed && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#D1FAE5"
                            style={styles.completionIcon}
                          />
                        )}
                        <Text
                          style={[
                            styles.subjectName,
                            { color: item.completed ? "#FFFFFF" : "#1F2937" },
                          ]}
                        >
                          {item.subject}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.subjectDuration,
                          { color: item.completed ? "#D1FAE5" : "#6B7280" },
                        ]}
                      >
                        {item.duration}min
                      </Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={styles.emptySubjects}>
                      <Text style={styles.emptySubjectsText}>No subjects</Text>
                    </View>
                  }
                />
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const applyPresetToSchedules = (presetId) => {
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return;
    const days = getWeekDays();
    const newSchedules = { ...activeSchedules };
    days.forEach((day) => {
      const daySubjects = (preset.days[day.name] || []).map((sub, index) => ({
        id: `${presetId}-${day.date}-${sub.subject}-${index}`,
        subject: sub.subject,
        duration: sub.duration,
        color: sub.color || "#EDE9FE",
        completed: completedReadings.some(
          (cr) => cr.subject === sub.subject && cr.date === day.date
        ),
        presetId,
      }));
      newSchedules[day.date] = daySubjects;
    });
    console.log("Applying preset to schedules:", { presetId, newSchedules });
    setActiveSchedules(newSchedules);
  };

  const notifyUnsavedChanges = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        "Unsaved Changes",
        "Please reselect the preset to apply changes.",
        [{ text: "OK", style: "cancel" }]
      );
    }
  };

  const addSubjectToPreset = (day, presetId) => {
    if (
      !newSubject.subject.trim() ||
      !newSubject.duration ||
      isNaN(newSubject.duration) ||
      parseInt(newSubject.duration) <= 0
    ) {
      Alert.alert("Error", "Please enter a valid subject name and duration.");
      return;
    }
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return;
    const updatedDays = {
      ...preset.days,
      [day]: [
        ...(preset.days[day] || []),
        {
          id: `${presetId}-${day}-${newSubject.subject}-${Date.now()}`,
          subject: newSubject.subject,
          duration: parseInt(newSubject.duration),
          color: "#EDE9FE",
        },
      ],
    };
    const updatedPreset = { ...preset, days: updatedDays };
    console.log("Adding subject:", { presetId, day, updatedDays });
    setPresets((prev) =>
      prev.map((p) => (p.id === presetId ? updatedPreset : p))
    );
    setEditingPreset(updatedPreset);
    setNewSubject({ subject: "", duration: "" });
    setAddingSubject({ day: null, presetId: null });
    setHasUnsavedChanges(true);
  };

  const deleteSubjectFromPreset = (day, presetId, subjectId) => {
    Alert.alert(
      "Delete Subject",
      "Are you sure you want to delete this subject?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const preset = presets.find((p) => p.id === presetId);
            if (!preset) return;
            const updatedDays = {
              ...preset.days,
              [day]: preset.days[day].filter((sub) => sub.id !== subjectId),
            };
            const updatedPreset = { ...preset, days: updatedDays };
            console.log("Deleting subject:", {
              presetId,
              subjectId,
              updatedDays,
            });
            setPresets((prev) =>
              prev.map((p) => (p.id === presetId ? updatedPreset : p))
            );
            setEditingPreset(updatedPreset);
            setHasUnsavedChanges(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const startEditingSubject = (day, presetId, subject) => {
    setEditingSubject({ day, presetId, subjectId: subject.id });
    setEditSubjectData({
      subject: subject.subject,
      duration: subject.duration.toString(),
    });
    setShowEditModal(true);
  };

  const saveEditedSubject = () => {
    if (
      !editSubjectData.subject.trim() ||
      !editSubjectData.duration ||
      isNaN(editSubjectData.duration) ||
      parseInt(editSubjectData.duration) <= 0
    ) {
      Alert.alert("Error", "Please enter a valid subject name and duration.");
      return;
    }
    const preset = presets.find((p) => p.id === editingSubject.presetId);
    if (!preset) return;
    const updatedDays = {
      ...preset.days,
      [editingSubject.day]: preset.days[editingSubject.day].map((sub) =>
        sub.id === editingSubject.subjectId
          ? {
              ...sub,
              subject: editSubjectData.subject,
              duration: parseInt(editSubjectData.duration),
            }
          : sub
      ),
    };
    const updatedPreset = { ...preset, days: updatedDays };
    console.log("Editing subject:", {
      presetId: editingSubject.presetId,
      updatedDays,
    });
    setPresets((prev) =>
      prev.map((p) => (p.id === editingSubject.presetId ? updatedPreset : p))
    );
    setEditingPreset(updatedPreset);
    setShowEditModal(false);
    setEditingSubject(null);
    setEditSubjectData({ subject: "", duration: "" });
    setHasUnsavedChanges(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const renderEditSubjectModal = () => (
    <Modal visible={showEditModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Subject</Text>
          <TextInput
            style={styles.noteInput}
            value={editSubjectData.subject}
            onChangeText={(text) =>
              setEditSubjectData({ ...editSubjectData, subject: text })
            }
            placeholder="Subject Name"
            placeholderTextColor="#A0AEC0"
          />
          <TextInput
            style={styles.noteInput}
            value={editSubjectData.duration}
            onChangeText={(text) =>
              setEditSubjectData({ ...editSubjectData, duration: text })
            }
            placeholder="Duration (min)"
            placeholderTextColor="#A0AEC0"
            keyboardType="numeric"
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={saveEditedSubject}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderCreatePresetModal = () => (
    <Modal visible={showCreatePresetModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Preset</Text>
            <TouchableOpacity
              onPress={() => {
                setShowCreatePresetModal(false);
                setCreatePresetName("");
              }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.presetNameInput}
            value={createPresetName}
            onChangeText={setCreatePresetName}
            placeholder="Enter preset name"
            placeholderTextColor="#9CA3AF"
            autoFocus
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setShowCreatePresetModal(false);
                setCreatePresetName("");
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.saveButton,
                !createPresetName.trim() && styles.disabledButton,
              ]}
              onPress={() => {
                if (!createPresetName.trim()) {
                  Alert.alert("Error", "Please enter a preset name.");
                  return;
                }
                const presetId = Date.now();
                const newPreset = {
                  id: presetId,
                  name: createPresetName,
                  days: {
                    Monday: [],
                    Tuesday: [],
                    Wednesday: [],
                    Thursday: [],
                    Friday: [],
                    Saturday: [],
                    Sunday: [],
                  },
                  active: true,
                  createdAt: new Date().toISOString(),
                };
                setPresets([
                  ...presets.map((p) => ({ ...p, active: false })),
                  newPreset,
                ]);
                setSelectedPresetId(presetId);
                setEditingPreset(newPreset);
                setHasUnsavedChanges(false);
                applyPresetToSchedules(presetId);
                setShowCreatePresetModal(false);
                setCreatePresetName("");
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success
                );
              }}
              disabled={!createPresetName.trim()}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  !createPresetName.trim() && styles.disabledButtonText,
                ]}
              >
                Create
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const switchPreset = (preset) => {
    console.log("Switching preset:", { preset });
    setSelectedPresetId(preset.id);
    setEditingPreset(preset);
    setNewPresetName(preset.name);
    setPresets(presets.map((p) => ({ ...p, active: p.id === preset.id })));
    applyPresetToSchedules(preset.id);
    setHasUnsavedChanges(false);
    setIsDropdownOpen(false);
  };

  const handlePresetChange = (preset) => {
    if (hasUnsavedChanges && preset.id !== selectedPresetId) {
      notifyUnsavedChanges();
    } else {
      switchPreset(preset);
    }
  };

  const renderModernPresetDropdown = () => {
    const selectedPreset = presets.find((p) => p.id === selectedPresetId);
    const canAddMore = presets.length < 3;

    return (
      <View style={styles.modernPresetContainer}>
        <View style={styles.presetHeader}>
          <Text style={styles.presetHeaderTitle}>Presets</Text>
          {canAddMore && (
            <TouchableOpacity
              style={styles.addPresetButton}
              onPress={() => setShowCreatePresetModal(true)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.dropdownTrigger}
          onPress={toggleDropdown}
          activeOpacity={0.8}
        >
          <View style={styles.dropdownTriggerContent}>
            <View style={styles.presetInfo}>
              <Text style={styles.selectedPresetName}>
                {selectedPreset?.name || "No preset selected"}
              </Text>
              <Text style={styles.selectedPresetSubtitle}>
                {presets.length} of 3 presets
              </Text>
            </View>
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: dropdownAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "180deg"],
                    }),
                  },
                ],
              }}
            >
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </Animated.View>
          </View>
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.dropdownContent,
            {
              maxHeight: dropdownAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 200],
              }),
              opacity: dropdownAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
          ]}
        >
          <ScrollView
            style={styles.dropdownScrollView}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            {presets.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.dropdownOption,
                  selectedPresetId === preset.id &&
                    styles.selectedDropdownOption,
                ]}
                onPress={() => handlePresetChange(preset)}
                activeOpacity={0.7}
              >
                <View style={styles.dropdownOptionContent}>
                  <View style={styles.optionInfo}>
                    <Text
                      style={[
                        styles.optionName,
                        selectedPresetId === preset.id &&
                          styles.selectedOptionName,
                      ]}
                    >
                      {preset.name}
                    </Text>
                    <Text
                      style={[
                        styles.optionSubtitle,
                        selectedPresetId === preset.id &&
                          styles.selectedOptionSubtitle,
                      ]}
                    >
                      {Object.values(preset.days).reduce(
                        (total, daySubjects) => total + daySubjects.length,
                        0
                      )}{" "}
                      subjects
                    </Text>
                  </View>
                  {selectedPresetId === preset.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#10B981"
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
            {presets.length === 0 && (
              <View style={styles.emptyDropdown}>
                <Text style={styles.emptyDropdownText}>
                  No presets available
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>

        {hasUnsavedChanges && (
          <View style={styles.unsavedChangesContainer}>
            <Ionicons name="warning" size={16} color="#F59E0B" />
            <Text style={styles.unsavedChangesText}>
              Unsaved changes detected. Reselect preset to apply.
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderPresets = () => {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    return (
      <View style={styles.presetsContainer}>
        {renderModernPresetDropdown()}

        {editingPreset && (
          <View style={styles.editPresetContainer}>
            <Text style={styles.editPresetTitle}>
              Edit "{editingPreset.name}"
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={360}
              decelerationRate="fast"
            >
              {days.map((day) => (
                <View key={day} style={[styles.dayColumn, { width: 360 }]}>
                  <View style={[styles.dayHeader, styles.presetDayHeader]}>
                    <Text style={styles.dayHeaderText}>{day}</Text>
                  </View>
                  <FlatList
                    data={editingPreset.days[day] || []}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <View
                        style={[
                          styles.subjectItem,
                          { backgroundColor: "#EDE9FE" },
                        ]}
                      >
                        <View style={styles.subjectContent}>
                          <Text style={styles.subjectName}>{item.subject}</Text>
                          <Text style={styles.subjectDuration}>
                            {item.duration}min
                          </Text>
                        </View>
                        <View style={styles.subjectActions}>
                          <TouchableOpacity
                            onPress={() =>
                              startEditingSubject(day, editingPreset.id, item)
                            }
                          >
                            <Ionicons
                              name="pencil"
                              size={20}
                              color="#4F46E5"
                              style={styles.actionIcon}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() =>
                              deleteSubjectFromPreset(
                                day,
                                editingPreset.id,
                                item.id
                              )
                            }
                          >
                            <Ionicons
                              name="trash"
                              size={20}
                              color="#EF4444"
                              style={styles.actionIcon}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                    ListEmptyComponent={
                      <View style={styles.emptySubjects}>
                        <Text style={styles.emptySubjectsText}>
                          No subjects
                        </Text>
                      </View>
                    }
                  />
                  {addingSubject.day === day &&
                  addingSubject.presetId === editingPreset.id ? (
                    <View style={styles.addSubjectContainer}>
                      <TextInput
                        style={styles.subjectInput}
                        value={newSubject.subject}
                        onChangeText={(text) =>
                          setNewSubject({ ...newSubject, subject: text })
                        }
                        placeholder="Subject Name"
                        placeholderTextColor="#9CA3AF"
                      />
                      <TextInput
                        style={styles.durationInput}
                        value={newSubject.duration}
                        onChangeText={(text) =>
                          setNewSubject({ ...newSubject, duration: text })
                        }
                        placeholder="Duration (min)"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                      />
                      <View style={styles.addSubjectButtons}>
                        <TouchableOpacity
                          style={styles.saveSubjectButton}
                          onPress={() =>
                            addSubjectToPreset(day, editingPreset.id)
                          }
                        >
                          <Text style={styles.saveSubjectButtonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.cancelSubjectButton}
                          onPress={() =>
                            setAddingSubject({ day: null, presetId: null })
                          }
                        >
                          <Text style={styles.cancelSubjectButtonText}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addSubjectButton}
                      onPress={() =>
                        setAddingSubject({ day, presetId: editingPreset.id })
                      }
                    >
                      <Ionicons name="add-circle" size={28} color="#4F46E5" />
                      <Text style={styles.addSubjectText}>Add Subject</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        {renderEditSubjectModal()}
        {renderCreatePresetModal()}
      </View>
    );
  };

  const renderSubTabNav = () => (
    <View style={styles.subTabNav}>
      <TouchableOpacity
        style={[styles.subTab, subTab === "active" && styles.activeSubTab]}
        onPress={() => {
          if (hasUnsavedChanges) {
            notifyUnsavedChanges();
            return;
          }
          setSubTab("active");
        }}
      >
        <Text
          style={[
            styles.subTabText,
            subTab === "active" && styles.activeSubTabText,
          ]}
        >
          Active Table
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.subTab, subTab === "presets" && styles.activeSubTab]}
        onPress={() => {
          if (hasUnsavedChanges) {
            notifyUnsavedChanges();
            return;
          }
          setSubTab("presets");
        }}
      >
        <Text
          style={[
            styles.subTabText,
            subTab === "presets" && styles.activeSubTabText,
          ]}
        >
          Presets
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.timetableManagement}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{scheduleTitle || "Timetable"}</Text>
      </View>
      {renderSubTabNav()}
      <ScrollView style={styles.content}>
        {subTab === "active" ? renderActiveTable() : renderPresets()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  timetableManagement: {
    flex: 1,
    padding: 16,
    backgroundColor: "rgba(245, 247, 255, 0.95)",
  },

  header: {
    marginBottom: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "rgba(15, 23, 42, 0.9)",
    letterSpacing: -0.8,
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
    textShadowColor: "rgba(255, 255, 255, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  headerDivider: {
    height: 3,
    width: 32,
    backgroundColor: "rgba(99, 102, 241, 0.8)",
    borderRadius: 2,
    shadowColor: "rgba(99, 102, 241, 0.4)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },

  subTabNav: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 16,
    padding: 4,
    shadowColor: "rgba(15, 23, 42, 0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  subTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
    marginHorizontal: 2,
    backgroundColor: "transparent",
  },

  activeSubTab: {
    backgroundColor: "rgba(99, 102, 241, 0.9)",
    shadowColor: "rgba(99, 102, 241, 0.4)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  subTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(100, 116, 139, 0.8)",
    letterSpacing: 0.2,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },

  activeSubTabText: {
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "700",
    textShadowColor: "rgba(99, 102, 241, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  content: {
    flex: 1,
  },

  activeTableContainer: {
    paddingVertical: 8,
  },

  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },

  navButton: {
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 14,
    shadowColor: "rgba(15, 23, 42, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    minWidth: 44,
    alignItems: "center",
  },

  disabledNavButton: {
    backgroundColor: "rgba(248, 250, 252, 0.6)",
    borderColor: "rgba(226, 232, 240, 0.5)",
    shadowOpacity: 0,
    elevation: 0,
  },

  navDayText: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(15, 23, 42, 0.9)",
    letterSpacing: -0.2,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },

  dayColumn: {
    paddingHorizontal: 12,
    width: Dimensions.get("window").width * 0.92,
  },

  dayHeader: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    shadowColor: "rgba(15, 23, 42, 0.08)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  presetDayHeader: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderBottomWidth: 2,
    borderBottomColor: "rgba(99, 102, 241, 0.3)",
  },

  dayHeaderText: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(15, 23, 42, 0.9)",
    letterSpacing: -0.3,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
    textShadowColor: "rgba(255, 255, 255, 0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  dayDate: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
    color: "rgba(100, 116, 139, 0.8)",
    letterSpacing: 0.1,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },

  subjectItem: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    shadowColor: "rgba(15, 23, 42, 0.06)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },

  subjectContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  completionIcon: {
    marginRight: 10,
  },

  subjectName: {
    fontSize: 14,
    fontWeight: "600",
    flexShrink: 1,
    color: "rgba(15, 23, 42, 0.9)",
    letterSpacing: -0.1,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },

  subjectDuration: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 8,
    color: "rgba(100, 116, 139, 0.8)",
    letterSpacing: 0.1,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },

  subjectActions: {
    flexDirection: "row",
    marginLeft: 10,
  },

  actionIcon: {
    marginHorizontal: 6,
    padding: 4,
  },

  emptySubjects: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "rgba(248, 250, 252, 0.6)",
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.4)",
    borderStyle: "dashed",
  },

  emptySubjectsText: {
    fontSize: 12,
    color: "rgba(148, 163, 184, 0.8)",
    fontWeight: "500",
    letterSpacing: 0.1,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },

  modernPresetContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  presetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  presetHeaderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },

  addPresetButton: {
    backgroundColor: "#4F46E5",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  dropdownTrigger: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },

  dropdownTriggerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },

  presetInfo: {
    flex: 1,
  },

  selectedPresetName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },

  selectedPresetSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },

  dropdownContent: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    overflow: "hidden",
  },

  dropdownScrollView: {
    maxHeight: 200,
  },

  dropdownOption: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  selectedDropdownOption: {
    backgroundColor: "#EEF2FF",
  },

  dropdownOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },

  dropdownLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    color: "rgba(15, 23, 42, 0.9)",
    letterSpacing: -0.1,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },

  dropdown: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 16,
    padding: 8,
    shadowColor: "rgba(15, 23, 42, 0.08)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  dropdownItem: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },

  activeDropdownItem: {
    backgroundColor: "rgba(99, 102, 241, 0.85)",
    shadowColor: "rgba(99, 102, 241, 0.3)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  dropdownItemText: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    color: "rgba(15, 23, 42, 0.9)",
    letterSpacing: -0.1,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },

  emptyDropdownText: {
    fontSize: 12,
    color: "rgba(148, 163, 184, 0.8)",
    padding: 14,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },

  newPresetContainer: {
    marginTop: 20,
  },

  input: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.5)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 14,
    color: "rgba(15, 23, 42, 0.9)",
    shadowColor: "rgba(15, 23, 42, 0.04)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },

  savePresetButton: {
    backgroundColor: "rgba(99, 102, 241, 0.9)",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "rgba(99, 102, 241, 0.4)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  savePresetButtonText: {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    textShadowColor: "rgba(99, 102, 241, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  editPresetContainer: {
    marginBottom: 20,
  },

  editPresetTitle: {
    borderTopWidth: 2,
    borderTopColor: "rgba(99, 102, 241, 0.3)",
    fontSize: 20,
    fontWeight: "700",
    color: "rgba(0, 0, 0, 0.9)",
    marginBottom: 16,
    paddingTop: 12,
    letterSpacing: -0.3,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
    textShadowColor: "rgba(255, 255, 255, 0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  addSubjectContainer: {
    padding: 14,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: "rgba(15, 23, 42, 0.06)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },

  subjectInput: {
    flex: 2,
    backgroundColor: "rgba(248, 250, 252, 0.8)",
    borderRadius: 10,
    padding: 12,
    marginRight: 8,
    fontSize: 14,
    color: "rgba(15, 23, 42, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.5)",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },

  durationInput: {
    flex: 1,
    backgroundColor: "rgba(248, 250, 252, 0.8)",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "rgba(15, 23, 42, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.5)",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },

  addSubjectButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  saveSubjectButton: {
    flex: 1,
    backgroundColor: "rgba(99, 102, 241, 0.9)",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 6,
    shadowColor: "rgba(99, 102, 241, 0.3)",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  cancelSubjectButton: {
    flex: 1,
    backgroundColor: "rgba(241, 245, 249, 0.8)",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginLeft: 6,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.5)",
  },

  saveSubjectButtonText: {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.1,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    textShadowColor: "rgba(99, 102, 241, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  cancelSubjectButtonText: {
    color: "rgba(100, 116, 139, 0.8)",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.1,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },

  addSubjectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: "rgba(15, 23, 42, 0.06)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)",
    borderStyle: "dashed",
  },

  addSubjectText: {
    fontSize: 13,
    color: "rgba(99, 102, 241, 0.9)",
    marginLeft: 8,
    fontWeight: "600",
    letterSpacing: 0.1,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 20,
    width: "88%",
    maxWidth: 380,
    shadowColor: "rgba(15, 23, 42, 0.15)",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "rgba(15, 23, 42, 0.9)",
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: -0.3,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
    textShadowColor: "rgba(255, 255, 255, 0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  closeButton: {
    padding: 4,
  },

  presetNameInput: {
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.5)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: "rgba(248, 250, 252, 0.8)",
    marginBottom: 20,
    color: "rgba(15, 23, 42, 0.9)",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },

  noteInput: {
    borderWidth: 1,
    borderColor: "rgba(184, 207, 237, 0.5)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "rgba(15, 23, 42, 0.9)",
    marginBottom: 16,
    backgroundColor: "rgba(248, 250, 252, 0.8)",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    minHeight: 80,
    textAlignVertical: "top",
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 12,
  },

  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  cancelButton: {
    backgroundColor: "rgba(241, 245, 249, 0.8)",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.5)",
  },

  saveButton: {
    backgroundColor: "rgba(99, 102, 241, 0.9)",
    marginLeft: 8,
    shadowColor: "rgba(99, 102, 241, 0.4)",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  disabledButton: {
    backgroundColor: "#D1D5DB",
  },

  disabledButtonText: {
    color: "#9CA3AF",
  },

  cancelButtonText: {
    color: "rgba(5, 5, 5, 0.9)",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.1,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },

  saveButtonText: {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.1,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    textShadowColor: "rgba(99, 102, 241, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  unsavedChangesNote: {
    fontSize: 12,
    color: "rgba(239, 68, 68, 0.9)",
    marginTop: 8,
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "500",
    letterSpacing: 0.1,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },

  // Animation states
  fadeIn: {
    opacity: 1,
  },

  fadeOut: {
    opacity: 0.7,
  },

  scaleUp: {
    transform: [{ scale: 1.02 }],
  },

  scaleDown: {
    transform: [{ scale: 0.98 }],
  },

  slideInRight: {
    transform: [{ translateX: 0 }],
  },

  slideOutRight: {
    transform: [{ translateX: 20 }],
  },

  // Interactive states
  pressedButton: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
    backgroundColor: "rgba(99, 102, 241, 0.95)",
  },

  floatingAction: {
    shadowColor: "rgba(99, 102, 241, 0.5)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
    transform: [{ translateY: -2 }],
    backgroundColor: "rgba(99, 102, 241, 0.95)",
  },

  glowEffect: {
    shadowColor: "rgba(99, 102, 241, 0.6)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  // Note: The gradient styles below are for web/CSS-in-JS
  // React Native doesn't support CSS gradients directly
  // Use LinearGradient component from react-native-linear-gradient instead
  gradientOverlay: {
    // This would need to be implemented with LinearGradient component
    // colors: ['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.05)']
    // locations: [0, 1]
    // start: {x: 0, y: 0}
    // end: {x: 1, y: 1}
  },

  iridescent: {
    // This would need to be implemented with LinearGradient component
    // colors: ['rgba(99, 102, 241, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(236, 72, 153, 0.8)']
    // locations: [0, 0.5, 1]
    // start: {x: 0, y: 0}
    // end: {x: 1, y: 1}
  },
});

export const animationConfig = {
  spring: {
    tension: 120,
    friction: 9,
    useNativeDriver: true,
  },

  fade: {
    duration: 300,
    useNativeDriver: true,
  },

  scale: {
    duration: 200,
    useNativeDriver: true,
  },

  slide: {
    duration: 400,
    useNativeDriver: true,
  },

  microInteraction: {
    duration: 150,
    useNativeDriver: true,
  },

  shimmer: {
    duration: 2000,
    useNativeDriver: true,
  },
};

export const colorPalette = {
  // Primary glassy colors
  primary: "rgba(99, 102, 241, 0.9)",
  primaryLight: "rgba(129, 140, 248, 0.8)",
  primaryDark: "rgba(79, 70, 229, 0.95)",
  primaryGlass: "rgba(99, 102, 241, 0.15)",

  // Secondary translucent colors
  secondary: "rgba(100, 116, 139, 0.8)",
  secondaryLight: "rgba(148, 163, 184, 0.7)",
  secondaryDark: "rgba(71, 85, 105, 0.9)",
  secondaryGlass: "rgba(100, 116, 139, 0.1)",

  // Background with transparency
  background: "rgba(245, 247, 255, 0.95)",
  surface: "rgba(255, 255, 255, 0.8)",
  surfaceVariant: "rgba(248, 250, 252, 0.9)",
  surfaceGlass: "rgba(255, 255, 255, 0.7)",

  // Text with appropriate opacity
  text: "rgba(15, 23, 42, 0.9)",
  textSecondary: "rgba(100, 116, 139, 0.8)",
  textTertiary: "rgba(148, 163, 184, 0.7)",
  textGlass: "rgba(255, 255, 255, 0.95)",

  // Glassy borders
  border: "rgba(226, 232, 240, 0.5)",
  borderLight: "rgba(241, 245, 249, 0.6)",
  borderGlass: "rgba(255, 255, 255, 0.3)",

  // Status colors with transparency
  success: "rgba(16, 185, 129, 0.9)",
  successGlass: "rgba(16, 185, 129, 0.15)",
  warning: "rgba(245, 158, 11, 0.9)",
  warningGlass: "rgba(245, 158, 11, 0.15)",
  error: "rgba(239, 68, 68, 0.9)",
  errorGlass: "rgba(239, 68, 68, 0.15)",

  // Enhanced shadows
  shadow: "rgba(15, 23, 42, 0.06)",
  shadowMedium: "rgba(15, 23, 42, 0.1)",
  shadowDark: "rgba(15, 23, 42, 0.15)",
  shadowGlow: "rgba(99, 102, 241, 0.3)",

  gradientStart: "rgba(99, 102, 241, 0.8)",
  gradientMiddle: "rgba(139, 92, 246, 0.7)",
  gradientEnd: "rgba(236, 72, 153, 0.6)",

  backdrop: "rgba(15, 23, 42, 0.4)",
};

export default TimetableManagement;
//1
