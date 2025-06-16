import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

// Collection references
const usersCollection = collection(db, "users");
const notificationsCollection = collection(db, "notifications");

// Get a document
async function getDocument(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting document:", error);
  }
}

// Get all documents in a collection
async function getAllDocuments(collectionName) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const documents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return documents;
  } catch (error) {
    console.error("Error getting documents:", error);
  }
}

// Create a new document
async function createDocument(collectionName, data) {
  try {
    const docRef = doc(collection(db, collectionName));
    await setDoc(docRef, data);
    return docRef.id;
  } catch (error) {
    console.error("Error creating document:", error);
  }
}

// Update a document
async function updateDocument(collectionName, docId, data) {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error("Error updating document:", error);
  }
}

// Delete a document
async function deleteDocument(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting document:", error);
  }
}

// Query documents
async function queryDocuments(collectionName, field, operator, value) {
  try {
    const q = query(
      collection(db, collectionName),
      where(field, operator, value)
    );
    const querySnapshot = await getDocs(q);
    const documents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return documents;
  } catch (error) {
    console.error("Error querying documents:", error);
  }
}

export {
  getDocument,
  getAllDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  queryDocuments,
};
