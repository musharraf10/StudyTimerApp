import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PDFReader from "../utils/PDFReader";

// ErrorBoundary component
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <Text>Error rendering component</Text>;
    }
    return this.props.children;
  }
}

// AddBookModal component
const AddBookModal = ({ visible, onClose, onUpload, loading }) => {
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newBookAuthor, setNewBookAuthor] = useState("");
  const authorInputRef = useRef(null);

  // Log re-renders
  useEffect(() => {
    console.log("AddBookModal rendered");
  });

  const handleUpload = async () => {
    await onUpload(newBookTitle, newBookAuthor);
    setNewBookTitle("");
    setNewBookAuthor("");
  };

  return (
    <Modal visible={visible} animationType="none" transparent>
      <ErrorBoundary>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Book</Text>
            <TextInput
              style={styles.input}
              placeholder="Book Title"
              value={newBookTitle}
              onChangeText={(text) => {
                console.log("Title changed:", text);
                setNewBookTitle(text);
              }}
              autoFocus={true}
              returnKeyType="next"
              onSubmitEditing={() => {
                console.log("Title submitted, focusing author");
                authorInputRef.current?.focus();
              }}
              blurOnSubmit={false}
              onFocus={() => console.log("Title input focused")}
            />
            <TextInput
              style={styles.input}
              placeholder="Author (optional)"
              value={newBookAuthor}
              onChangeText={(text) => {
                console.log("Author changed:", text);
                setNewBookAuthor(text);
              }}
              ref={authorInputRef}
              returnKeyType="done"
              blurOnSubmit={false}
              onFocus={() => console.log("Author input focused")}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  console.log("Cancel pressed");
                  onClose();
                  setNewBookTitle("");
                  setNewBookAuthor("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.uploadButton]}
                onPress={handleUpload}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Icon name="upload" size={18} color="#E0E7FF" />
                    <Text style={styles.uploadButtonText}>Upload PDF</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ErrorBoundary>
    </Modal>
  );
};

