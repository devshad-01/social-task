import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';

export const ForgotPasswordForm = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  console.log('[ForgotPasswordForm] Component rendered');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[ForgotPasswordForm] Form submitted:', email);
    
    setLoading(true);
    setError('');
    
    try {
      await new Promise((resolve, reject) => {
        Meteor.call('users.forgotPassword', { email }, (error, result) => {
          if (error) {
            console.error('[ForgotPasswordForm] Forgot password error:', error);
            reject(error);
          } else {
            console.log('[ForgotPasswordForm] Forgot password successful:', result);
            resolve(result);
          }
        });
      });
      setSuccess(true);
    } catch (err) {
      console.error('[ForgotPasswordForm] Forgot password failed:', err);
      setError(err.reason || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">Check your email</h2>
          <p className="text-neutral-600 mb-6">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-neutral-500 mb-6">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <button
            onClick={onBackToLogin}
            className="w-full bg-gradient-primary text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient">Posty</h1>
          <h2 className="text-xl font-semibold text-neutral-800 mt-2">Reset your password</h2>
          <p className="text-neutral-600 mt-1">Enter your email to receive a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              placeholder="Enter your email"
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-primary text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending reset link...
              </div>
            ) : (
              'Send reset link'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onBackToLogin}
            className="text-primary-600 hover:text-primary-700 font-medium"
            disabled={loading}
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
