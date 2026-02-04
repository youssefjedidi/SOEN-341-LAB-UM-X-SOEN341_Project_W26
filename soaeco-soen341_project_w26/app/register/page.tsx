'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {

    const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500";
    const labelClass = "block text-base font-semibold text-gray-700 mb-2";

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitError, setSubmitError] = useState('');

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

    function handleSubmit(e: React.FormEvent) {
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

        console.log('Registering user:', { email, username });
        // TODO: call backend API to create user
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">Registration</h1>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className={labelClass} htmlFor="email">Email:</label>
                        <input
                            className={inputClass}
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
                        <label className={labelClass} htmlFor="username">Username:</label>
                        <input
                            className={inputClass}
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className={labelClass} htmlFor="password">Password:</label>
                        <input
                            className={inputClass}
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
                        <label className={labelClass} htmlFor="confirmPassword">Confirm Password:</label>
                        <input
                            className={inputClass}
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
                        className={`w-full ${formValid ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-300 cursor-not-allowed'} text-white font-bold py-2 rounded-lg transition mt-6`}
                        type="submit"
                        disabled={!formValid}
                    >
                        Register
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-4">
                    Already have an account? <Link href="/login" className="text-emerald-500 hover:text-emerald-700 font-medium">Login here</Link>
                </p>
            </div>
        </div>
    );
}