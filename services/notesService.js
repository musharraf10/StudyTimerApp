import { 
  doc, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { db, auth } from "./firebase";

export const NotesService = {
  // Create a new note
  createNote: async (noteData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      const note = {
        userId: user.uid,
        title: noteData.title,
        description: noteData.description,
        subject: noteData.subject || null,
        tags: noteData.tags || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'notes'), note);
      return { id: docRef.id, ...note };
    } catch (error) {
      console.error("Error creating note:", error);
      throw new Error("Failed to create note");
    }
  },

  // Get user's notes
  getNotes: async (userId, subject = null) => {
    try {
      let q = query(
        collection(db, 'notes'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );

      if (subject) {
        q = query(q, where('subject', '==', subject));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
      }));
    } catch (error) {
      console.error("Error getting notes:", error);
      throw new Error("Failed to get notes");
    }
  },

  // Update a note
  updateNote: async (noteId, updates) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      await updateDoc(doc(db, 'notes', noteId), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      return { id: noteId, ...updates };
    } catch (error) {
      console.error("Error updating note:", error);
      throw new Error("Failed to update note");
    }
  },

  // Delete a note
  deleteNote: async (noteId) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      await deleteDoc(doc(db, 'notes', noteId));
    } catch (error) {
      console.error("Error deleting note:", error);
      throw new Error("Failed to delete note");
    }
  },

  // Search notes
  searchNotes: async (userId, searchTerm) => {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation - for production, consider using Algolia or similar
      const notes = await this.getNotes(userId);
      
      const searchTermLower = searchTerm.toLowerCase();
      return notes.filter(note => 
        note.title.toLowerCase().includes(searchTermLower) ||
        note.description.toLowerCase().includes(searchTermLower) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTermLower)))
      );
    } catch (error) {
      console.error("Error searching notes:", error);
      throw new Error("Failed to search notes");
    }
  }
};