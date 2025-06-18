import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata
} from "firebase/storage";
import { storage } from "./firebase";

export const StorageService = {
  // Upload a file to Firebase Storage
  uploadFile: async (file, filePath, onProgress = null) => {
    try {
      const storageRef = ref(storage, filePath);
      
      if (onProgress) {
        // Use resumable upload with progress tracking
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(progress);
            },
            (error) => {
              console.error("Upload error:", error);
              reject(new Error("Failed to upload file"));
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
              } catch (error) {
                reject(new Error("Failed to get download URL"));
              }
            }
          );
        });
      } else {
        // Simple upload without progress tracking
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("Failed to upload file");
    }
  },

  // Upload multiple files
  uploadMultipleFiles: async (files, basePath, onProgress = null) => {
    try {
      const uploadPromises = files.map((file, index) => {
        const filePath = `${basePath}/${Date.now()}_${index}_${file.name}`;
        return this.uploadFile(file, filePath, onProgress);
      });
      
      const downloadURLs = await Promise.all(uploadPromises);
      return downloadURLs;
    } catch (error) {
      console.error("Error uploading multiple files:", error);
      throw new Error("Failed to upload multiple files");
    }
  },

  // Get the download URL of a file
  getFileDownloadURL: async (filePath) => {
    try {
      const storageRef = ref(storage, filePath);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error getting download URL:", error);
      throw new Error("Failed to get download URL");
    }
  },

  // Delete a file from Firebase Storage
  deleteFile: async (filePath) => {
    try {
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      throw new Error("Failed to delete file");
    }
  },

  // Delete multiple files
  deleteMultipleFiles: async (filePaths) => {
    try {
      const deletePromises = filePaths.map(filePath => this.deleteFile(filePath));
      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error("Error deleting multiple files:", error);
      throw new Error("Failed to delete multiple files");
    }
  },

  // List all files in a directory
  listFiles: async (directoryPath) => {
    try {
      const storageRef = ref(storage, directoryPath);
      const result = await listAll(storageRef);
      
      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const metadata = await getMetadata(itemRef);
          const downloadURL = await getDownloadURL(itemRef);
          
          return {
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            downloadURL,
            size: metadata.size,
            contentType: metadata.contentType,
            timeCreated: metadata.timeCreated,
            updated: metadata.updated
          };
        })
      );
      
      return files;
    } catch (error) {
      console.error("Error listing files:", error);
      throw new Error("Failed to list files");
    }
  },

  // Get file metadata
  getFileMetadata: async (filePath) => {
    try {
      const storageRef = ref(storage, filePath);
      const metadata = await getMetadata(storageRef);
      return metadata;
    } catch (error) {
      console.error("Error getting file metadata:", error);
      throw new Error("Failed to get file metadata");
    }
  },

  // Upload user avatar
  uploadAvatar: async (userId, imageFile, onProgress = null) => {
    try {
      const filePath = `avatars/${userId}`;
      const downloadURL = await this.uploadFile(imageFile, filePath, onProgress);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw new Error("Failed to upload avatar");
    }
  },

  // Upload study material (PDFs, images, etc.)
  uploadStudyMaterial: async (userId, file, category = 'general', onProgress = null) => {
    try {
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const filePath = `study-materials/${userId}/${category}/${timestamp}.${fileExtension}`;
      
      const downloadURL = await this.uploadFile(file, filePath, onProgress);
      
      return {
        downloadURL,
        filePath,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        category,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error uploading study material:", error);
      throw new Error("Failed to upload study material");
    }
  },

  // Upload note attachments
  uploadNoteAttachment: async (userId, noteId, file, onProgress = null) => {
    try {
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const filePath = `note-attachments/${userId}/${noteId}/${timestamp}.${fileExtension}`;
      
      const downloadURL = await this.uploadFile(file, filePath, onProgress);
      
      return {
        downloadURL,
        filePath,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error uploading note attachment:", error);
      throw new Error("Failed to upload note attachment");
    }
  },

  // Clean up user files (when account is deleted)
  cleanupUserFiles: async (userId) => {
    try {
      const userDirectories = [
        `avatars/${userId}`,
        `study-materials/${userId}`,
        `note-attachments/${userId}`
      ];
      
      for (const directory of userDirectories) {
        try {
          const files = await this.listFiles(directory);
          const filePaths = files.map(file => file.fullPath);
          if (filePaths.length > 0) {
            await this.deleteMultipleFiles(filePaths);
          }
        } catch (error) {
          // Directory might not exist, continue with cleanup
          console.log(`Directory ${directory} not found or empty`);
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error cleaning up user files:", error);
      throw new Error("Failed to cleanup user files");
    }
  }
};

// Legacy exports for backward compatibility
export const {
  uploadFile,
  getFileDownloadURL,
  deleteFile
} = StorageService;