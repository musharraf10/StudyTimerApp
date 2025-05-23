import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { WebView } from "react-native-webview";
import * as MediaLibrary from "expo-media-library";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PDFReader from "../utils/PDFReader";

const BooksScreen = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBook, setNewBook] = useState({ title: "", author: "" });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const storedBooks = await AsyncStorage.getItem("books");
      if (storedBooks) {
        setBooks(JSON.parse(storedBooks));
      }
    } catch (error) {
      console.error("Failed to load books", error);
    }
  };

  const saveBooks = async (updatedBooks) => {
    try {
      await AsyncStorage.setItem("books", JSON.stringify(updatedBooks));
      setBooks(updatedBooks);
    } catch (error) {
      console.error("Failed to save books", error);
    }
  };

  const requestStoragePermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === "granted";
  };

  const uploadBook = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (res.type === "success") {
        setLoading(true);

        const newBookEntry = {
          id: Date.now().toString(),
          title: newBook.title || res.name.replace(".pdf", ""),
          author: newBook.author || "Unknown",
          path: res.uri,
          progress: 0,
          lastRead: new Date().toISOString(),
          bookmarks: [],
          isFinished: false,
        };

        const updatedBooks = [...books, newBookEntry];
        await saveBooks(updatedBooks);

        setShowAddModal(false);
        setNewBook({ title: "", author: "" });
        Alert.alert("Success", "Book added successfully");
      }
    } catch (err) {
      if (err.code === "DOCUMENT_PICKER_CANCELED") {
        console.log("User cancelled file picker");
      } else {
        console.error("Error uploading book", err);
        Alert.alert("Error", "Failed to upload book");
      }
    } finally {
      setLoading(false);
    }
  };

  const openBook = (book) => {
    setSelectedBook(book);
    setShowPdfViewer(true);
  };

  const updateProgress = (page, numberOfPages) => {
    setCurrentPage(page);
    setTotalPages(numberOfPages);

    if (selectedBook) {
      const progress = Math.floor((page / numberOfPages) * 100);
      const updatedBooks = books.map((b) =>
        b.id === selectedBook.id
          ? { ...b, progress, lastRead: new Date().toISOString() }
          : b
      );
      saveBooks(updatedBooks);
    }
  };

  const addBookmark = () => {
    if (selectedBook && currentPage > 0) {
      const bookmark = {
        page: currentPage,
        date: new Date().toISOString(),
        note: `Page ${currentPage}`,
      };

      const updatedBooks = books.map((b) =>
        b.id === selectedBook.id
          ? { ...b, bookmarks: [...b.bookmarks, bookmark] }
          : b
      );

      saveBooks(updatedBooks);
      Alert.alert("Bookmark added", `Bookmarked page ${currentPage}`);
    }
  };

  const markAsFinished = () => {
    if (selectedBook) {
      const updatedBooks = books.map((b) =>
        b.id === selectedBook.id ? { ...b, isFinished: true, progress: 100 } : b
      );

      saveBooks(updatedBooks);
      setShowPdfViewer(false);
      Alert.alert("Completed", "Book marked as finished");
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentlyReading = books.filter(
    (b) => b.progress > 0 && b.progress < 100
  );
  const finishedBooks = books.filter((b) => b.isFinished);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search books..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content}>
        {currentlyReading.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Currently Reading</Text>
            <FlatList
              horizontal
              data={currentlyReading}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.bookCard}
                  onPress={() => openBook(item)}
                >
                  <Icon name="book" size={40} color="#6366F1" />
                  <Text style={styles.bookTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.bookAuthor}>{item.author}</Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${item.progress}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>{item.progress}%</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Library Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Library</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Icon name="add" size={20} color="#6366F1" />
            </TouchableOpacity>
          </View>

          {filteredBooks.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="book" size={50} color="#CCC" />
              <Text style={styles.emptyText}>No books found</Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.uploadButtonText}>
                  Upload Your First Book
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredBooks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.bookListItem}
                  onPress={() => openBook(item)}
                >
                  <Icon
                    name={item.isFinished ? "done-all" : "book"}
                    size={24}
                    color={item.isFinished ? "#10B981" : "#6366F1"}
                  />
                  <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle}>{item.title}</Text>
                    <Text style={styles.bookAuthor}>{item.author}</Text>
                    {item.progress > 0 && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${item.progress}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {item.progress}%
                        </Text>
                      </View>
                    )}
                  </View>
                  <Icon name="chevron-right" size={24} color="#999" />
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* Finished Books */}
        {finishedBooks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Finished Books</Text>
            <FlatList
              horizontal
              data={finishedBooks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.bookCard}
                  onPress={() => openBook(item)}
                >
                  <Icon name="done-all" size={40} color="#10B981" />
                  <Text style={styles.bookTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.bookAuthor}>{item.author}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </ScrollView>

      {/* Add Book Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Book</Text>

            <TextInput
              style={styles.input}
              placeholder="Book Title"
              value={newBook.title}
              onChangeText={(text) => setNewBook({ ...newBook, title: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Author (optional)"
              value={newBook.author}
              onChangeText={(text) => setNewBook({ ...newBook, author: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setNewBook({ title: "", author: "" });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.uploadButton]}
                onPress={uploadBook}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Icon name="upload" size={18} color="#FFF" />
                    <Text style={styles.uploadButtonText}>Upload PDF</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* PDF Viewer Modal */}
      <Modal visible={showPdfViewer} animationType="slide">
        <PDFReader
          book={selectedBook}
          onClose={() => setShowPdfViewer(false)}
          onMessage={(event) => {
            const { page, totalPages } = JSON.parse(event.nativeEvent.data);
            updateProgress(page, totalPages);
          }}
          onBookmark={addBookmark}
          onFinish={markAsFinished}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 16,
    margin: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
  },
  addButton: {
    backgroundColor: "#E0E7FF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  bookCard: {
    width: 120,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookListItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
    marginRight: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6366F1",
  },
  progressText: {
    fontSize: 12,
    color: "#64748B",
  },
  emptyState: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
    marginVertical: 16,
    textAlign: "center",
  },
  uploadButton: {
    backgroundColor: "#6366F1",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  uploadButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  cancelButton: {
    backgroundColor: "#F1F5F9",
    marginRight: 8,
  },
  uploadButton: {
    backgroundColor: "#6366F1",
    marginLeft: 8,
  },
  cancelButtonText: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 8,
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: "#1E293B",
  },
  pdfHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#1E293B",
    paddingTop: Platform.OS === "ios" ? 50 : 16,
  },
  pdfTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
    marginHorizontal: 16,
  },
  pdfActions: {
    flexDirection: "row",
  },
  actionIcon: {
    marginLeft: 16,
  },
  pdf: {
    flex: 1,
    backgroundColor: "#1E293B",
  },
  pdfFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#1E293B",
  },
  pageInfo: {
    color: "#FFF",
    fontSize: 14,
  },
  progressInfo: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default BooksScreen;
