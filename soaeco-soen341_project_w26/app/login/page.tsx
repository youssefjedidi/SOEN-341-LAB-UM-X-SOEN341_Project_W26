'use client';

import { useState } from 'react';

export default function LoginPage() {

const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500";
const labelClass = "block text-base font-semibold text-gray-700 mb-2";


const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Logging in user:', { email, password });
    
    // Backend Logic would go here

};
return (
    
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 text-center">
                Login to Your Account
            </h1>

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
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-mt6"
                    type="submit"
                >
                    Login
                </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-4">
                Don't have an account?{' '}
                <a href="/register" className="text-emerald-500 hover:text-emerald-700 font-medium">
                    Register here
                </a>
            </p>
        </div>
    </div>
    );
}
