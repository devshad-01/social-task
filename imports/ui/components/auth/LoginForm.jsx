import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';

export const LoginForm = ({ onSwitchToSignUp, onSwitchToForgotPassword }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  console.log('[LoginForm] Component rendered');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[LoginForm] Form submitted:', formData.email);
    
    setLoading(true);
    setErrors({});
    
    try {
      await new Promise((resolve, reject) => {
        Meteor.loginWithPassword(formData.email, formData.password, (error) => {
          if (error) {
            console.error('[LoginForm] Login error:', error);
            reject(error);
          } else {
            console.log('[LoginForm] Login successful:', formData.email);
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('[LoginForm] Login failed:', error);
      setErrors({ submit: error.reason || error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient">Posty</h1>
          <h2 className="text-xl font-semibold text-neutral-800 mt-2">Welcome back</h2>
          <p className="text-neutral-600 mt-1">Sign in to your account to continue</p>
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
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              placeholder="Enter your email"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              placeholder="Enter your password"
              disabled={loading}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                disabled={loading}
              />
              <span className="ml-2 text-sm text-neutral-600">Remember me</span>
            </label>
            
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              disabled={loading}
            >
              Forgot password?
            </button>
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
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
                Signing in...
              </div>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-neutral-600">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignUp}
              className="text-primary-600 hover:text-primary-700 font-medium"
              disabled={loading}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
