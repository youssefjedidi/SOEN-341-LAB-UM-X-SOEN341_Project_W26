'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { formStyles, layoutStyles } from '@/lib/styles';

// Registration Page MealMajor
// Basic profile info (email, username, password)
export default function RegisterPage() {
    const router = useRouter();

    //Form state
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false)

    //Submission handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Clear previous errors and start loading
        setError('');
        setLoading(true);

        try {
            // Call Supabase to Register the User
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username : username
                    }
                }
            })

            // check if registration failed
            if (signUpError) {
                setError(signUpError.message);
                setLoading(false);
                return;
            }

            // Registration successful!
            console.log('User Registered:', data.user);

            // Redirect to login page 
            router.push('/login');

        } catch (error) {
            //Handle unexpected errors
            console.error("Regitration error:", error);
            setError('An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    };

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
                            onChange={(e) => {
                                setPassword(e.target.value)
                                setError('');
                            }}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className={formStyles.label} htmlFor="confirmPassword">Confirm Password:</label>
                        <input
                            className={formStyles.input}
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

                    <button className={formStyles.button} type="submit" disabled={loading}>
                        {loading? 'Registering...' :'Register'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-4">
                    Already have an account? <Link href="/login" className="text-emerald-500 hover:text-emerald-700 font-medium">Login here</Link>
                </p>

            </div>
        </div>
    );
}