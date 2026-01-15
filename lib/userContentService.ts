import { createClient } from './supabase/client';

export const userContentService = {
    async deleteNote(id: string) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { error } = await supabase
            .from('user_content')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;
        return true;
    },

    async renameNote(id: string, newTitle: string) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { error } = await supabase
            .from('user_content')
            .update({ title: newTitle })
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;
        return true;
    },

    async deleteMultipleNotes(ids: string[]) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { error } = await supabase
            .from('user_content')
            .delete()
            .in('id', ids)
            .eq('user_id', user.id);

        if (error) throw error;
        return true;
    }
};
