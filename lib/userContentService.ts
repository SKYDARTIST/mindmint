import { db, auth } from './firebase/config';
import { doc, getDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';

export const userContentService = {
    async deleteNote(id: string) {
        const user = auth.currentUser;
        if (!user) throw new Error("Unauthorized");

        const docRef = doc(db, 'user_content', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data()?.user_id !== user.uid) {
            throw new Error("Not found or access denied");
        }

        await deleteDoc(docRef);
        return true;
    },

    async renameNote(id: string, newTitle: string) {
        const user = auth.currentUser;
        if (!user) throw new Error("Unauthorized");

        const docRef = doc(db, 'user_content', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data()?.user_id !== user.uid) {
            throw new Error("Not found or access denied");
        }

        await updateDoc(docRef, { title: newTitle });
        return true;
    },

    async deleteMultipleNotes(ids: string[]) {
        const user = auth.currentUser;
        if (!user) throw new Error("Unauthorized");

        // Verify ownership of all docs before deleting any
        for (const id of ids) {
            const docRef = doc(db, 'user_content', id);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists() || docSnap.data()?.user_id !== user.uid) {
                throw new Error(`Access denied for note ${id}`);
            }
        }

        const batch = writeBatch(db);
        ids.forEach(id => {
            const docRef = doc(db, 'user_content', id);
            batch.delete(docRef);
        });

        await batch.commit();
        return true;
    }
};
