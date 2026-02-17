import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!

// Create a supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create a supabase admin client
export const supabaseAdmin = typeof window === 'undefined' && process.env.SUPABASE_SECRET_KEY ? createClient(supabaseUrl, supabaseSecretKey) : ( null as any);

