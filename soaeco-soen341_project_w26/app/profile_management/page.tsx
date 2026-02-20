'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';
import { formStyles } from '@/lib/styles';

// Available options
const INITIAL_DIETARY_RESTRICTIONS = ['None', 'Halal', 'Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Nut Allergy', 'Shellfish Allergy', 'Kosher'];
const INITIAL_DIETARY_PREFERENCES = ['None', 'Tomatoes', 'Pickles', 'Lettuce', 'Onions', 'Mushrooms', 'Peppers', 'Olives', 'Avocado', 'Spinach'];

export default function ProfileManagement() {
   const router = useRouter();
   const { user, loading: authLoading } = useAuth();

   // State for selected options
   const [restrictions, setRestrictions] = useState<string[]>([]);
   const [preferences, setPreferences] = useState<string[]>([]);

   // State for dynamic options
   const [restrictionOptions, setRestrictionOptions] = useState<string[]>(INITIAL_DIETARY_RESTRICTIONS);
   const [preferenceOptions, setPreferenceOptions] = useState<string[]>(INITIAL_DIETARY_PREFERENCES);

   // State for text inputs
   const [newRestriction, setNewRestriction] = useState('');
   const [newPreference, setNewPreference] = useState('');

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
            .select('dietary_restrictions, dietary_preferences, custom_restrictions, custom_preferences')
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
         const savedRestrictions = data.dietary_restrictions || [];
         const savedPreferences = data.dietary_preferences || [];

         const customRestrictions = data.custom_restrictions || [];
         const customPreferences = data.custom_preferences || [];

         setRestrictions(savedRestrictions);
         setPreferences(savedPreferences);

         setRestrictionOptions([...INITIAL_DIETARY_RESTRICTIONS, ...customRestrictions]);
         setPreferenceOptions([...INITIAL_DIETARY_PREFERENCES, ...customPreferences]);
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
   const addRestriction = async () => {
      if (!user) return;

   const value = newRestriction.trim();
      if (!value) return;

      if (value.toLowerCase() === 'none') return;
      if (restrictionOptions.some(opt => opt.toLowerCase() === value.toLowerCase())) return;

   // Build the next custom list (exclude the initial defaults)
   const currentCustom = restrictionOptions.filter(x => !INITIAL_DIETARY_RESTRICTIONS.includes(x));
   const nextCustom = [...currentCustom, value];

   // Update UI immediately
   setRestrictionOptions(prev => [...prev, value]);
   setRestrictions(prev => {
    const withoutNone = prev.filter(x => x !== 'None');
    return [...withoutNone, value];
   });
   setNewRestriction('');

   // Persist custom options
   const { error } = await supabase
    .from('user_profiles')
    .upsert(
      { user_id: user.id, custom_restrictions: nextCustom },
      { onConflict: 'user_id' }
    );

   if (error) setError(error.message);
   };

   const addPreference = async () => {
   if (!user) return;

   const value = newPreference.trim();
   if (!value) return;

   if (value.toLowerCase() === 'none') return;
   if (preferenceOptions.some(opt => opt.toLowerCase() === value.toLowerCase())) return;

   const currentCustom = preferenceOptions.filter(x => !INITIAL_DIETARY_PREFERENCES.includes(x));
   const nextCustom = [...currentCustom, value];

   setPreferenceOptions(prev => [...prev, value]);
   setPreferences(prev => {
   const withoutNone = prev.filter(x => x !== 'None');
   return [...withoutNone, value];
   });
   setNewPreference('');

   const { error } = await supabase
    .from('user_profiles')
    .upsert(
      { user_id: user.id, custom_preferences: nextCustom },
      { onConflict: 'user_id' }
   );

   if (error) setError(error.message);
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
         router.push('/search_page');
      } catch (err: unknown) {
         const errorMessage = err instanceof Error ? err.message : 'Failed to save preferences';
         setError(errorMessage);
      } finally {
         setLoading(false);
      }
   };

   // Handle cancel button
   const handleCancel = () => {
      router.push('/search_page');
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
            <div className="h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100">         <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-3xl">
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
                  <div className="bg-white p-2 rounded-lg shadow-xl border-2 border-emerald-800 max-h-90 overflow-y-auto mb-3">
                     {restrictionOptions.map((item) => (
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
                  <div className="flex gap-2 mb-3">
                  <input
                  type="text"
                  value={newRestriction}
                  onChange={(e) => setNewRestriction(e.target.value)}
                  placeholder="Add restriction..."
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"                  disabled={loading}
                  />
               <button type="button" onClick={addRestriction} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-lg transition disabled:opacity-50" disabled={loading}>
               Add Restriction
               </button>
               </div>
               </div>

               {/* Dietary Preferences */}
               <div className="flex flex-col">
                  <h2 className="text-xl font-bold">Dietary Preferences</h2>
                  <h2 className="text-xs text-gray-400 mb-3">
                     (What you don&apos;t like to eat)
                  </h2>
                  <div className="bg-white p-2 rounded-lg shadow-xl border-2 border-emerald-800 max-h-90 overflow-y-auto mb-3">
                     {preferenceOptions.map((item) => (
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
                  <div className="flex gap-2 mb-3">
                  <input
                  type="text"
                  value={newPreference}
                  onChange={(e) => setNewPreference(e.target.value)}
                  placeholder="Add preference..."
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={loading}
                  />
                  <button
                  type="button"
                  onClick={addPreference}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-lg transition disabled:opacity-50"
                  disabled={loading}
                  >   
                  Add Preference
                  </button>
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