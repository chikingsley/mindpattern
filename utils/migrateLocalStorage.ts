import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { generateEmbedding } from './embeddings';

// Ensure user exists in the users table
async function ensureUser(supabase: SupabaseClient<Database>, userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .insert([{ id: userId }])
    .select()
    .single();

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
    await ensureUser(supabase, userId);

    const sessionsJson = localStorage.getItem('chatSessions');
    if (!sessionsJson) {
      console.log('No chat sessions found in localStorage');
      return { success: true, migratedCount: 0 };
    }

    // Debug: Log the raw sessions data
    console.log('Raw sessions JSON:', sessionsJson);
    
    const sessions = JSON.parse(sessionsJson);
    if (!Array.isArray(sessions)) {
      console.warn('Invalid sessions format in localStorage');
      return { success: false, error: 'Invalid sessions format' };
    }

    // Debug: Log parsed sessions structure
    console.log('Parsed sessions:', sessions.map(s => ({
      id: s.id,
      messageCount: s.messages?.length || 0
    })));

    console.log(`Found ${sessions.length} sessions to migrate`);

    let migratedCount = 0;
    for (const session of sessions) {
      // Debug: Log current session structure
      console.log('Processing session:', {
        id: session.id,
        hasMessages: Boolean(session.messages),
        messageCount: session.messages?.length || 0
      });
      
      try {
        if (!session.messages?.length) {
          console.warn(`No messages found in session ${session.id}`);
          continue;
        }

        // Insert all messages for this session
        for (const msg of session.messages) {
          // Debug: Log message structure
          console.log('Processing message:', {
            sessionId: session.id,
            role: msg.role,
            contentLength: msg.content?.length || 0,
            hasContent: Boolean(msg.content)
          });

          if (!msg.content) {
            console.warn(`Skipping message with no content in session ${session.id}`);
            continue;
          }

          // Generate embedding for all messages (both user and assistant)
          // since assistant messages contain valuable insights and context
          const maxLength = 500;
          const truncatedMessage = msg.content.length > maxLength 
            ? msg.content.substring(0, maxLength) + '...'
            : msg.content;

          console.log(`Generating embedding for ${msg.role} message: ${truncatedMessage.substring(0, 50)}...`);
          const embedding = await generateEmbedding(truncatedMessage);

          // Debug: Log insertion attempt
          console.log('Attempting to insert message:', {
            sessionId: session.id,
            role: msg.role,
            hasEmbedding: Boolean(embedding)
          });

          const { error: insertError } = await supabase
            .from('messages')
            .insert({
              user_id: userId,
              session_id: session.id,
              content: msg.content,
              role: msg.role,
              embedding: embedding,
              metadata: msg.metadata || {}
            });

          if (insertError) {
            // Log detailed error information
            const errorDetails = {
              code: insertError.code,
              message: insertError.message,
              details: insertError.details,
              hint: insertError.hint,
              query: insertError?.query
            };
            console.error(`Failed to insert message in session ${session.id}:`, errorDetails);
            throw insertError;
          }
        }
        
        migratedCount++;
        console.log(`Successfully migrated session ${session.id}`);

      } catch (error: any) {
        // Log detailed error information
        const errorDetails = {
          name: error?.name,
          code: error?.code,
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          query: error?.query
        };
        console.error(`Failed to migrate session ${session.id}:`, errorDetails);
        continue;
      }
    }

    return { success: true, migratedCount };

  } catch (error: any) {
    // Log detailed error information
    const errorDetails = {
      name: error?.name,
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      query: error?.query
    };
    console.error('Migration failed:', errorDetails);
    return { success: false, error: error?.message || 'Unknown error' };
  }
}
