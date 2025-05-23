// StudyContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const StudyContext = createContext();

export const StudyProvider = ({ children }) => {
  const [activeSchedules, setActiveSchedules] = useState({});
  const [completedReadings, setCompletedReadings] = useState([]);
  const [presets, setPresets] = useState([]);

  // Load state from AsyncStorage
  const loadState = async () => {
    try {
      const schedules = await AsyncStorage.getItem("activeSchedules");
      const readings = await AsyncStorage.getItem("completedReadings");
      const presetData = await AsyncStorage.getItem("presets");
      if (schedules) setActiveSchedules(JSON.parse(schedules));
      if (readings) setCompletedReadings(JSON.parse(readings));
      if (presetData) setPresets(JSON.parse(presetData));
    } catch (error) {
      console.log("Failed to load study state:", error);
    }
  };

  // Save state to AsyncStorage
  const saveState = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(`Failed to save ${key}:`, error);
    }
  };

  useEffect(() => {
    loadState();
  }, []);

  // Save state on changes
  useEffect(() => {
    saveState("activeSchedules", activeSchedules);
  }, [activeSchedules]);

  useEffect(() => {
    saveState("completedReadings", completedReadings);
  }, [completedReadings]);

  useEffect(() => {
    saveState("presets", presets);
  }, [presets]);

  return (
    <StudyContext.Provider
      value={{
        activeSchedules,
        setActiveSchedules,
        completedReadings,
        setCompletedReadings,
        presets,
        setPresets,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};
