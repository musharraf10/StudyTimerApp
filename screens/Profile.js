import React, { useState, useEffect, useContext } from 'react';
import { styles } from './Home';
import { AuthContext } from '../context/AuthContext';
import { View, Text,ScrollView, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthService } from '../utils/authService';
import { CommonActions } from '@react-navigation/native';

export default function ProfileScreen({ navigation }) {
  const [user1, setUser1] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const currentUser = await AuthService.getCurrentUser();
      setUser1(currentUser);
    };
    getUser();
  }, []);

  const { setUser } = useContext(AuthContext);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await AuthService.logout();
            setUser(null);
            
          }
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
          <Text style={styles.userName}>{user1?.displayName || 'User'}</Text>
          <Text style={styles.userEmail}>{user1?.email}</Text>
          <View style={styles.badgeContainer}>
            <Text style={styles.badge}>
              {user1?.loginMethod === 'google' ? '🔗 Google' : '📧 Email'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Settings</Text>
          <Text style={styles.cardContent}>Manage your account preferences and settings</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="settings" size={20} color="#6366F1" />
            <Text style={styles.actionButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reading Statistics</Text>
          <Text style={styles.cardContent}>
            • Member since: {user1?.createdAt ? 
              new Date(user1.createdAt).toLocaleDateString() : 'Recently'}
            {'\n'}• Total books read: 0
            {'\n'}• Reading streak: 0 days
            {'\n'}• Tasks completed: 0
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferences</Text>
          <Text style={styles.cardContent}>Customize your FOCUSVALUT experience</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="tune" size={20} color="#6366F1" />
            <Text style={styles.actionButtonText}>Preferences</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Icon name="logout" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}