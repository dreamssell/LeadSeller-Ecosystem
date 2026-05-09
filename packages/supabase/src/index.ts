import { createClient } from '@supabase/supabase-js';

// Factory function to create a typed Supabase client
export const createLeadSellerSupabaseClient = (supabaseUrl: string, supabaseKey: string) => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Key are required to initialize the client.');
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false, // For backend API, we usually don't persist sessions like a browser
    }
  });
};

export type LeadSellerSupabaseClient = ReturnType<typeof createLeadSellerSupabaseClient>;
