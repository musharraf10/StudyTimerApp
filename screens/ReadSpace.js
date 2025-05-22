import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Animated,
  TextInput,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Mock data
const READING_ROOM_USERS = [
  { id: 1, name: 'Alex Johnson', hours: 24.5, rank: 1, status: 'online' },
  { id: 2, name: 'Sarah Kim', hours: 18.2, rank: 2, status: 'studying' },
  { id: 3, name: 'Mike Chen', hours: 15.8, rank: 3, status: 'break' },
  { id: 4, name: 'Emma Davis', hours: 12.3, rank: 4, status: 'offline' },
];

const MOCK_NOTES = [
  {
    id: 1,
    title: 'Biology Chapter 5',
    date: '2024-01-20',
    time: '14:30',
    description: 'Key points about cellular respiration and photosynthesis processes.',
  },
  {
    id: 2,
    title: 'Physics Formulas',
    date: '2024-01-19',
    time: '16:45',
    description: 'Important formulas for mechanics and thermodynamics.',
  },
];

const BADGES = [
  {
    id: 'streak',
    name: '7 DAY STREAK',
    icon: 'fire',
    color: '#FFAC33',
    background: '#FEF5E7',
    progress: 100,
    iconFamily: 'FontAwesome5',
  },
  {
    id: 'early',
    name: 'EARLY BIRD',
    icon: 'twitter',
    color: '#74B9FF',
    background: '#E6F3FF',
    progress: 80,
    iconFamily: 'FontAwesome5',
  },
  {
    id: 'night',
    name: 'NIGHT OWL',
    icon: 'moon',
    color: '#7F8CF7',
    background: '#ECEEFF',
    progress: 65,
    iconFamily: 'FontAwesome5',
  },
  {
    id: 'reader',
    name: 'CONSISTENT READER',
    icon: 'book-open',
    color: '#4ECDC4',
    background: '#E0F7F5',
    progress: 90,
    iconFamily: 'FontAwesome5',
  },
];

