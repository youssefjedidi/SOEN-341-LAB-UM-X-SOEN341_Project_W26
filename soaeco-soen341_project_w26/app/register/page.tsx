'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { formStyles, layoutStyles } from '@/lib/styles';

export default function RegisterPage() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [loading, setLoading] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const passwordChecks = useMemo(() => ({
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#\$%\^&\*]/.test(password),
    }), [password]);

    const isPasswordValid = Object.values(passwordChecks).every(Boolean);
    const isEmailValid = emailRegex.test(email);
    const formValid = isEmailValid && username.trim().length > 0 && isPasswordValid && password === confirmPassword;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitError('');

        if (!isEmailValid) {
            setSubmitError('Please enter a valid email address.');
            return;
        }

        if (!isPasswordValid) {
            setSubmitError('Password does not meet the required criteria.');
            return;
        }

        if (password !== confirmPassword) {
            setSubmitError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username
                    }
                }
            });

            if (signUpError) {
                setSubmitError(signUpError.message);
                setLoading(false);
                return;
            }

            console.log('User Registered:', data.user);
            router.push('/profile_management');

        } catch (error) {
            console.error("Registration error:", error);
            setSubmitError('An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    }

    return (
        <div className={layoutStyles.pageContainer}>
            <div className={layoutStyles.formCard}>
                <h1 className={layoutStyles.pageTitle}>Create Your Account</h1>

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
                        {!isEmailValid && email.length > 0 && (
                            <p className="text-red-500 text-sm mt-1">Enter a valid email (e.g., user@example.com).</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className={formStyles.label} htmlFor="username">Username:</label>
                        <input
                            className={formStyles.input}
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
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
                        <div className="text-sm text-gray-700 mt-2">
                            <p className={passwordChecks.length ? 'text-emerald-600' : 'text-gray-500'}>- At least 8 characters</p>
                            <p className={passwordChecks.upper ? 'text-emerald-600' : 'text-gray-500'}>- One uppercase letter</p>
                            <p className={passwordChecks.lower ? 'text-emerald-600' : 'text-gray-500'}>- One lowercase letter</p>
                            <p className={passwordChecks.number ? 'text-emerald-600' : 'text-gray-500'}>- One number</p>
                            <p className={passwordChecks.special ? 'text-emerald-600' : 'text-gray-500'}>- One special character (!@#$%^&*)</p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className={formStyles.label} htmlFor="confirmPassword">Confirm Password:</label>
                        <input
                            className={formStyles.input}
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        {confirmPassword.length > 0 && password !== confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">Passwords do not match.</p>
                        )}
                    </div>

                    {submitError && <p className="text-red-500 text-sm mb-4">{submitError}</p>}

                    <button
                        className={formStyles.button}
                        type="submit"
                        disabled={loading || !formValid}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <p className={formStyles.helperText}>
                    Already have an account? <Link href="/login" className={formStyles.link}>Login here</Link>
                </p>
            </div>
        </div>
    );
}