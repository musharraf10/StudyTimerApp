import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { styles } from './Home';

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
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reading List</Text>
          <Text style={styles.cardContent}>Books you want to read next</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Finished Books</Text>
          <Text style={styles.cardContent}>Books you've completed</Text>
        </View>
      </View>
    </ScrollView>
  );
}