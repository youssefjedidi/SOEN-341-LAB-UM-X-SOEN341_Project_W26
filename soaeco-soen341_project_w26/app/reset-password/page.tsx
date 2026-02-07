'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { formStyles, layoutStyles } from '@/lib/styles';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Check if user came from reset email link
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setError('Invalid or expired reset link. Please request a new one.');
            }
        };
        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) {
                setError(updateError.message);
            } else {
                setSuccess(true);
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            }
        } catch (error) {
            console.error('Password reset error:', error);
            setError('Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={layoutStyles.pageContainer}>
                <div className={layoutStyles.formCard}>
                    <div className="text-center">
                        <div className={formStyles.successBox}>
                            <h2 className="text-2xl font-bold mb-2">✅ Password Reset Successful!</h2>
                            <p>Redirecting to login page...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={layoutStyles.pageContainer}>
            <div className={layoutStyles.formCard}>
                <h1 className={layoutStyles.pageTitle}>
                    Reset Your Password
                </h1>

                {error && (
                    <div className={formStyles.errorBox}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className={formStyles.label} htmlFor="password">
                            New Password:
                        </label>
                        <input
                            className={formStyles.input}
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="mb-4">
                        <label className={formStyles.label} htmlFor="confirmPassword">
                            Confirm New Password:
                        </label>
                        <input
                            className={formStyles.input}
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        className={formStyles.button}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-4">
                    Remember your password?{' '}
                    <button
                        onClick={() => router.push('/login')}
                        className="text-emerald-500 hover:text-emerald-700 font-medium underline"
                    >
                        Back to Login
                    </button>
                </p>
            </div>
        </div>
    );
}
