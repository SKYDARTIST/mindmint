import { db, auth } from './firebase/config';
import { doc, updateDoc, deleteDoc, writeBatch, collection, query, where, getDocs } from 'firebase/firestore';

export const userContentService = {
    async deleteNote(id: string) {
        const user = auth.currentUser;
        if (!user) throw new Error("Unauthorized");

        const docRef = doc(db, 'user_content', id);
        await deleteDoc(docRef);
        return true;
    },

    async renameNote(id: string, newTitle: string) {
        const user = auth.currentUser;
        if (!user) throw new Error("Unauthorized");

        const docRef = doc(db, 'user_content', id);
        await updateDoc(docRef, { title: newTitle });
        return true;
    },

    async deleteMultipleNotes(ids: string[]) {
        const user = auth.currentUser;
        if (!user) throw new Error("Unauthorized");

        const batch = writeBatch(db);
        ids.forEach(id => {
            const docRef = doc(db, 'user_content', id);
            batch.delete(docRef);
        });

        await batch.commit();
        return true;
    }
};
