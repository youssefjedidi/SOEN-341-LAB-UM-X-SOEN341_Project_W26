'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { supabase } from '@/lib/supabase';
import { layoutStyles, formStyles } from '@/lib/styles';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className={layoutStyles.pageContainer}>
        <div className={layoutStyles.formCard}>
          <p className="text-center text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, show welcome message and logout button
  if (user) {
    return (
      <div className={layoutStyles.pageContainer}>
        <div className={layoutStyles.formCard}>
          <h1 className={layoutStyles.pageTitle}>Welcome to MealMajor!</h1>
          
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Logged in as:</p>
              <p className="font-semibold text-gray-900">{user.email}</p>
              {user.user_metadata?.username && (
                <p className="text-sm text-gray-600 mt-1">
                  Username: {user.user_metadata.username}
                </p>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user is NOT logged in, show login/register options
  return (
    <div className={layoutStyles.pageContainer}>
      <div className={layoutStyles.formCard}>
        <h1 className={layoutStyles.pageTitle}>Welcome to MealMajor</h1>
        
        <p className="text-center text-gray-600 mb-6">
          Please log in or create an account to continue
        </p>

        <div className="space-y-3">
          <div className="mb-2"><Link href="/login">
            <button className={formStyles.button}>
              Login
            </button>
          </Link>
          </div>
          <Link href="/register">
            <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 rounded-lg transition">
              Create Account
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
