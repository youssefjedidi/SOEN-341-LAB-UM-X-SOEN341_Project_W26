'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {

const router = useRouter(); 
const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500";
const labelClass = "block text-base font-semibold text-gray-700 mb-2";


const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors and start loading
    setLoading(true);
    setError('');

    try {
    // Call Supabase to Login the User
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    // check if login failed
    if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
    }

    // Login successful!
    console.log('User Logged In:', data.user);

    // Redirect to home page
    router.push('/');

    } catch (error) {
        //Handle unexpected errors
        console.error("Login error:", error);
        setError('An unexpected error occurred. Please try again.');
        setLoading(false);
    }
};
return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 text-center">
                Login to Your Account
            </h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className={labelClass} htmlFor="email">Email:</label>
                    <input
                        className = {inputClass}
                        id = "email"
                        type = "email"
                        value = {email}
                        onChange = {(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className={labelClass} htmlFor="password">Password:</label>
                    <input
                        className = {inputClass}
                        id = "password"
                        type = "password"
                        value = {password}
                        onChange = {(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                
                
                <button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-mt6 disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-4">
                Don't have an account?{' '}
                <Link href="/register" className="text-emerald-500 hover:text-emerald-700 font-medium ">
                    Register here
                </Link>
            </p>
        </div>
    </div>
    );
}
