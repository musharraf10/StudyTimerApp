import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

const PDFReader = ({ book, onClose, onBookmark, onFinish }) => {
  const [pdfUri, setPdfUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(book?.progress || 1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        setError("Storage permission denied");
        setLoading(false);
      }
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    const preparePdfUri = async () => {
      if (!book || !book.path) {
        setError("No book or book.path provided");
        setLoading(false);
        return;
      }

      try {
        const fileInfo = await FileSystem.getInfoAsync(book.path);
        console.log("Source file info:", fileInfo);
        if (!fileInfo.exists || fileInfo.isDirectory) {
          throw new Error(`PDF file not found at ${book.path}`);
        }

        let uri = book.path;
        if (!book.path.startsWith("http")) {
          console.warn(
            "Local PDFs may not work reliably in Expo Go. Consider a custom build."
          );
          if (fileInfo.size > 2 * 1024 * 1024) {
            setError("Local PDF too large for Expo Go. Use a custom build.");
            setLoading(false);
            return;
          }
          const fileContent = await FileSystem.readAsStringAsync(book.path, {
            encoding: FileSystem.EncodingType.Base64,
          });
          uri = `data:application/pdf;base64,${fileContent}`;
        }
        setPdfUri(uri);
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    preparePdfUri();
  }, [book]);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.error) {
        setError(`PDF rendering failed: ${data.error}`);
      } else {
        setCurrentPage(data.page);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error("WebView message error:", err);
      setError("Failed to process PDF data");
    }
  };

  const pdfViewerHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; background: #1E293B; }
        #pdfViewer { width: 100%; height: 100vh; }
        canvas { display: block; margin: 0 auto; }
      </style>
    </head>
    <body>
      <div id="pdfViewer"></div>
      <script src="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js"></script>
      <script>
        try {
          const pdfUrl = "${encodeURIComponent(
            pdfUri || "https://www.orimi.com/pdf-test.pdf"
          )}";
          console.log("Loading PDF:", pdfUrl);
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
          const loadingTask = pdfjsLib.getDocument(decodeURIComponent(pdfUrl));
          loadingTask.promise.then(pdf => {
            console.log("PDF loaded, pages:", pdf.numPages);
            const viewer = document.getElementById('pdfViewer');
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
              pdf.getPage(pageNum).then(page => {
                const scale = 1.5;
                const viewport = page.getViewport({ scale });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                viewer.appendChild(canvas);
                page.render({ canvasContext: context, viewport }).promise.then(() => {
                  console.log("Rendered page:", pageNum);
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    page: pageNum,
                    totalPages: pdf.numPages,
                    progress: (pageNum / pdf.numPages) * 100
                  }));
                });
              });
            }
          }).catch(err => {
            console.error("PDF error:", err);
            window.ReactNativeWebView.postMessage(JSON.stringify({ error: err.message }));
          });
        } catch (err) {
          console.error("Script error:", err);
          window.ReactNativeWebView.postMessage(JSON.stringify({ error: "Script error: " + err.message }));
        }
      </script>
    </body>
    </html>
  `;

  if (error) {
    return (
      <View style={styles.pdfContainer}>
        <View style={styles.pdfHeader}>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.pdfTitle} numberOfLines={1} ellipsizeMode="tail">
            {book?.title || "Error"}
          </Text>
          <View style={styles.pdfActions}>
            <TouchableOpacity onPress={onBookmark}>
              <Icon
                name="bookmark"
                size={24}
                color="#FFF"
                style={styles.actionIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onFinish}>
              <Icon
                name="done"
                size={24}
                color="#FFF"
                style={styles.actionIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.pdfContainer}>
      <View style={styles.pdfHeader}>
        <TouchableOpacity onPress={onClose}>
          <Icon name="close" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.pdfTitle} numberOfLines={1} ellipsizeMode="tail">
          {book?.title || "PDF Viewer"}
        </Text>
        <View style={styles.pdfActions}>
          <TouchableOpacity onPress={onBookmark}>
            <Icon
              name="bookmark"
              size={24}
              color="#FFF"
              style={styles.actionIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onFinish}>
            <Icon
              name="done"
              size={24}
              color="#FFF"
              style={styles.actionIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading PDF...</Text>
        </View>
      ) : (
        <WebView
          source={{ html: pdfViewerHtml, baseUrl: "file://" }}
          style={styles.pdf}
          originWhitelist={["*"]}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          allowFileAccessFromFileURLs={true}
          mixedContentMode="always"
          javaScriptEnabled={true}
          domStorageEnabled={true}
          webviewDebuggingEnabled={true}
          onMessage={handleMessage}
          onError={(syntheticEvent) => {
            console.error("WebView Error:", syntheticEvent.nativeEvent);
            setError(
              "Failed to load PDF viewer: " +
                syntheticEvent.nativeEvent.description
            );
          }}
          onHttpError={(syntheticEvent) => {
            console.error("WebView HTTP Error:", syntheticEvent.nativeEvent);
            setError("HTTP error: " + syntheticEvent.nativeEvent.statusCode);
          }}
        />
      )}
      <View style={styles.pdfFooter}>
        <Text style={styles.pageInfo}>
          Page {currentPage} of {totalPages}
        </Text>
        <Text style={styles.progressInfo}>
          {totalPages ? Math.floor((currentPage / totalPages) * 100) : 0}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pdfContainer: {
    flex: 1,
    backgroundColor: "#1E293B",
  },
  pdfHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#1E293B",
    paddingTop: Platform.OS === "ios" ? 56 : 24,
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
    backgroundColor: "#FFF",
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFF",
    fontSize: 16,
  },
});

export default PDFReader;
//Working Code
