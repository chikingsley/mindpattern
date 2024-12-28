import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { JINA_API_KEY, getEmbeddingConfig } from '@/config/api';
import { generateEmbedding } from './embeddings';

// Ensure user exists in the users table
async function ensureUser(supabase: SupabaseClient<Database>, userId: string): Promise<void> {
  // Try to insert the user
  const { error } = await supabase
    .from('users')
    .insert([{ id: userId }])
    .select()
    .single();

  // Ignore error if user already exists
  if (error && !error.message.includes('duplicate key')) {
    console.error('Error ensuring user exists:', error);
    throw error;
  }
}

export async function migrateLocalStorageToSupabase(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  try {
    // Ensure user exists before proceeding
    await ensureUser(supabase, userId);

    // Get all chat sessions from localStorage
    const sessionsJson = localStorage.getItem('chatSessions');
    if (!sessionsJson) {
      console.log('No chat sessions found in localStorage');
      return { success: true, migratedCount: 0 };
    }

    const sessions = JSON.parse(sessionsJson);
    if (!Array.isArray(sessions)) {
      console.warn('Invalid sessions format in localStorage');
      return { success: false, error: 'Invalid sessions format' };
    }

    console.log(`Found ${sessions.length} sessions to migrate`);

    // Migrate each session
    let migratedCount = 0;
    for (const session of sessions) {
      console.log(`Migrating session ${session.id}`);
      
      try {
        // Get first message content for embedding
        const firstMessage = session.messages?.[0]?.content;
        if (!firstMessage) {
          console.warn(`No messages found in session ${session.id}`);
          continue;
        }

        // Truncate message if too long (embedding API has limits)
        const maxLength = 500;
        const truncatedMessage = firstMessage.length > maxLength 
          ? firstMessage.substring(0, maxLength) + '...'
          : firstMessage;

        console.log(`Generating embedding for: ${truncatedMessage}`);
        
        // Generate embedding
        const embedding = await generateEmbedding(truncatedMessage);
        if (!embedding) {
          console.error(`Failed to generate embedding for session ${session.id}`);
          continue;
        }

        // Insert into database
        const { error: insertError } = await supabase
          .from('chat_sessions')
          .insert({
            id: session.id,
            user_id: userId,
            messages: session.messages,
            embedding: embedding,
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error(`Failed to insert session ${session.id}:`, insertError);
          throw insertError;
        }
        
        migratedCount++;
        console.log(`Successfully migrated session ${session.id}`);

      } catch (error: any) {
        console.error(`Failed to migrate session ${session.id}:`, error?.message || error?.details || error);
        // Continue with next session instead of stopping
        continue;
      }
    }

    return { success: true, migratedCount };

  } catch (error: any) {
    console.error('Migration failed:', error?.message || error?.details || error);
    throw new Error(`Migration failed: ${error?.message || error?.details || error}`);
  }
}
