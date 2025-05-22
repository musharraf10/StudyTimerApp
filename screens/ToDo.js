import React from 'react';
import { styles } from './Home';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="add-task" size={20} color="#6366F1" />
            <Text style={styles.actionButtonText}>Add Task</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upcoming Tasks</Text>
          <Text style={styles.cardContent}>No upcoming tasks</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="schedule" size={20} color="#6366F1" />
            <Text style={styles.actionButtonText}>Schedule Task</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Completed Tasks</Text>
          <Text style={styles.cardContent}>Great job! Keep up the momentum</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="done" size={20} color="#6366F1" />
            <Text style={styles.actionButtonText}>View History</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}