// ReadSpaceScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Dimensions,
  Animated,
  Modal,
  TouchableOpacity,
  Text,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import ContinueReading from "./ContinueReading";
import TimetableManagement from "./TimetableManagement";
import ReadingRoom from "./ReadingRoom";
import CompletedReadings from "./CompletedReadings";
import Notes from "./Notes";
import Badges from "./Badges";
import { useContext } from "react";
import { StudyContext } from "../context/StudyContext";

const READING_ROOM_USERS = [
  { id: 1, name: "Alex Johnson", hours: 24.5, rank: 1, status: "online" },
  { id: 2, name: "Sarah Kim", hours: 18.2, rank: 2, status: "studying" },
  { id: 3, name: "Mike Chen", hours: 15.8, rank: 3, status: "break" },
  { id: 4, name: "Emma Davis", hours: 12.3, rank: 4, status: "offline" },
];

const MOCK_NOTES = [
  {
    id: 1,
    title: "Biology Chapter 5",
    date: "2024-01-20",
    time: "14:30",
    description: "Key points about cellular respiration...",
  },
  {
    id: 2,
    title: "Physics Formulas",
    date: "2024-01-19",
    time: "16:45",
    description: "Important formulas for mechanics...",
  },
];

export default function ReadSpaceScreen({ navigation }) {
  const { activeSchedules, completedReadings, presets } =
    useContext(StudyContext);

  const [animatedValue] = useState(new Animated.Value(0));
  const [currentTab, setCurrentTab] = useState("reading");
  const [readingSpaceTab, setReadingSpaceTab] = useState("continue");
  const [notes, setNotes] = useState(MOCK_NOTES);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", description: "" });
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      user: "Alex",
      message: "Starting my study session now!",
      time: "10:30",
    },
    { id: 2, user: "Sarah", message: "Good luck everyone! 📚", time: "10:32" },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [scheduleTitle] = useState("Weekly Schedule");
  const daySelectorRef = useRef(null);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: currentTab === "reading" ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentTab]);

  const toggleTab = (tab) => {
    if (tab !== currentTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentTab(tab);
    }
  };

  const toggleReadingSpaceTab = (tab) => {
    if (tab !== readingSpaceTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setReadingSpaceTab(tab);
    }
  };

  const getCurrentDaySchedule = () =>
    activeSchedules[new Date().toISOString().split("T")[0]] || [];

  const renderNoteModal = () => (
    <Modal visible={showNoteModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Note</Text>
          <TextInput
            style={styles.noteInput}
            value={newNote.title}
            onChangeText={(text) => setNewNote({ ...newNote, title: text })}
            placeholder="Note title"
            placeholderTextColor="#A0AEC0"
          />
          <TextInput
            style={[styles.noteInput, styles.noteDescriptionInput]}
            value={newNote.description}
            onChangeText={(text) =>
              setNewNote({ ...newNote, description: text })
            }
            placeholder="Note description"
            placeholderTextColor="#A0AEC0"
            multiline
            numberOfLines={4}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowNoteModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={() => {
                if (newNote.title.trim() && newNote.description.trim()) {
                  const now = new Date();
                  setNotes([
                    {
                      id: Date.now(),
                      title: newNote.title,
                      date: now.toISOString().split("T")[0],
                      time: now.toTimeString().slice(0, 5),
                      description: newNote.description,
                    },
                    ...notes,
                  ]);
                  setNewNote({ title: "", description: "" });
                  setShowNoteModal(false);
                }
              }}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderReadingSpaceNav = () => {
    const tabs = [
      { id: "continue", label: "Continue Reading" },
      { id: "timetable", label: "Time Table" },
      { id: "room", label: "Reading Room" },
      { id: "completed", label: "Completed" },
      { id: "notes", label: "Notes" },
      { id: "badges", label: "Streaks" },
    ];
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.readingSpaceNav}
        contentContainerStyle={styles.readingSpaceNavContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.readingSpaceTab,
              readingSpaceTab === tab.id && styles.activeReadingSpaceTab,
            ]}
            onPress={() => toggleReadingSpaceTab(tab.id)}
          >
            <Text
              style={[
                styles.readingSpaceTabText,
                readingSpaceTab === tab.id && styles.activeReadingSpaceTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderReadingSpaceContent = () => {
    switch (readingSpaceTab) {
      case "continue":
        return (
          <ContinueReading
            schedule={getCurrentDaySchedule()}
            navigation={navigation}
          />
        );
      case "timetable":
        return <TimetableManagement scheduleTitle={scheduleTitle} />;
      case "room":
        return (
          <ReadingRoom
            readingRoomUsers={READING_ROOM_USERS}
            chatMessages={chatMessages}
            setChatMessages={setChatMessages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
          />
        );
      case "completed":
        return <CompletedReadings completedReadings={completedReadings} />;
      case "notes":
        return (
          <Notes
            notes={notes}
            setNotes={setNotes}
            newNote={newNote}
            setNewNote={setNewNote}
            showNoteModal={showNoteModal}
            setShowNoteModal={setShowNoteModal}
          />
        );
      case "badges":
        return <Badges />;
      default:
        return (
          <ContinueReading
            schedule={getCurrentDaySchedule()}
            navigation={navigation}
          />
        );
    }
  };

  const renderTabContent = () =>
    currentTab === "reading" && (
      <>
        {renderReadingSpaceNav()}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderReadingSpaceContent()}
        </ScrollView>
        {renderNoteModal()}
      </>
    );

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {renderTabContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { paddingHorizontal: 16, paddingVertical: 10 },
  tabContainer: { flexDirection: "row", justifyContent: "center" },
  tab: { justifyContent: "center", alignItems: "center", paddingVertical: 10 },
  tabText: { fontSize: 20, fontWeight: "600", color: "#A0AEC0" },
  activeTabText: { color: "#2D3748" },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    width: Dimensions.get("window").width / 4,
    height: 3,
    backgroundColor: "#6366F1",
    borderRadius: 3,
  },
  readingSpaceNav: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    maxHeight: 60,
    minHeight: 60,
    borderBottomColor: "#F0F0F0",
  },
  readingSpaceNavContent: { paddingHorizontal: 15, paddingVertical: 10 },
  readingSpaceTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#F7F8FA",
  },
  activeReadingSpaceTab: {
    backgroundColor: "#6366F1",
    borderWidth: 1,
    borderColor: "#4F46E5",
  },
  readingSpaceTabText: { fontSize: 14, fontWeight: "500", color: "#2D3748" },
  activeReadingSpaceTabText: { color: "#FFFFFF" },
  content: { flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: "95%",
    maxWidth: 450,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 20,
    textAlign: "center",
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#2D3748",
    marginBottom: 15,
  },
  noteDescriptionInput: { height: 100, textAlignVertical: "top" },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: { backgroundColor: "#F3F4F6", marginRight: 10 },
  saveButton: { backgroundColor: "#6366F1", marginLeft: 10 },
  cancelButtonText: { color: "#6B7280", fontSize: 16, fontWeight: "600" },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
