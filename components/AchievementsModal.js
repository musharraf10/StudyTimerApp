import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
} from "react-native";
import { X, Check } from "lucide-react-native";

const AchievementsModal = ({ visible, onClose, achievements }) => {
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
            <Text style={styles.modalTitle}>Achievements</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.achievementsContainer}>
              {achievements.map((achievement) => (
                <View
                  key={achievement.id}
                  style={[
                    styles.achievementDetailCard,
                    !achievement.earned && styles.achievementDetailCardLocked,
                  ]}
                >
                  <View style={styles.achievementDetailHeader}>
                    <Text style={styles.achievementDetailIcon}>
                      {achievement.icon}
                    </Text>
                    <View style={styles.achievementDetailInfo}>
                      <Text
                        style={[
                          styles.achievementDetailTitle,
                          !achievement.earned &&
                            styles.achievementDetailTitleLocked,
                        ]}
                      >
                        {achievement.title}
                      </Text>
                      <Text
                        style={[
                          styles.achievementDetailDescription,
                          !achievement.earned &&
                            styles.achievementDetailDescriptionLocked,
                        ]}
                      >
                        {achievement.description}
                      </Text>
                    </View>
                    {achievement.earned ? (
                      <View style={styles.earnedBadge}>
                        <Check size={16} color="#10B981" />
                      </View>
                    ) : (
                      <View style={styles.lockedBadge}>
                        <Text style={styles.lockedBadgeText}>🔒</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
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
  achievementsContainer: {
    marginTop: 16,
    gap: 12,
  },
  achievementDetailCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  achievementDetailCardLocked: {
    opacity: 0.6,
    backgroundColor: "#F9FAFB",
  },
  achievementDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  achievementDetailIcon: {
    fontSize: 32,
  },
  achievementDetailInfo: {
    flex: 1,
  },
  achievementDetailTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  achievementDetailTitleLocked: {
    color: "#9CA3AF",
  },
  achievementDetailDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  achievementDetailDescriptionLocked: {
    color: "#D1D5DB",
  },
  earnedBadge: {
    backgroundColor: "#ECFDF5",
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  lockedBadge: {
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  lockedBadgeText: {
    fontSize: 16,
  },
});

export default AchievementsModal;
