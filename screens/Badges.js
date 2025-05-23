import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";

const BADGES = [
  {
    id: "streak",
    name: "7 DAY STREAK",
    icon: "fire",
    color: "#FFAC33",
    background: "#FEF5E7",
    progress: 100,
    iconFamily: "FontAwesome5",
  },
  {
    id: "early",
    name: "EARLY BIRD",
    icon: "twitter",
    color: "#74B9FF",
    background: "#E6F3FF",
    progress: 80,
    iconFamily: "FontAwesome5",
  },
  {
    id: "night",
    name: "NIGHT OWL",
    icon: "moon",
    color: "#7F8CF7",
    background: "#ECEEFF",
    progress: 65,
    iconFamily: "FontAwesome5",
  },
  {
    id: "reader",
    name: "CONSISTENT READER",
    icon: "book-open",
    color: "#4ECDC4",
    background: "#E0F7F5",
    progress: 90,
    iconFamily: "FontAwesome5",
  },
];

const Badges = () => {
  return (
    <View style={styles.badgesContainer}>
      <View style={styles.badgeRow}>
        {BADGES.map((badge) => (
          <View key={badge.id} style={styles.badgeItem}>
            <View
              style={[
                styles.badgeIconContainer,
                { backgroundColor: badge.background },
              ]}
            >
              {badge.iconFamily === "FontAwesome5" ? (
                <FontAwesome5 name={badge.icon} size={30} color={badge.color} />
              ) : (
                <Ionicons name={badge.icon} size={30} color={badge.color} />
              )}
            </View>
            <View style={styles.badgeProgressContainer}>
              <View
                style={[
                  styles.badgeProgress,
                  { width: `${badge.progress}%`, backgroundColor: badge.color },
                ]}
              />
            </View>
            <Text style={styles.badgeName}>{badge.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badgesContainer: { padding: 15 },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  badgeItem: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badgeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  badgeProgressContainer: {
    width: "100%",
    height: 6,
    backgroundColor: "#F1F1F1",
    borderRadius: 3,
    marginVertical: 10,
  },
  badgeProgress: { height: "100%", borderRadius: 3 },
  badgeName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2D3748",
    textAlign: "center",
    marginTop: 5,
  },
});

export default Badges;
