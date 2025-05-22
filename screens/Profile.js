import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
// import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './Home';

export default function ProfileScreen() {
//   const user = auth().currentUser;
    const user = {
        displayName: "Musharaf",
        email: "skmusharaf12@gmail.com"
    }
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => auth().signOut()
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Icon name="person" size={50} color="#6366F1" />
          </View>
          <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || "musharaf@gmail.com"}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Settings</Text>
          <Text style={styles.cardContent}>Manage your account preferences and settings</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reading Statistics</Text>
          <Text style={styles.cardContent}>
            • Member since: {user?.metadata?.creationTime ? 
              new Date(user.metadata.creationTime).toLocaleDateString() : 'Recently'}
            {'\n'}• Total books read: 0
            {'\n'}• Reading streak: 0 days
          </Text>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Icon name="logout" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}