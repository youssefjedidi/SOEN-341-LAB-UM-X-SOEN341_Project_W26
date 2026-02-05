import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

/**
 * Custom React Hook for Authentication
 * 
 * This hook checks if a user is currently logged in by:
 * 1. Checking Supabase's session storage (localStorage)
 * 2. Returning the user object if logged in, or null if not
 * 
 * Usage:
 *   const { user, loading } = useAuth();
 *   if (loading) return <div>Loading...</div>;
 *   if (!user) return <div>Please log in</div>;
 *   return <div>Welcome {user.email}</div>;
 */
export function useAuth() {
  // State to store the current user (null if not logged in)
  const [user, setUser] = useState<User | null>(null);
  
  // State to track if we're still checking authentication
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is logged in when component mounts
    checkUser();
    
    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    
    // Cleanup: unsubscribe when component unmounts
    return () => subscription.unsubscribe();
  }, []);
  
  // Function to check current user
  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }
  
  return { user, loading };
}