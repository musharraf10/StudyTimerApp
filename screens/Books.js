import React from 'react';
import { styles } from './Home';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function BooksScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Books</Text>
        <Text style={styles.description}>
          Manage your book library, track your reading progress, and discover new books.
        </Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>My Library</Text>
          <Text style={styles.cardContent}>Your book collection will appear here</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="add" size={20} color="#6366F1" />
            <Text style={styles.actionButtonText}>Add Book</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reading List</Text>
          <Text style={styles.cardContent}>Books you want to read next</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="bookmark-add" size={20} color="#6366F1" />
            <Text style={styles.actionButtonText}>Add to List</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Finished Books</Text>
          <Text style={styles.cardContent}>Books you've completed</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="done-all" size={20} color="#6366F1" />
            <Text style={styles.actionButtonText}>View All</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}