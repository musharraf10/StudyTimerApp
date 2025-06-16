import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { app } from "./firebase";

// Initialize Firebase Storage
const storage = getStorage(app);

// Upload a file to Firebase Storage
async function uploadFile(file, filePath) {
  try {
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

// Get the download URL of a file
async function getFileDownloadURL(filePath) {
  try {
    const storageRef = ref(storage, filePath);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error getting download URL:", error);
  }
}

// Delete a file from Firebase Storage
async function deleteFile(filePath) {
  try {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}

export { uploadFile, getFileDownloadURL, deleteFile };
