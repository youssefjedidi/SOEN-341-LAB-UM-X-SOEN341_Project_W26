'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';
import { formStyles } from '@/lib/styles';

// Available options
const DIETARY_RESTRICTIONS = ['None', 'Halal', 'Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Nut Allergy'];
const DIETARY_PREFERENCES = ['None', 'Tomatoes', 'Pickles', 'Lettuce', 'Onions', 'Mushrooms', 'Peppers', 'Olives'];

export default function ProfileManagement() {
   const router = useRouter();
   const { user, loading: authLoading } = useAuth();

   // State for selected options
   const [restrictions, setRestrictions] = useState<string[]>([]);
   const [preferences, setPreferences] = useState<string[]>([]);

   // State for UI feedback
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [success, setSuccess] = useState('');

   // Redirect to login if not authenticated
   useEffect(() => {
      if (!authLoading && !user) {
         router.push('/login');
      }
   }, [user, authLoading, router]);

   // Load existing preferences when component mounts
   useEffect(() => {
      async function loadPreferences() {
         if (!user) return;

         const { data, error } = await supabase
            .from('user_profiles')
            .select('dietary_restrictions, dietary_preferences')
            .eq('user_id', user.id)
            .single();

         if (error) {
            // If error is "no rows returned", that's expected for new users
            if (error.code === 'PGRST116' || error.message?.includes('no rows')) {
               console.log('No existing profile found - user will create one on first save');
            } else {
               console.error('Failed to load preferences:', error);
            }
            return;
         }

         if (data) {
            setRestrictions(data.dietary_restrictions || []);
            setPreferences(data.dietary_preferences || []);
         }
      }

      loadPreferences();
   }, [user]);

   // Handle checkbox toggle with "None" exclusivity
   const handleToggle = (value: string, type: 'restriction' | 'preference') => {
      if (type === 'restriction') {
         if (value === 'None') {
            // If "None" is clicked, clear all other selections
            if (restrictions.includes('None')) {
               setRestrictions([]);
            } else {
               setRestrictions(['None']);
            }
         } else {
            // If any other option is clicked, remove "None" and toggle the option
            const withoutNone = restrictions.filter(item => item !== 'None');
            if (withoutNone.includes(value)) {
               setRestrictions(withoutNone.filter(item => item !== value));
            } else {
               setRestrictions([...withoutNone, value]);
            }
         }
      } else {
         if (value === 'None') {
            // If "None" is clicked, clear all other selections
            if (preferences.includes('None')) {
               setPreferences([]);
            } else {
               setPreferences(['None']);
            }
         } else {
            // If any other option is clicked, remove "None" and toggle the option
            const withoutNone = preferences.filter(item => item !== 'None');
            if (withoutNone.includes(value)) {
               setPreferences(withoutNone.filter(item => item !== value));
            } else {
               setPreferences([...withoutNone, value]);
            }
         }
      }
   };

   // Handle save button
   const handleSave = async () => {
      if (!user) return;

      // Validation: Ensure at least one selection in each category
      if (restrictions.length === 0) {
         setError('Please select at least one dietary restriction (or "None")');
         return;
      }
      if (preferences.length === 0) {
         setError('Please select at least one dietary preference (or "None")');
         return;
      }

      setLoading(true);
      setError('');
      setSuccess('');

      try {
         // Check if profile exists
         const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();

         if (existingProfile) {
            // Update existing profile
            const { error: updateError } = await supabase
               .from('user_profiles')
               .update({
                  dietary_restrictions: restrictions,
                  dietary_preferences: preferences,
                  updated_at: new Date().toISOString()
               })
               .eq('user_id', user.id);

            if (updateError) throw updateError;
         } else {
            // Insert new profile
            const { error: insertError } = await supabase
               .from('user_profiles')
               .insert({
                  user_id: user.id,
                  dietary_restrictions: restrictions,
                  dietary_preferences: preferences
               });

            if (insertError) throw insertError;
         }

         setSuccess('Profile updated successfully!');
         setTimeout(() => setSuccess(''), 3000);
      } catch (err: unknown) {
         const errorMessage = err instanceof Error ? err.message : 'Failed to save preferences';
         setError(errorMessage);
      } finally {
         setLoading(false);
      }
   };

   // Handle cancel button
   const handleCancel = () => {
      router.push('/');
   };

   // Show loading while checking authentication
   if (authLoading) {
      return (
         <div className="min-h-screen flex justify-center items-center">
            <p className="text-gray-600">Loading...</p>
         </div>
      );
   }

   // Don't render if not authenticated (will redirect)
   if (!user) {
      return null;
   }

   return (
      <div className="min-h-screen flex justify-center py-16 bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
         <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-3xl">
            <h1 className="text-4xl font-bold mb-6 text-gray-700 text-center">
               Profile Management
            </h1>

            {/* Success/Error Messages */}
            {success && (
               <div className={formStyles.successBox}>
                  {success}
               </div>
            )}
            {error && (
               <div className={formStyles.errorBox}>
                  {error}
               </div>
            )}

            {/* Grid Container */}
            <div className="grid grid-cols-2 gap-4 text-gray-700">
               {/* Dietary Restrictions */}
               <div className="flex flex-col">
                  <h2 className="text-xl font-bold">Dietary Restrictions</h2>
                  <h2 className="text-xs text-gray-400 mb-3">
                     (eg. allergies, religious restrictions, etc.)
                  </h2>

                  <div className="bg-white p-2 rounded-lg shadow-xl border-2 border-emerald-800 max-h-96 overflow-y-auto">
                     {DIETARY_RESTRICTIONS.map((item) => (
                        <label key={item} className="flex items-center gap-4 cursor-pointer hover:bg-emerald-50 p-2 rounded">
                           <input
                              type="checkbox"
                              className="h-4 w-4 accent-emerald-600 cursor-pointer"
                              checked={restrictions.includes(item)}
                              onChange={() => handleToggle(item, 'restriction')}
                           />
                           <span>{item}</span>
                        </label>
                     ))}
                  </div>
               </div>

               {/* Dietary Preferences */}
               <div className="flex flex-col">
                  <h2 className="text-xl font-bold">Dietary Preferences</h2>
                  <h2 className="text-xs text-gray-400 mb-3">
                     (What you don&apos;t like to eat)
                  </h2>

                  <div className="bg-white p-2 rounded-lg shadow-xl border-2 border-emerald-800 max-h-96 overflow-y-auto">
                     {DIETARY_PREFERENCES.map((item) => (
                        <label key={item} className="flex items-center gap-4 cursor-pointer hover:bg-emerald-50 p-2 rounded">
                           <input
                              type="checkbox"
                              className="h-4 w-4 accent-emerald-600 cursor-pointer"
                              checked={preferences.includes(item)}
                              onChange={() => handleToggle(item, 'preference')}
                           />
                           <span>{item}</span>
                        </label>
                     ))}
                  </div>
               </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end items-end w-full mt-4 gap-2">
               <button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSave}
                  disabled={loading}
               >
                  {loading ? 'Saving...' : 'Save'}
               </button>

               <button
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                  onClick={handleCancel}
                  disabled={loading}
               >
                  Cancel
               </button>
            </div>
         </div>
      </div>
   );
}