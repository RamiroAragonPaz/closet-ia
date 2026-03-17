import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── GUARDARROPA ────────────────────────────────────────────────────────────

export async function getGarments(userId) {
  const q = query(
    collection(db, 'users', userId, 'garments'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addGarment(userId, garment) {
  const docRef = await addDoc(collection(db, 'users', userId, 'garments'), {
    ...garment,
    status: 'available',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateGarmentStatus(userId, garmentId, status) {
  const ref = doc(db, 'users', userId, 'garments', garmentId);
  await updateDoc(ref, { status });
}

export async function deleteGarment(userId, garmentId) {
  const ref = doc(db, 'users', userId, 'garments', garmentId);
  await deleteDoc(ref);
}

// ─── HISTORIAL DE OUTFITS ───────────────────────────────────────────────────

export async function getOutfitHistory(userId) {
  const q = query(
    collection(db, 'users', userId, 'outfitHistory'),
    orderBy('wornAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveOutfit(userId, outfit) {
  // outfit = { pieces: [{id, name, color, type}], reasoning: string }
  await addDoc(collection(db, 'users', userId, 'outfitHistory'), {
    ...outfit,
    wornAt: serverTimestamp(),
  });
  // Marcar prendas como "a lavar"
  for (const piece of outfit.pieces) {
    await updateGarmentStatus(userId, piece.id, 'dirty');
  }
}
