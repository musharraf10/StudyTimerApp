import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Notes = ({
  notes,
  setNotes,
  newNote,
  setNewNote,
  showNoteModal,
  setShowNoteModal,
}) => {
  const addNote = () => {
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
  };

  return (
    <View style={styles.notesSection}>
      <View style={styles.notesHeader}>
        <Text style={styles.sectionTitle}>My Notes</Text>
        <TouchableOpacity
          style={styles.addNoteButton}
          onPress={() => setShowNoteModal(true)}
        >
          <Ionicons name="add" size={24} color="#6366F1" />
        </TouchableOpacity>
      </View>
      {notes.map((note) => (
        <View key={note.id} style={styles.noteItem}>
          <View style={styles.noteHeader}>
            <Text style={styles.noteTitle}>{note.title}</Text>
            <Text style={styles.noteDateTime}>
              {note.date} • {note.time}
            </Text>
          </View>
          <Text style={styles.noteDescription}>{note.description}</Text>
        </View>
      ))}
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
                onPress={addNote}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  notesSection: { padding: 15 },
  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#2D3748" },
  addNoteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  noteItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    minHeight: 100,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    flex: 1,
    marginRight: 10,
  },
  noteDateTime: { fontSize: 12, color: "#9CA3AF" },
  noteDescription: { fontSize: 14, color: "#6B7280", lineHeight: 20 },
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

export default Notes;
