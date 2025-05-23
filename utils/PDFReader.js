// components/PDFReader.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";

const PDFReader = ({ book, onClose, onMessage }) => {
  if (!book) return null;

  const viewerUri =
    FileSystem.documentDirectory +
    "pdfjs/web/viewer.html?file=" +
    encodeURIComponent(book.path);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {book.title}
        </Text>
      </View>

      <WebView
        originWhitelist={["*"]}
        source={{ uri: viewerUri }}
        allowFileAccess
        allowUniversalAccessFromFileURLs
        javaScriptEnabled
        domStorageEnabled
        onMessage={onMessage}
        style={{ flex: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
  },
  title: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
});

export default PDFReader;
