import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform, // Import Platform for OS specific logic
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Plus,
  CheckCircle,
  Circle,
  Calendar, // Already imported, now used for picker icon
  Clock,
  Target,
  Trash2,
  Edit3,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker"; // Import DateTimePicker

const CATEGORIES = ["Study", "Assignment", "Exam", "Project", "Personal"];
const PRIORITIES = [
  { value: "low", label: "Low", color: "#10B981" },
  { value: "medium", label: "Medium", color: "#F59E0B" },
  { value: "high", label: "High", color: "#EF4444" },
];

export default function ToDoScreen() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "Study",
    dueDate: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date()); // State for the actual Date object

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem("tasks");
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      console.log("Failed to load tasks:", error);
    }
  };

  const saveTasks = async (updatedTasks) => {
    try {
      await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
    } catch (error) {
      console.log("Failed to save tasks:", error);
    }
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;

    const task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      completed: false,
      priority: newTask.priority,
      category: newTask.category,
      dueDate: newTask.dueDate, // Already formatted string
      createdAt: new Date().toISOString(),
    };

    const updatedTasks = [task, ...tasks];
    saveTasks(updatedTasks);
    resetForm();
  };

  const updateTask = () => {
    if (!editingTask || !newTask.title.trim()) return;

    const updatedTasks = tasks.map((task) =>
      task.id === editingTask.id
        ? {
            ...task,
            title: newTask.title,
            description: newTask.description,
            priority: newTask.priority,
            category: newTask.category,
            dueDate: newTask.dueDate, // Already formatted string
          }
        : task
    );

    saveTasks(updatedTasks);
    resetForm();
  };

  const toggleTask = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks(updatedTasks);
  };

  const deleteTask = (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    saveTasks(updatedTasks);
  };

  const editTask = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      priority: task.priority || "medium",
      category: task.category,
      dueDate: task.dueDate || "",
    });
    // Set selectedDate for picker if dueDate exists
    if (task.dueDate) {
      setSelectedDate(new Date(task.dueDate));
    } else {
      setSelectedDate(new Date()); // Default to current date
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      category: "Study",
      dueDate: "",
    });
    setSelectedDate(new Date()); // Reset selected date in picker state
    setEditingTask(null);
    setShowModal(false);
  };

  const getPriorityColor = (priority) => {
    const p = PRIORITIES.find((p) => p.value === priority);
    return p?.color || "#6B7280";
  };

  const completedTasks = tasks.filter((task) => task.completed);
  const pendingTasks = tasks.filter((task) => !task.completed);

  // --- Date Picker Handlers ---
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === "ios"); // Keep picker open on iOS, close on Android
    setSelectedDate(currentDate);

    // Format the date for storage (e.g., YYYY-MM-DD or a more readable format)
    const formattedDate = currentDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    setNewTask({ ...newTask, dueDate: formattedDate });
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowModal(true)}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Target size={24} color="#6366F1" />
          <Text style={styles.statValue}>{pendingTasks.length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <CheckCircle size={24} color="#10B981" />
          <Text style={styles.statValue}>{completedTasks.length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Calendar size={24} color="#F59E0B" />
          <Text style={styles.statValue}>{tasks.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Tasks List */}
      <ScrollView style={styles.content}>
        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Tasks</Text>
            {pendingTasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <TouchableOpacity
                  style={styles.taskCheckbox}
                  onPress={() => toggleTask(task.id)}
                >
                  <Circle size={20} color="#6B7280" />
                </TouchableOpacity>

                <View style={styles.taskContent}>
                  <View style={styles.taskHeader}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <View style={styles.taskActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => editTask(task)}
                      >
                        <Edit3 size={16} color="#6B7280" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => deleteTask(task.id)}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {task.description && (
                    <Text style={styles.taskDescription}>
                      {task.description}
                    </Text>
                  )}

                  <View style={styles.taskMeta}>
                    <View
                      style={[
                        styles.priorityBadge,
                        {
                          backgroundColor:
                            getPriorityColor(task.priority) + "20",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          { color: getPriorityColor(task.priority) },
                        ]}
                      >
                        {task.priority.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.categoryText}>{task.category}</Text>
                    {task.dueDate && (
                      <View style={styles.dueDateContainer}>
                        <Clock size={12} color="#6B7280" />
                        <Text style={styles.dueDateText}>{task.dueDate}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed Tasks</Text>
            {completedTasks.map((task) => (
              <View
                key={task.id}
                style={[styles.taskCard, styles.completedTask]}
              >
                <TouchableOpacity
                  style={styles.taskCheckbox}
                  onPress={() => toggleTask(task.id)}
                >
                  <CheckCircle size={20} color="#10B981" />
                </TouchableOpacity>

                <View style={styles.taskContent}>
                  <Text style={[styles.taskTitle, styles.completedTaskTitle]}>
                    {task.title}
                  </Text>
                  {task.description && (
                    <Text
                      style={[
                        styles.taskDescription,
                        styles.completedTaskDescription,
                      ]}
                    >
                      {task.description}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => deleteTask(task.id)}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {tasks.length === 0 && (
          <View style={styles.emptyState}>
            <Target size={64} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptyDescription}>
              Create your first task to get started with your productivity
              journey
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Task Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingTask ? "Edit Task" : "Add New Task"}
            </Text>

            <TextInput
              style={styles.input}
              value={newTask.title}
              onChangeText={(text) => setNewTask({ ...newTask, title: text })}
              placeholder="Task title"
              placeholderTextColor="#9CA3AF"
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              value={newTask.description}
              onChangeText={(text) =>
                setNewTask({ ...newTask, description: text })
              }
              placeholder="Description (optional)"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />

            {/* Replaced TextInput with TouchableOpacity to open date picker */}
            <TouchableOpacity
              onPress={showDatepicker}
              style={styles.datePickerInput}
            >
              <Text
                style={
                  newTask.dueDate
                    ? styles.datePickerText
                    : styles.datePickerPlaceholder
                }
              >
                {newTask.dueDate || "Due date (optional)"}
              </Text>
              <Calendar size={20} color="#6B7280" />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={selectedDate} // Use the actual Date object
                mode="date"
                display="default" // or 'spinner' or 'calendar' based on preference
                onChange={onDateChange}
              />
            )}

            {/* Priority Selection */}
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              {PRIORITIES.map((priority) => (
                <TouchableOpacity
                  key={priority.value}
                  style={[
                    styles.priorityOption,
                    newTask.priority === priority.value &&
                      styles.selectedPriority,
                    { borderColor: priority.color },
                  ]}
                  onPress={() =>
                    setNewTask({ ...newTask, priority: priority.value })
                  }
                >
                  <Text
                    style={[
                      styles.priorityOptionText,
                      newTask.priority === priority.value && {
                        color: priority.color,
                      },
                    ]}
                  >
                    {priority.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category Selection */}
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryContainer}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      newTask.category === category && styles.selectedCategory,
                    ]}
                    onPress={() => setNewTask({ ...newTask, category })}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        newTask.category === category &&
                          styles.selectedCategoryText,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={resetForm}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={editingTask ? updateTask : addTask}
              >
                <Text style={styles.saveButtonText}>
                  {editingTask ? "Update" : "Add Task"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 24,
    // fontFamily: "Inter-Bold", // Ensure this font is loaded or remove if not used
    color: "#1F2937",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    // fontFamily: "Inter-Bold", // Ensure this font is loaded or remove if not used
    color: "#1F2937",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    // fontFamily: "Inter-Medium", // Ensure this font is loaded or remove if not used
    color: "#6B7280",
    textTransform: "uppercase",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    // fontFamily: "Inter-SemiBold", // Ensure this font is loaded or remove if not used
    color: "#1F2937",
    marginBottom: 12,
  },
  taskCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  completedTask: {
    opacity: 0.7,
  },
  taskCheckbox: {
    marginRight: 12,
    marginTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 16,
    // fontFamily: "Inter-SemiBold", // Ensure this font is loaded or remove if not used
    color: "#1F2937",
    flex: 1,
    marginRight: 8,
  },
  completedTaskTitle: {
    textDecorationLine: "line-through",
    color: "#6B7280",
  },
  taskDescription: {
    fontSize: 14,
    // fontFamily: "Inter-Regular", // Ensure this font is loaded or remove if not used
    color: "#6B7280",
    marginBottom: 8,
    lineHeight: 20,
  },
  completedTaskDescription: {
    textDecorationLine: "line-through",
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    // fontFamily: "Inter-Bold", // Ensure this font is loaded or remove if not used
    letterSpacing: 0.5,
  },
  categoryText: {
    fontSize: 12,
    // fontFamily: "Inter-Medium", // Ensure this font is loaded or remove if not used
    color: "#6B7280",
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dueDateText: {
    fontSize: 12,
    // fontFamily: "Inter-Regular", // Ensure this font is loaded or remove if not used
    color: "#6B7280",
  },
  taskActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    // fontFamily: "Inter-SemiBold", // Ensure this font is loaded or remove if not used
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    // fontFamily: "Inter-Regular", // Ensure this font is loaded or remove if not used
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    // fontFamily: "Inter-SemiBold", // Ensure this font is loaded or remove if not used
    color: "#1F2937",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    // fontFamily: "Inter-Regular", // Ensure this font is loaded or remove if not used
    color: "#374151",
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  label: {
    fontSize: 14,
    // fontFamily: "Inter-SemiBold", // Ensure this font is loaded or remove if not used
    color: "#374151",
    marginBottom: 8,
  },
  priorityContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  selectedPriority: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
  },
  priorityOptionText: {
    fontSize: 12,
    // fontFamily: "Inter-SemiBold", // Ensure this font is loaded or remove if not used
    color: "#6B7280",
  },
  categoryContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  categoryOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  selectedCategory: {
    backgroundColor: "#6366F1",
  },
  categoryOptionText: {
    fontSize: 14,
    // fontFamily: "Inter-Medium", // Ensure this font is loaded or remove if not used
    color: "#6B7280",
  },
  selectedCategoryText: {
    color: "#fff",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  saveButton: {
    backgroundColor: "#6366F1",
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 16,
    // fontFamily: "Inter-SemiBold", // Ensure this font is loaded or remove if not used
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    // fontFamily: "Inter-SemiBold", // Ensure this font is loaded or remove if not used
  },
  // New style for the date picker input replacement
  datePickerInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  datePickerText: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
  },
  datePickerPlaceholder: {
    fontSize: 16,
    color: "#9CA3AF",
    flex: 1,
  },
});
