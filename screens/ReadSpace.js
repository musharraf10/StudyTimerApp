import React from 'react';
import { styles } from './Home';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ReadSpaceScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to ReadSpace</Text>
        <Text style={styles.description}>
          Your dedicated reading environment. Here you can focus on reading without distractions.
        </Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Reading</Text>
          <Text style={styles.cardContent}>No book currently selected</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="add" size={20} color="#6366F1" />
            <Text style={styles.actionButtonText}>Start Reading</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reading Goals</Text>
          <Text style={styles.cardContent}>Set your daily reading targets here</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="track-changes" size={20} color="#6366F1" />
            <Text style={styles.actionButtonText}>Set Goals</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Focus Timer</Text>
          <Text style={styles.cardContent}>Use pomodoro technique for focused reading</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="timer" size={20} color="#6366F1" />
            <Text style={styles.actionButtonText}>Start Timer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}