const BooksScreen = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const storedBooks = await AsyncStorage.getItem("books");
      console.log("Loaded books from AsyncStorage:", storedBooks);
      if (storedBooks) {
        const parsedBooks = JSON.parse(storedBooks);
        setBooks(parsedBooks);
        console.log("Books set:", parsedBooks);
      } else {
        console.log("No books found in AsyncStorage");
        setBooks([]);
      }
    } catch (error) {
      console.error("Failed to load books:", error);
      Alert.alert("Error", "Failed to load books");
    }
  };

  const saveBooks = async (updatedBooks) => {
    try {
      const serializedBooks = JSON.stringify(updatedBooks);
      console.log("Saving books to AsyncStorage:", serializedBooks);
      await AsyncStorage.setItem("books", serializedBooks);
      console.log("Books saved successfully");
      setBooks(updatedBooks);
    } catch (error) {
      console.error("Failed to save books:", error);
      Alert.alert("Error", `Failed to save books: ${error.message}`);
    }
  };

  const requestStoragePermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === "granted";
  };

  const uploadBook = async (title, author) => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert("Permission Denied", "Storage permission is required.");
        return;
      }
      setLoading(true);
      const res = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });
      console.log("DocumentPicker result:", res);
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        console.log("Selected asset:", asset);
        const fileUri = `${FileSystem.documentDirectory}${asset.name}`;
        console.log("Copying file from", asset.uri, "to", fileUri);
        await FileSystem.copyAsync({
          from: asset.uri,
          to: fileUri,
        });
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        console.log("File copied:", fileInfo);
        if (!fileInfo.exists) {
          throw new Error("Failed to copy file to persistent storage");
        }
        const newBookEntry = {
          id: Date.now().toString(),
          title: title || asset.name.replace(".pdf", ""),
          author: author || "Unknown",
          path: fileUri,
          progress: 0,
          lastRead: new Date().toISOString(),
          bookmarks: [],
          isFinished: false,
        };
        console.log("New book entry:", newBookEntry);
        const updatedBooks = [...books, newBookEntry];
        await saveBooks(updatedBooks);
        setShowAddModal(false);
        Alert.alert("Success", "Book added successfully");
      } else {
        console.log("Document picker canceled or no assets");
      }
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Error", `Failed to upload book: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const removeBook = async (bookId) => {
    Alert.alert("Delete Book", "Are you sure you want to delete this book?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const bookToDelete = books.find((b) => b.id === bookId);
            if (bookToDelete) {
              await FileSystem.deleteAsync(bookToDelete.path, {
                idempotent: true,
              });
            }
            const updatedBooks = books.filter((b) => b.id !== bookId);
            await saveBooks(updatedBooks);
            Alert.alert("Success", "Book deleted successfully");
          } catch (error) {
            console.error("Failed to delete book:", error);
            Alert.alert("Error", `Failed to delete book: ${error.message}`);
          }
        },
      },
    ]);
  };

  const openBook = (book) => {
    console.log("Opening book:", book);
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

  // Data for the main FlatList
  const sections = [
    { title: "Currently Reading", key: "currentlyReading" },
    { title: "My Library", key: "library" },
    { title: "Finished Books", key: "finishedBooks" },
  ];

  // Helper function to truncate text
  const truncateText = (text, maxWords = 20, maxChars = 100) => {
    // Split text into words
    const words = text.split(" ");
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(" ") + "...";
    }
    // Fallback to character limit
    if (text.length > maxChars) {
      return text.slice(0, maxChars) + "...";
    }
    return text;
  };

  // In BooksScreen's renderSection function
  const renderSection = ({ item }) => {
    console.log("Rendering section:", item.title);
    switch (item.key) {
      case "currentlyReading":
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Currently Reading</Text>
            {currentlyReading.length === 0 ? (
              <Text style={styles.emptyText}>No books currently reading</Text>
            ) : (
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
                    <Text
                      style={styles.bookTitle}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {truncateText(item.title)}
                    </Text>
                    <Text
                      style={styles.bookAuthor}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.author}
                    </Text>
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
            )}
          </View>
        );
      case "library":
        return (
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
                  style={styles.emptyStateButton}
                  onPress={() => setShowAddModal(true)}
                >
                  <Text style={styles.emptyStateButtonText}>
                    Upload Your First Book
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={filteredBooks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.bookListItem}>
                    <TouchableOpacity
                      style={styles.bookContent}
                      onPress={() => openBook(item)}
                    >
                      <Icon
                        name={item.isFinished ? "done-all" : "book"}
                        size={24}
                        color={item.isFinished ? "#10B981" : "#6366F1"}
                      />
                      <View style={styles.bookInfo}>
                        <Text
                          style={styles.bookTitle}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {truncateText(item.title)}
                        </Text>
                        <Text
                          style={styles.bookAuthor}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {item.author}
                        </Text>
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
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => removeBook(item.id)}
                    >
                      <Icon name="delete" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </View>
        );
      case "finishedBooks":
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Finished Books</Text>
            {finishedBooks.length === 0 ? (
              <Text style={styles.emptyText}>No finished books</Text>
            ) : (
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
                    <Text
                      style={styles.bookTitle}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {truncateText(item.title)}
                    </Text>
                    <Text
                      style={styles.bookAuthor}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.author}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        );
      default:
        return null;
    }
  };
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
      <FlatList
        data={sections}
        keyExtractor={(item) => item.key}
        renderItem={renderSection}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="book" size={50} color="#CCC" />
            <Text style={styles.emptyText}>No books available</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.uploadButtonText}>
                Upload Your First Book
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add Book Modal */}
      <AddBookModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onUpload={uploadBook}
        loading={loading}
      />

      {/* PDF Viewer Modal */}
      <Modal visible={showPdfViewer} animationType="slide">
        <ErrorBoundary>
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
        </ErrorBoundary>
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
    padding: 16,
    paddingBottom: 100, // Ensure content isn’t cut off at the bottom
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    margin: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#333",
  },
  section: {
    marginBottom: 24,
    minHeight: 100, // Ensure sections don’t collapse when empty
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  addButton: {
    backgroundColor: "#E0E7FF",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bookCard: {
    width: 130,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  bookListItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  bookContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  bookInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
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
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
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
  deleteButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
  },
  emptyState: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    marginVertical: 16,
    minHeight: 200, // Ensure visibility
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
    marginVertical: 16,
    textAlign: "center",
  },
  emptyStateButton: {
    backgroundColor: "#6366F1",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyStateButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 500,
    minHeight: 300, // Ensure modal doesn’t collapse
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
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
    zIndex: 1, // Ensure input is focusable
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    minHeight: 56, // Prevent layout shift
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
  uploadButtonText: {
    color: "#E0E7FF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
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
    paddingTop: Platform.OS === "ios" ? 56 : 24, // Adjust for iOS notch
    borderBottomWidth: 1,
    borderBottomColor: "#2D3748",
  },
  pdfTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
    marginHorizontal: 16,
    textAlign: "center",
  },
  pdfActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIcon: {
    marginLeft: 16,
  },
  pdf: {
    flex: 1,
    backgroundColor: "#FFF", // Better contrast for PDF content
  },
  pdfFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#1E293B",
    borderTopWidth: 1,
    borderTopColor: "#2D3748",
  },
  pageInfo: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  progressInfo: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default BooksScreen;
//OG
