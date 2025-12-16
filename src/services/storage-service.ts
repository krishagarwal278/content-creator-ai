
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export interface ProjectFile {
    id: string;
    project_id: string;
    file_name: string;
    file_size: number;
    file_type: string;
    file_url: string;
    created_at: string;
}

export const storageService = {
    /**
     * Upload a file to project storage and record it in the database
     */
    async uploadFile(projectId: string, file: File): Promise<ProjectFile | null> {
        try {
            // 1. Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const filePath = `${projectId}/${uuidv4()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('project_files')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Error uploading file:', uploadError);
                throw uploadError;
            }

            // 2. Get public URL (or signed URL if private)
            const { data: { publicUrl } } = supabase.storage
                .from('project_files')
                .getPublicUrl(filePath);

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No authenticated user");

            // 3. Insert record into project_files table
            const { data: fileRecord, error: dbError } = await supabase
                .from('project_files')
                .insert({
                    project_id: projectId,
                    user_id: user.id,
                    file_name: file.name,
                    file_size: file.size,
                    file_type: file.type,
                    file_url: publicUrl,
                    processed: false
                })
                .select()
                .single();

            if (dbError) {
                console.error('Error recording file:', dbError);
                throw dbError;
            }

            return fileRecord as ProjectFile;

        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        }
    },

    /**
     * Get all files for a project
     */
    async getProjectFiles(projectId: string): Promise<ProjectFile[]> {
        const { data, error } = await supabase
            .from('project_files')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching project files:', error);
            throw error;
        }

        return data as ProjectFile[];
    },

    /**
     * Delete a file
     */
    async deleteFile(fileId: string): Promise<void> {
        // First get the file to find its path/url if we want to delete from storage too
        // For now, just deleting the record and we can assume a trigger or manual cleanup for storage
        const { error } = await supabase
            .from('project_files')
            .delete()
            .eq('id', fileId);

        if (error) {
            throw error;
        }
    }
};
