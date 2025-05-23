import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ReadingRoom = ({
  readingRoomUsers,
  chatMessages,
  setChatMessages,
  newMessage,
  setNewMessage,
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "#4CAF50";
      case "studying":
        return "#2196F3";
      case "break":
        return "#FF9800";
      default:
        return "#9E9E9E";
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages([
        ...chatMessages,
        {
          id: Date.now(),
          user: "You",
          message: newMessage,
          time: new Date().toTimeString().slice(0, 5),
        },
      ]);
      setNewMessage("");
    }
  };

  return (
    <View style={styles.readingRoom}>
      <View style={styles.rankingSection}>
        <Text style={styles.sectionTitle}>Study Rankings</Text>
        {readingRoomUsers.map((user) => (
          <View key={user.id} style={styles.userRankItem}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankNumber}>{user.rank}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userHours}>{user.hours} hours</Text>
            </View>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(user.status) },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={styles.chatSection}>
        <Text style={styles.sectionTitle}>Study Chat</Text>
        <View style={styles.chatContainer}>
          <ScrollView style={styles.chatMessages}>
            {chatMessages.map((msg) => (
              <View key={msg.id} style={styles.chatMessage}>
                <Text style={styles.chatUser}>{msg.user}</Text>
                <Text style={styles.chatText}>{msg.message}</Text>
                <Text style={styles.chatTime}>{msg.time}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.chatInput}>
            <TextInput
              style={styles.messageInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor="#A0AEC0"
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Ionicons name="send" size={20} color="#6366F1" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  readingRoom: { padding: 30 },
  rankingSection: { marginBottom: 25 },
  userRankItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankNumber: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "600", color: "#2D3748" },
  userHours: { fontSize: 14, color: "#6B7280", marginTop: 2 },
  statusIndicator: { width: 12, height: 12, borderRadius: 6 },
  chatSection: { flex: 1 },
  chatContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    height: 300,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chatMessages: { flex: 1, padding: 15 },
  chatMessage: { marginBottom: 12 },
  chatUser: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366F1",
    marginBottom: 2,
  },
  chatText: { fontSize: 14, color: "#2D3748", marginBottom: 2 },
  chatTime: { fontSize: 12, color: "#9CA3AF" },
  chatInput: {
    flexDirection: "row",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    alignItems: "center",
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 14,
    color: "#2D3748",
    marginRight: 10,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ReadingRoom;
