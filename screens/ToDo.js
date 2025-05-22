import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { styles } from './Home';

export default function ToDoScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to ToDo</Text>
        <Text style={styles.description}>
          Organize your tasks and boost your productivity with focused task management.
        </Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Tasks</Text>
          <Text style={styles.cardContent}>No tasks for today</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upcoming Tasks</Text>
          <Text style={styles.cardContent}>No upcoming tasks</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Completed Tasks</Text>
          <Text style={styles.cardContent}>Great job! Keep up the momentum</Text>
        </View>
      </View>
    </ScrollView>
  );
}