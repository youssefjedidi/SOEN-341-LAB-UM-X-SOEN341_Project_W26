'use client';
import { useState } from 'react';
import Link from 'next/link';

// Registration Page MealMajor
// Basic profile info (email, username, password)
export default function RegisterPage() {

    //Tailwind CSS design classes
    const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500";
    const labelClass = "block text-base font-semibold text-gray-700 mb-2";

    //Form state
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    //Submission handler
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setError('');

        console.log('Registering user:', { email, username, password });
        //Backend logic to be implemented
    };

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
                            onChange={(e) => {
                                setPassword(e.target.value)
                                setError('');
                            }}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className={labelClass} htmlFor="confirmPassword">Confirm Password:</label>
                        <input
                            className={inputClass}
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value)
                                setError('');
                            }}
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                    <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg transition mt-6" type="submit">Register</button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-4">
                    Already have an account? <Link href="/login" className="text-emerald-500 hover:text-emerald-700 font-medium">Login here</Link>
                </p>

            </div>
        </div>
    );
}