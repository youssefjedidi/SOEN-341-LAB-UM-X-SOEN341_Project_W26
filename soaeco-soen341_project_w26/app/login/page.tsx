'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { formStyles, layoutStyles } from '@/lib/styles';

export default function LoginPage() {
    const router = useRouter();


const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
const [resetSent, setResetSent] = useState(false);

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
    router.push('/search_page');

    } catch (error) {
        //Handle unexpected errors
        console.error("Login error:", error);
        setError('An unexpected error occurred. Please try again.');
        setLoading(false);
    }
};

const handleForgotPassword = async () => {
    if (!email) {
        setError('Please enter your email address first');
        return;
    }

    setLoading(true);
    setError('');
    setResetSent(false);

    try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (resetError) {
            setError(resetError.message);
        } else {
            setResetSent(true);
        }
    } catch (error) {
        console.error('Password reset error:', error);
        setError('Failed to send reset email. Please try again.');
    } finally {
        setLoading(false);
    }
};
return (
    <div className={layoutStyles.pageContainer}>
        <div className={layoutStyles.formCard}>
            <h1 className={layoutStyles.pageTitle}>
                Login to Your Account
            </h1>

            {error && (
                <div className={formStyles.errorBox}>
                    {error}
                </div>
            )}

            {resetSent && (
                <div className={formStyles.successBox}>
                    Password reset email sent! Check your inbox.
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className={formStyles.label} htmlFor="email">Email:</label>
                    <input
                        className={formStyles.input}
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className={formStyles.label} htmlFor="password">Password:</label>
                    <input
                        className={formStyles.input}
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                
                <div className="flex justify-end mb-4">
                    <button
                        type="button"
                        onClick={handleForgotPassword}
                        className={formStyles.link + " text-sm font-normal"}
                        disabled={loading}
                    >
                        Forgot Password?
                    </button>
                </div>
                
                <button
                    className={formStyles.button}
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <p className={formStyles.helperText}>
                Don&apos;t have an account?{' '}
                <Link href="/register" className={formStyles.link}>
                    Register here
                </Link>
            </p>
        </div>
    </div>
    );
}
