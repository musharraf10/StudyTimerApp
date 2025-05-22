import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
// import auth from '@react-native-firebase/auth';

export default function HomeScreen() {
//   const user = auth().currentUser;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.welcome}>
          Welcome to Home, {"Musharaf" || user?.email}!
        </Text>
        <Text style={styles.description}>
          This is your dashboard where you can see an overview of your focus activities, 
          reading progress, and upcoming tasks.
        </Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Focus</Text>
          <Text style={styles.cardContent}>Ready to start your productive day!</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Stats</Text>
          <Text style={styles.cardContent}>
            • Books Read: 0{'\n'}
            • Tasks Completed: 0{'\n'}
            • Reading Time: 0 minutes
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  welcome: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#64748b',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

// Apply the shared styles to each screen component
export const styles = {...screenStyles };