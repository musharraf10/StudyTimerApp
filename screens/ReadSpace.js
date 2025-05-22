import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { styles } from './Home';

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
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reading Goals</Text>
          <Text style={styles.cardContent}>Set your daily reading targets here</Text>
        </View>
      </View>
    </ScrollView>
  );
}
