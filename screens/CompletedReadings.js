import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const CompletedReadings = ({ completedReadings }) => {
  return (
    <View style={styles.completedReadings}>
      <Text style={styles.sectionTitle}>Today's Completed Readings</Text>
      {completedReadings.length > 0 ? (
        completedReadings.map((reading) => (
          <View key={reading.id} style={styles.completedItem}>
            <View style={styles.completedIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </View>
            <View style={styles.completedDetails}>
              <Text style={styles.completedSubject}>{reading.subject}</Text>
              <Text style={styles.completedTime}>
                Duration: {reading.duration}min • Completed:{" "}
                {reading.completedAt}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyCompleted}>
          <MaterialCommunityIcons
            name="clipboard-check-outline"
            size={40}
            color="#ccc"
          />
          <Text style={styles.emptyCompletedText}>
            No completed readings today
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  completedReadings: { padding: 15 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 15,
  },
  completedItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    minHeight: 80,
    alignItems: "center",
  },
  completedIcon: { marginRight: 12, justifyContent: "center" },
  completedDetails: { flex: 1 },
  completedSubject: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 4,
  },
  completedTime: { fontSize: 14, color: "#6B7280", marginBottom: 2 },
  emptyCompleted: { alignItems: "center", paddingVertical: 60 },
  emptyCompletedText: { fontSize: 16, color: "#6B7280", marginTop: 15 },
});

export default CompletedReadings;
