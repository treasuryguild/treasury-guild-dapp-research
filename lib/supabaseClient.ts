// lib/supabaseAuthClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const createSupabaseAuthClient = (authToken?: string): SupabaseClient => {
  const options = authToken
    ? {
        global: {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      }
    : undefined;

  return createClient(supabaseUrl, supabaseAnonKey, options);
};

// Create a non-authenticated client for public queries
export const supabasePublic = createSupabaseAuthClient();