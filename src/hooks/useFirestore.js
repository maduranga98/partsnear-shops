import { useState, useCallback } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Generic Firestore CRUD hook
 * Usage: const { documents, loading, error, getAll, getById, add, update, remove } = useFirestore('collectionName');
 */
const useFirestore = (collectionName) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const colRef = collection(db, collectionName);

  const getAll = useCallback(async (constraints = []) => {
    setLoading(true);
    setError(null);
    try {
      const q = query(colRef, ...constraints);
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDocuments(docs);
      return docs;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  const getById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const docSnap = await getDoc(doc(db, collectionName, id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  const add = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  const update = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      await updateDoc(doc(db, collectionName, id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  const remove = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  const subscribe = useCallback((constraints = [], callback) => {
    const q = query(colRef, ...constraints);
    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDocuments(docs);
      if (callback) callback(docs);
    }, (err) => {
      setError(err.message);
    });
  }, [collectionName]);

  return {
    documents,
    loading,
    error,
    getAll,
    getById,
    add,
    update,
    remove,
    subscribe,
  };
};

export default useFirestore;
