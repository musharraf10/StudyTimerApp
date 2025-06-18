import { 
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

// Generic database service for common operations
export const DatabaseService = {
  // Get a single document
  getDocument: async (collectionName, docId) => {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate?.() || null,
          updatedAt: docSnap.data().updatedAt?.toDate?.() || null
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting document:", error);
      throw new Error(`Failed to get document from ${collectionName}`);
    }
  },

  // Get all documents in a collection
  getAllDocuments: async (collectionName, orderByField = 'createdAt', orderDirection = 'desc') => {
    try {
      const q = query(
        collection(db, collectionName),
        orderBy(orderByField, orderDirection)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || null,
        updatedAt: doc.data().updatedAt?.toDate?.() || null
      }));
    } catch (error) {
      console.error("Error getting documents:", error);
      throw new Error(`Failed to get documents from ${collectionName}`);
    }
  },

  // Create a new document with auto-generated ID
  createDocument: async (collectionName, data) => {
    try {
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, collectionName), docData);
      return {
        id: docRef.id,
        ...docData
      };
    } catch (error) {
      console.error("Error creating document:", error);
      throw new Error(`Failed to create document in ${collectionName}`);
    }
  },

  // Create a document with a specific ID
  setDocument: async (collectionName, docId, data) => {
    try {
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = doc(db, collectionName, docId);
      await setDoc(docRef, docData);
      return {
        id: docId,
        ...docData
      };
    } catch (error) {
      console.error("Error setting document:", error);
      throw new Error(`Failed to set document in ${collectionName}`);
    }
  },

  // Update a document
  updateDocument: async (collectionName, docId, data) => {
    try {
      const docRef = doc(db, collectionName, docId);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(docRef, updateData);
      return {
        id: docId,
        ...updateData
      };
    } catch (error) {
      console.error("Error updating document:", error);
      throw new Error(`Failed to update document in ${collectionName}`);
    }
  },

  // Delete a document
  deleteDocument: async (collectionName, docId) => {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      throw new Error(`Failed to delete document from ${collectionName}`);
    }
  },

  // Query documents with conditions
  queryDocuments: async (collectionName, conditions = [], orderByField = 'createdAt', orderDirection = 'desc', limitCount = null) => {
    try {
      let q = collection(db, collectionName);
      
      // Add where conditions
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
      
      // Add ordering
      q = query(q, orderBy(orderByField, orderDirection));
      
      // Add limit if specified
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || null,
        updatedAt: doc.data().updatedAt?.toDate?.() || null
      }));
    } catch (error) {
      console.error("Error querying documents:", error);
      throw new Error(`Failed to query documents from ${collectionName}`);
    }
  },

  // Paginated query
  queryDocumentsPaginated: async (collectionName, conditions = [], orderByField = 'createdAt', orderDirection = 'desc', limitCount = 10, lastDoc = null) => {
    try {
      let q = collection(db, collectionName);
      
      // Add where conditions
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
      
      // Add ordering
      q = query(q, orderBy(orderByField, orderDirection));
      
      // Add pagination
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      
      // Add limit
      q = query(q, limit(limitCount));
      
      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || null,
        updatedAt: doc.data().updatedAt?.toDate?.() || null
      }));
      
      return {
        documents,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
        hasMore: querySnapshot.docs.length === limitCount
      };
    } catch (error) {
      console.error("Error querying paginated documents:", error);
      throw new Error(`Failed to query paginated documents from ${collectionName}`);
    }
  },

  // Batch operations
  batchWrite: async (operations) => {
    try {
      const { writeBatch } = await import('firebase/firestore');
      const batch = writeBatch(db);
      
      operations.forEach(operation => {
        const { type, collectionName, docId, data } = operation;
        const docRef = doc(db, collectionName, docId);
        
        switch (type) {
          case 'set':
            batch.set(docRef, {
              ...data,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            break;
          case 'update':
            batch.update(docRef, {
              ...data,
              updatedAt: serverTimestamp()
            });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
          default:
            throw new Error(`Unknown batch operation type: ${type}`);
        }
      });
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error("Error performing batch write:", error);
      throw new Error("Failed to perform batch write operation");
    }
  }
};

// Legacy exports for backward compatibility
export const {
  getDocument,
  getAllDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  queryDocuments
} = DatabaseService;