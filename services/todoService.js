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

export const TodoService = {
  // Create a new task
  createTask: async (taskData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      const task = {
        userId: user.uid,
        title: taskData.title,
        description: taskData.description || "",
        priority: taskData.priority || "medium",
        category: taskData.category || "Study",
        dueDate: taskData.dueDate || null,
        completed: false,
        completedAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'tasks'), task);
      return { id: docRef.id, ...task };
    } catch (error) {
      console.error("Error creating task:", error);
      throw new Error("Failed to create task");
    }
  },

  // Get user's tasks
  getTasks: async (userId, completed = null) => {
    try {
      let q = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      if (completed !== null) {
        q = query(q, where('completed', '==', completed));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
        completedAt: doc.data().completedAt?.toDate?.() || null
      }));
    } catch (error) {
      console.error("Error getting tasks:", error);
      throw new Error("Failed to get tasks");
    }
  },

  // Update a task
  updateTask: async (taskId, updates) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // If marking as completed, add completion timestamp
      if (updates.completed === true) {
        updateData.completedAt = serverTimestamp();
      } else if (updates.completed === false) {
        updateData.completedAt = null;
      }

      await updateDoc(doc(db, 'tasks', taskId), updateData);
      return { id: taskId, ...updates };
    } catch (error) {
      console.error("Error updating task:", error);
      throw new Error("Failed to update task");
    }
  },

  // Toggle task completion
  toggleTask: async (taskId, completed) => {
    try {
      return await this.updateTask(taskId, { completed });
    } catch (error) {
      console.error("Error toggling task:", error);
      throw new Error("Failed to toggle task");
    }
  },

  // Delete a task
  deleteTask: async (taskId) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
      throw new Error("Failed to delete task");
    }
  },

  // Get tasks by category
  getTasksByCategory: async (userId, category) => {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
      }));
    } catch (error) {
      console.error("Error getting tasks by category:", error);
      throw new Error("Failed to get tasks by category");
    }
  },

  // Get overdue tasks
  getOverdueTasks: async (userId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const tasks = await this.getTasks(userId, false); // Get incomplete tasks
      
      return tasks.filter(task => 
        task.dueDate && 
        task.dueDate < today
      );
    } catch (error) {
      console.error("Error getting overdue tasks:", error);
      throw new Error("Failed to get overdue tasks");
    }
  },

  // Get task statistics
  getTaskStats: async (userId) => {
    try {
      const allTasks = await this.getTasks(userId);
      const completedTasks = allTasks.filter(task => task.completed);
      const pendingTasks = allTasks.filter(task => !task.completed);
      const overdueTasks = await this.getOverdueTasks(userId);

      // Category breakdown
      const categoryBreakdown = {};
      allTasks.forEach(task => {
        if (!categoryBreakdown[task.category]) {
          categoryBreakdown[task.category] = { total: 0, completed: 0 };
        }
        categoryBreakdown[task.category].total++;
        if (task.completed) {
          categoryBreakdown[task.category].completed++;
        }
      });

      // Priority breakdown
      const priorityBreakdown = {};
      pendingTasks.forEach(task => {
        if (!priorityBreakdown[task.priority]) {
          priorityBreakdown[task.priority] = 0;
        }
        priorityBreakdown[task.priority]++;
      });

      return {
        total: allTasks.length,
        completed: completedTasks.length,
        pending: pendingTasks.length,
        overdue: overdueTasks.length,
        completionRate: allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0,
        categoryBreakdown,
        priorityBreakdown
      };
    } catch (error) {
      console.error("Error getting task stats:", error);
      throw new Error("Failed to get task stats");
    }
  }
};