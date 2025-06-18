import React, { createContext, useState, useEffect, useContext } from "react";
import { StudyService } from "../services/studyService";
import { NotesService } from "../services/notesService";
import { TodoService } from "../services/todoService";
import { AnalyticsService } from "../services/analyticsService";
import { AuthContext } from "./AuthContext";

export const StudyContext = createContext();

export const StudyProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [activeSchedules, setActiveSchedules] = useState({});
  const [completedReadings, setCompletedReadings] = useState([]);
  const [presets, setPresets] = useState([]);
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [studyStats, setStudyStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Clear data when user logs out
      setActiveSchedules({});
      setCompletedReadings([]);
      setPresets([]);
      setNotes([]);
      setTasks([]);
      setStudyStats(null);
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load all user data in parallel
      const [
        sessions,
        userPresets,
        userNotes,
        userTasks,
        analytics
      ] = await Promise.all([
        StudyService.getStudySessions(user.id),
        StudyService.getStudyPresets(user.id),
        NotesService.getNotes(user.id),
        TodoService.getTasks(user.id),
        AnalyticsService.getUserAnalytics(user.id)
      ]);

      // Process completed readings from sessions
      const today = new Date().toISOString().split('T')[0];
      const todaySessions = sessions.filter(session => session.date === today);
      setCompletedReadings(todaySessions);

      // Load today's schedule
      const todaySchedule = await StudyService.getStudySchedule(user.id, today);
      if (todaySchedule) {
        setActiveSchedules({ [today]: todaySchedule.subjects });
      }

      setPresets(userPresets);
      setNotes(userNotes);
      setTasks(userTasks);
      setStudyStats(analytics);

    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new study session
  const createStudySession = async (sessionData) => {
    try {
      const session = await StudyService.createStudySession(sessionData);
      
      // Update local state
      setCompletedReadings(prev => [session, ...prev]);
      
      // Track analytics
      await AnalyticsService.trackStudySessionEnd(sessionData);
      
      // Reload stats
      const updatedStats = await AnalyticsService.getUserAnalytics(user.id);
      setStudyStats(updatedStats);
      
      return session;
    } catch (error) {
      console.error("Failed to create study session:", error);
      throw error;
    }
  };

  // Save study schedule
  const saveStudySchedule = async (date, subjects) => {
    try {
      const schedule = await StudyService.saveStudySchedule({
        date,
        subjects
      });
      
      // Update local state
      setActiveSchedules(prev => ({
        ...prev,
        [date]: subjects
      }));
      
      await AnalyticsService.trackFeatureUsage('schedule_created', { date, subjectCount: subjects.length });
      
      return schedule;
    } catch (error) {
      console.error("Failed to save study schedule:", error);
      throw error;
    }
  };

  // Create a new note
  const createNote = async (noteData) => {
    try {
      const note = await NotesService.createNote(noteData);
      
      // Update local state
      setNotes(prev => [note, ...prev]);
      
      await AnalyticsService.trackFeatureUsage('note_created');
      
      return note;
    } catch (error) {
      console.error("Failed to create note:", error);
      throw error;
    }
  };

  // Update a note
  const updateNote = async (noteId, updates) => {
    try {
      const updatedNote = await NotesService.updateNote(noteId, updates);
      
      // Update local state
      setNotes(prev => prev.map(note => 
        note.id === noteId ? { ...note, ...updates } : note
      ));
      
      await AnalyticsService.trackFeatureUsage('note_updated');
      
      return updatedNote;
    } catch (error) {
      console.error("Failed to update note:", error);
      throw error;
    }
  };

  // Delete a note
  const deleteNote = async (noteId) => {
    try {
      await NotesService.deleteNote(noteId);
      
      // Update local state
      setNotes(prev => prev.filter(note => note.id !== noteId));
      
      await AnalyticsService.trackFeatureUsage('note_deleted');
      
    } catch (error) {
      console.error("Failed to delete note:", error);
      throw error;
    }
  };

  // Create a new task
  const createTask = async (taskData) => {
    try {
      const task = await TodoService.createTask(taskData);
      
      // Update local state
      setTasks(prev => [task, ...prev]);
      
      await AnalyticsService.trackFeatureUsage('task_created', { 
        category: taskData.category,
        priority: taskData.priority 
      });
      
      return task;
    } catch (error) {
      console.error("Failed to create task:", error);
      throw error;
    }
  };

  // Update a task
  const updateTask = async (taskId, updates) => {
    try {
      const updatedTask = await TodoService.updateTask(taskId, updates);
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));
      
      await AnalyticsService.trackFeatureUsage('task_updated');
      
      return updatedTask;
    } catch (error) {
      console.error("Failed to update task:", error);
      throw error;
    }
  };

  // Toggle task completion
  const toggleTask = async (taskId, completed) => {
    try {
      await TodoService.toggleTask(taskId, completed);
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, completed } : task
      ));
      
      await AnalyticsService.trackFeatureUsage('task_toggled', { completed });
      
    } catch (error) {
      console.error("Failed to toggle task:", error);
      throw error;
    }
  };

  // Delete a task
  const deleteTask = async (taskId) => {
    try {
      await TodoService.deleteTask(taskId);
      
      // Update local state
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      await AnalyticsService.trackFeatureUsage('task_deleted');
      
    } catch (error) {
      console.error("Failed to delete task:", error);
      throw error;
    }
  };

  // Save study preset
  const saveStudyPreset = async (presetData) => {
    try {
      const preset = await StudyService.saveStudyPreset(presetData);
      
      // Update local state
      setPresets(prev => [preset, ...prev]);
      
      await AnalyticsService.trackFeatureUsage('preset_created');
      
      return preset;
    } catch (error) {
      console.error("Failed to save study preset:", error);
      throw error;
    }
  };

  // Delete study preset
  const deleteStudyPreset = async (presetId) => {
    try {
      await StudyService.deleteStudyPreset(presetId);
      
      // Update local state
      setPresets(prev => prev.filter(preset => preset.id !== presetId));
      
      await AnalyticsService.trackFeatureUsage('preset_deleted');
      
    } catch (error) {
      console.error("Failed to delete study preset:", error);
      throw error;
    }
  };

  const value = {
    // State
    activeSchedules,
    completedReadings,
    presets,
    notes,
    tasks,
    studyStats,
    loading,
    
    // Legacy setters (for compatibility)
    setActiveSchedules,
    setCompletedReadings,
    setPresets,
    
    // New methods
    createStudySession,
    saveStudySchedule,
    createNote,
    updateNote,
    deleteNote,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    saveStudyPreset,
    deleteStudyPreset,
    loadUserData
  };

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  );
};