export default function ReadSpaceScreen(){
  // State declarations
  const [selectedDay, setSelectedDay] = useState(
    new Date().toISOString().split('T')[0] // e.g., "2025-05-23"
  );
  const [animatedValue] = useState(new Animated.Value(0));
  const [currentTab, setCurrentTab] = useState('reading');
  const [readingSpaceTab, setReadingSpaceTab] = useState('continue');
  const [notes, setNotes] = useState(MOCK_NOTES);
  const [completedReadings, setCompletedReadings] = useState([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', description: '' });
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'Alex', message: 'Starting my study session now!', time: '10:30' },
    { id: 2, user: 'Sarah', message: 'Good luck everyone! 📚', time: '10:32' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState({ show: false, type: '' });
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [activeSchedules, setActiveSchedules] = useState({}); // Keys are date strings, e.g., "2025-05-23"
  const [currentFormDay, setCurrentFormDay] = useState(null); // Date string, e.g., "2025-05-23"
  const [numSubjects, setNumSubjects] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [scheduleDays, setScheduleDays] = useState([]); // Array of date strings
  const daySelectorRef = useRef(null);

  // Animation for tab switching
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: currentTab === 'reading' ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentTab]);

  // Toggle between main tabs
  const toggleTab = (tab) => {
    if (tab !== currentTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentTab(tab);
    }
  };

  // Toggle between reading space tabs
  const toggleReadingSpaceTab = (tab) => {
    if (tab !== readingSpaceTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setReadingSpaceTab(tab);
    }
  };

  // Get current date and time for display
  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return { date, time };
  };

  // Get current day's schedule
  const getCurrentDaySchedule = () => {
    const currentDate = new Date().toISOString().split('T')[0]; // e.g., "2025-05-23"
    return activeSchedules[currentDate] || [];
  };

  // Generate days between start and end dates
  const getDaysInRange = (start, end) => {
    const days = [];
    let current = new Date(start);
    while (current <= end) {
      days.push(current.toISOString().split('T')[0]); // e.g., "2025-05-23"
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  // Handle date selection
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker({ show: false, type: '' });
    if (selectedDate) {
      if (showDatePicker.type === 'start') {
        setStartDate(selectedDate);
      } else {
        if (selectedDate < startDate) {
          Alert.alert('Error', 'End date cannot be before start date.');
        } else {
          setEndDate(selectedDate);
          setScheduleDays(getDaysInRange(startDate, selectedDate));
          setShowScheduleForm(true);
        }
      }
    }
  };

  // Handle schedule form submission
  const handleScheduleFormSubmit = () => {
    // Validate schedule title (only required for the first step)
    if (!currentFormDay && !scheduleTitle.trim()) {
      Alert.alert('Error', 'Please enter a schedule title.');
      return;
    }

    // If currentFormDay is set, validate subjects
    if (currentFormDay) {
      const num = parseInt(numSubjects) || 0;
      // Allow 0 subjects (empty schedule for the day)
      if (numSubjects === '' || num < 0) {
        Alert.alert('Error', 'Please enter a valid number of subjects (0 or more).');
        return;
      }
      // If subjects are specified, ensure all fields are filled
      if (num > 0) {
        if (
          subjects.length !== num ||
          subjects.some((sub) => !sub.name.trim() || !sub.duration.trim())
        ) {
          Alert.alert('Error', 'Please fill all subject fields correctly.');
          return;
        }
      }
      // Save the schedule for the current day
      const newSchedules = { ...activeSchedules };
      newSchedules[currentFormDay] = num > 0
        ? subjects.map((sub, index) => ({
            id: index + 1,
            subject: sub.name,
            color: '#F4ECF7',
            duration: parseInt(sub.duration) || 60, // Store as number
          }))
        : [];
      setActiveSchedules(newSchedules);
    }

    // Move to the next day or finish
    setSubjects([]);
    setNumSubjects('');
    if (currentFormDay) {
      const nextDayIndex = scheduleDays.indexOf(currentFormDay) + 1;
      if (nextDayIndex < scheduleDays.length) {
        setCurrentFormDay(scheduleDays[nextDayIndex]);
      } else {
        setShowScheduleForm(false);
        setCurrentFormDay(null);
      }
    } else {
      // Move to the first day after entering the title
      setCurrentFormDay(scheduleDays[0]);
    }
  };

  // Add new note
  const addNote = () => {
    if (newNote.title.trim() && newNote.description.trim()) {
      const now = new Date();
      const note = {
        id: Date.now(),
        title: newNote.title,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 5),
        description: newNote.description,
      };
      setNotes([note, ...notes]);
      setNewNote({ title: '', description: '' });
      setShowNoteModal(false);
    }
  };

  // Send chat message
  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        user: 'You',
        message: newMessage,
        time: new Date().toTimeString().slice(0, 5),
      };
      setChatMessages([...chatMessages, message]);
      setNewMessage('');
    }
  };

  // Mark subject as complete with confirmation
  const markSubjectComplete = (item) => {
    const currentDate = new Date().toISOString().split('T')[0]; // e.g., "2025-05-23"
    Alert.alert(
      'Confirm Completion',
      `Have you studied ${item.subject} for ${item.duration} minutes?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            const completed = {
              id: Date.now(),
              subject: item.subject,
              duration: item.duration,
              completedAt: new Date().toTimeString().slice(0, 5),
            };
            setCompletedReadings([completed, ...completedReadings]);
            setActiveSchedules({
              ...activeSchedules,
              [currentDate]: activeSchedules[currentDate]?.filter((sub) => sub.id !== item.id) || [],
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  // Render calendar modal
  const renderCalendarModal = () => {
    return (
      <Modal visible={showCalendarModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date Range</Text>
            <TouchableOpacity
              style={styles.selectDateButton}
              onPress={() => setShowDatePicker({ show: true, type: 'start' })}
            >
              <Text style={styles.selectDateText}>
                Start Date: {startDate ? startDate.toLocaleDateString('en-US') : 'Select'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.selectDateButton}
              onPress={() => setShowDatePicker({ show: true, type: 'end' })}
            >
              <Text style={styles.selectDateText}>
                End Date: {endDate ? endDate.toLocaleDateString('en-US') : 'Select'}
              </Text>
            </TouchableOpacity>
            {showDatePicker.show && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCalendarModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  if (startDate && endDate) {
                    setShowCalendarModal(false);
                    setShowScheduleForm(true);
                    setCurrentFormDay(null); // Start with title input
                  } else {
                    Alert.alert('Error', 'Please select both start and end dates.');
                  }
                }}
              >
                <Text style={styles.saveButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Render schedule form modal (no time field, larger modal)
  const renderScheduleForm = () => {
    const isSaveDisabled = currentFormDay
      ? !numSubjects || parseInt(numSubjects) < 0 || (parseInt(numSubjects) > 0 && (
          subjects.length !== parseInt(numSubjects) ||
          subjects.some((sub) => !sub.name.trim() || !sub.duration.trim())
        ))
      : !scheduleTitle.trim();

    // Convert currentFormDay to weekday for display
    const displayDay = currentFormDay
      ? new Date(currentFormDay).toLocaleDateString('en-US', { weekday: 'short' })
      : '';

    return (
      <Modal visible={showScheduleForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {currentFormDay ? `Schedule for ${displayDay} (${currentFormDay})` : 'New Schedule'}
            </Text>
            {!currentFormDay && (
              <TextInput
                style={styles.noteInput}
                value={scheduleTitle}
                onChangeText={setScheduleTitle}
                placeholder="Schedule Title"
                placeholderTextColor="#A0AEC0"
              />
            )}
            {currentFormDay && (
              <>
                <Text style={styles.sectionTitle}>Number of Subjects</Text>
                <TextInput
                  style={styles.noteInput}
                  value={numSubjects}
                  onChangeText={(text) => {
                    setNumSubjects(text);
                    const num = parseInt(text) || 0;
                    if (num >= 0) {
                      setSubjects(
                        Array(num)
                          .fill()
                          .map((_, index) => ({
                            id: index + 1,
                            name: '',
                            duration: '',
                          }))
                      );
                    } else {
                      setSubjects([]);
                    }
                  }}
                  placeholder="Enter number of subjects (0 or more)"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="numeric"
                />
                {subjects.map((subject, index) => (
                  <View key={index} style={styles.subjectItem}>
                    <TextInput
                      style={styles.subjectInput}
                      value={subject.name}
                      onChangeText={(text) => {
                        const updatedSubjects = [...subjects];
                        updatedSubjects[index].name = text;
                        setSubjects(updatedSubjects);
                      }}
                      placeholder="Subject Name"
                      placeholderTextColor="#A0AEC0"
                    />
                    <TextInput
                      style={styles.subjectInput}
                      value={subject.duration}
                      onChangeText={(text) => {
                        const updatedSubjects = [...subjects];
                        updatedSubjects[index].duration = text;
                        setSubjects(updatedSubjects);
                      }}
                      placeholder="Duration (min)"
                      placeholderTextColor="#A0AEC0"
                      keyboardType="numeric"
                    />
                  </View>
                ))}
              </>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowScheduleForm(false);
                  setCurrentFormDay(null);
                  setSubjects([]);
                  setNumSubjects('');
                  setScheduleTitle('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.saveButton,
                  isSaveDisabled && styles.disabledButton,
                ]}
                onPress={handleScheduleFormSubmit}
                disabled={isSaveDisabled}
              >
                <Text style={styles.saveButtonText}>
                  {currentFormDay && scheduleDays.indexOf(currentFormDay) === scheduleDays.length - 1
                    ? 'Finish'
                    : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Render continue reading section (show duration, no direct completion)
  const renderContinueReading = () => {
    const schedule = getCurrentDaySchedule();
    const { date, time } = getCurrentDateTime();

    return (
      <View style={styles.continueReadingContainer}>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.currentDate}>{date}</Text>
          <Text style={styles.currentTime}>{time}</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Today's Focus</Text>
        {schedule.length > 0 ? (
          schedule.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.focusItem, { backgroundColor: item.color }]}
              onPress={() => markSubjectComplete(item)}
            >
              <View style={styles.focusTimeContainer}>
                <Text style={styles.focusTime}>{item.duration}min</Text>
              </View>
              <View style={styles.focusDetails}>
                <Text style={styles.focusSubject}>{item.subject}</Text>
                <Text style={styles.focusStatus}>Tap to confirm completion</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyFocus}>
            <MaterialCommunityIcons name="book-open-page-variant" size={40} color="#ccc" />
            <Text style={styles.emptyFocusText}>No subjects scheduled for today</Text>
          </View>
        )}
      </View>
    );
  };

  // Render timetable management
  const renderTimetableManagement = () => {
    return (
      <View style={styles.timetableManagement}>
        <View style={styles.notesHeader}>
          <Text style={styles.sectionTitle}>{scheduleTitle || 'Timetable'}</Text>
          <TouchableOpacity
            style={styles.addNoteButton}
            onPress={() => setShowCalendarModal(true)}
            accessibilityLabel="Create new schedule"
            accessibilityRole="button"
          >
            <Ionicons name="calendar" size={24} color="#6366F1" />
          </TouchableOpacity>
        </View>
        {renderDaySelector()}
        {renderSchedule()}
      </View>
    );
  };

  // Render reading room
  const renderReadingRoom = () => {
    return (
      <View style={styles.readingRoom}>
        <View style={styles.rankingSection}>
          <Text style={styles.sectionTitle}>Study Rankings</Text>
          {READING_ROOM_USERS.map((user) => (
            <View key={user.id} style={styles.userRankItem}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankNumber}>{user.rank}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userHours}>{user.hours} hours</Text>
              </View>
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(user.status) }]} />
            </View>
          ))}
        </View>
        <View style={styles.chatSection}>
          <Text style={styles.sectionTitle}>Study Chat</Text>
          <View style={styles.chatContainer}>
            <ScrollView style={styles.chatMessages}>
              {chatMessages.map((msg) => (
                <View key={msg.id} style={styles.chatMessage}>
                  <Text style={styles.chatUser}>{msg.user}</Text>
                  <Text style={styles.chatText}>{msg.message}</Text>
                  <Text style={styles.chatTime}>{msg.time}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.chatInput}>
              <TextInput
                style={styles.messageInput}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message..."
                placeholderTextColor="#A0AEC0"
              />
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Ionicons name="send" size={20} color="#6366F1" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Helper function for status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return '#4CAF50';
      case 'studying':
        return '#2196F3';
      case 'break':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  // Render completed readings
  const renderCompletedReadings = () => {
    return (
      <View style={styles.completedReadings}>
        <Text style={styles.sectionTitle}>Today's Completed Readings</Text>
        {completedReadings.length > 0 ? (
          completedReadings.map((reading) => (
            <View key={reading.id} style={styles.completedItem}>
              <View style={styles.completedIcon}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              </View>
              <View style={styles.completedDetails}>
                <Text style={styles.completedSubject}>{reading.subject}</Text>
                <Text style={styles.completedTime}>
                  Duration: {reading.duration}min • Completed: {reading.completedAt}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCompleted}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={40} color="#ccc" />
            <Text style={styles.emptyCompletedText}>No completed readings today</Text>
          </View>
        )}
      </View>
    );
  };

  // Render notes
  const renderNotes = () => {
    return (
      <View style={styles.notesSection}>
        <View style={styles.notesHeader}>
          <Text style={styles.sectionTitle}>My Notes</Text>
          <TouchableOpacity
            style={styles.addNoteButton}
            onPress={() => setShowNoteModal(true)}
          >
            <Ionicons name="add" size={24} color="#6366F1" />
          </TouchableOpacity>
        </View>
        {notes.map((note) => (
          <View key={note.id} style={styles.noteItem}>
            <View style={styles.noteHeader}>
              <Text style={styles.noteTitle}>{note.title}</Text>
              <Text style={styles.noteDateTime}>
                {note.date} • {note.time}
              </Text>
            </View>
            <Text style={styles.noteDescription}>{note.description}</Text>
          </View>
        ))}
        <Modal visible={showNoteModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New Note</Text>
              <TextInput
                style={styles.noteInput}
                value={newNote.title}
                onChangeText={(text) => setNewNote({ ...newNote, title: text })}
                placeholder="Note title"
                placeholderTextColor="#A0AEC0"
              />
              <TextInput
                style={[styles.noteInput, styles.noteDescriptionInput]}
                value={newNote.description}
                onChangeText={(text) => setNewNote({ ...newNote, description: text })}
                placeholder="Note description"
                placeholderTextColor="#A0AEC0"
                multiline
                numberOfLines={4}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowNoteModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={addNote}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  // Render badges
  const renderBadges = () => {
    return (
      <View style={styles.badgesContainer}>
        <View style={styles.badgeRow}>
          {BADGES.map((badge) => (
            <View key={badge.id} style={styles.badgeItem}>
              <View style={[styles.badgeIconContainer, { backgroundColor: badge.background }]}>
                {badge.iconFamily === 'FontAwesome5' ? (
                  <FontAwesome5 name={badge.icon} size={30} color={badge.color} />
                ) : (
                  <Ionicons name={badge.icon} size={30} color={badge.color} />
                )}
              </View>
              <View style={styles.badgeProgressContainer}>
                <View
                  style={[styles.badgeProgress, { width: `${badge.progress}%`, backgroundColor: badge.color }]}
                />
              </View>
              <Text style={styles.badgeName}>{badge.name}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Render day selector
  const renderDaySelector = () => {
    return (
      <View style={styles.daySelector}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayScrollContent}
          ref={daySelectorRef}
        >
          {scheduleDays.length > 0 ? (
            scheduleDays.map((date, index) => {
              const day = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
              const isSelected = date === selectedDay;
              return (
                <TouchableOpacity
                  key={date}
                  style={[styles.dayItem, isSelected && styles.selectedDayItem]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedDay(date);
                    daySelectorRef.current.scrollTo({
                      x: index * 80,
                      animated: true,
                    });
                  }}
                >
                  <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.emptyFocusText}>No days scheduled</Text>
          )}
        </ScrollView>
      </View>
    );
  };

  // Render class schedule
  const renderSchedule = () => {
    if (isLoading) {
      return (
        <View style={styles.emptySchedule}>
          <Text style={styles.emptyText}>Loading schedule...</Text>
        </View>
      );
    }
    const classes = activeSchedules[selectedDay] || [];
    if (classes.length === 0) {
      return (
        <View style={styles.emptySchedule}>
          <MaterialCommunityIcons name="calendar-blank-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No classes scheduled</Text>
          <Text style={styles.emptySubText}>Enjoy your free day!</Text>
        </View>
      );
    }
    return (
      <View style={styles.scheduleContainer}>
        {classes.map((classItem) => (
          <TouchableOpacity
            key={classItem.id}
            style={[styles.classItem, { backgroundColor: classItem.color }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
          >
            <View style={styles.classTimeContainer}>
              <Text style={styles.classTime}>{classItem.duration}min</Text>
            </View>
            <View style={styles.classDetails}>
              <Text style={styles.classSubject}>{classItem.subject}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render reading space navigation
  const renderReadingSpaceNav = () => {
    const tabs = [
      { id: 'continue', label: 'Continue Reading' },
      { id: 'timetable', label: 'Time Table' },
      { id: 'room', label: 'Reading Room' },
      { id: 'completed', label: 'Completed' },
      { id: 'notes', label: 'Notes' },
      { id: 'badges', label: 'Streaks' },
    ];
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.readingSpaceNav}
        contentContainerStyle={styles.readingSpaceNavContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.readingSpaceTab,
              readingSpaceTab === tab.id && styles.activeReadingSpaceTab,
            ]}
            onPress={() => toggleReadingSpaceTab(tab.id)}
          >
            <Text
              style={[
                styles.readingSpaceTabText,
                readingSpaceTab === tab.id && styles.activeReadingSpaceTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // Render reading space content
  const renderReadingSpaceContent = () => {
    switch (readingSpaceTab) {
      case 'continue':
        return renderContinueReading();
      case 'timetable':
        return renderTimetableManagement();
      case 'room':
        return renderReadingRoom();
      case 'completed':
        return renderCompletedReadings();
      case 'notes':
        return renderNotes();
      case 'badges':
        return renderBadges();
      default:
        return renderContinueReading();
    }
  };

  // Render tab content
  const renderTabContent = () => {
    if (currentTab === 'reading') {
      return (
        <>
          {renderReadingSpaceNav()}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {renderReadingSpaceContent()}
          </ScrollView>
          {renderCalendarModal()}
          {renderScheduleForm()}
        </>
      );
    }
  };

  // Animation values for tab indicator
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          <Animated.View style={[styles.tabIndicator, { transform: [{ translateX }] }]} />
          <TouchableOpacity
            style={styles.tab}
            onPress={() => toggleTab('reading')}
            activeOpacity={0.7}
          >
            {/* <Text style={[styles.tabText, currentTab === 'reading' && styles.activeTabText]}>
              Reading Space
            </Text> */}
          </TouchableOpacity>
        </View>
      </View>
      {renderTabContent()}
    </SafeAreaView>
  );
};

// Styles (updated modal size and adjusted for no time)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  tab: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#A0AEC0',
  },
  activeTabText: {
    color: '#2D3748',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -10,
    width: Dimensions.get('window').width / 4,
    height: 3,
    backgroundColor: '#6366F1',
    borderRadius: 3,
    marginHorizontal: 0,
  },
  readingSpaceNav: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    maxHeight: 60,
    minHeight: 60,
    borderBottomColor: '#F0F0F0',
  },
  readingSpaceNavContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  readingSpaceTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F7F8FA',
  },
  activeReadingSpaceTab: {
    backgroundColor: '#6366F1',
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  readingSpaceTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D3748',
  },
  activeReadingSpaceTabText: {
    color: '#FFFFFF',
  },
  continueReadingContainer: {
    padding: 15,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  currentDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  currentTime: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6366F1',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 15,
  },
  focusItem: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 80,
    alignItems: 'center',
  },
  focusTimeContainer: {
    width: 80,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  focusTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  focusDetails: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  focusSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  focusStatus: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyFocus: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyFocusText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 10,
  },
  timetableManagement: {
    padding: 15,
  },
  readingRoom: {
    padding: 30,
  },
  rankingSection: {
    marginBottom: 25,
  },
  userRankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  userHours: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  chatSection: {
    flex: 1,
  },
  chatContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 300,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chatMessages: {
    flex: 1,
    padding: 15,
  },
  chatMessage: {
    marginBottom: 12,
  },
  chatUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
    marginBottom: 2,
  },
  chatText: {
    fontSize: 14,
    color: '#2D3748',
    marginBottom: 2,
  },
  chatTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  chatInput: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    alignItems: 'center',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 14,
    color: '#2D3748',
    marginRight: 10,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedReadings: {
    padding: 15,
  },
  completedItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    minHeight: 80,
    alignItems: 'center',
  },
  completedIcon: {
    marginRight: 12,
    justifyContent: 'center',
  },
  completedDetails: {
    flex: 1,
  },
  completedSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  completedTime: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  emptyCompleted: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyCompletedText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 15,
  },
  notesSection: {
    padding: 15,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addNoteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    minHeight: 100,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    flex: 1,
    marginRight: 10,
  },
  noteDateTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  noteDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '95%', // Increased modal size
    maxWidth: 450, // Larger max width
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 20,
    textAlign: 'center',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2D3748',
    marginBottom: 15,
  },
  noteDescriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#6366F1',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  badgesContainer: {
    padding: 15,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badgeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeProgressContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#F1F1F1',
    borderRadius: 3,
    marginVertical: 10,
  },
  badgeProgress: {
    height: '100%',
    borderRadius: 3,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D3748',
    textAlign: 'center',
    marginTop: 5,
  },
  daySelector: {
    marginVertical: 10,
  },
  dayScrollContent: {
    paddingHorizontal: 15,
  },
  dayItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  selectedDayItem: {
    backgroundColor: '#6366F1',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  scheduleContainer: {
    padding: 15,
  },
  classItem: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 70,
    alignItems: 'center',
  },
  classTimeContainer: {
    width: 80,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  classTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  classDetails: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  classSubject: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
  },
  emptySchedule: {
    flex: 1,
    paddingTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 14,
    color: '#A0AEC0',
    marginTop: 10,
  },
  selectDateButton: {
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  selectDateText: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '600',
  },
  subjectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  subjectInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 5,
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  disabledButton: {
    backgroundColor: '#A0AEC0',
    opacity: 0.6,
  },
});