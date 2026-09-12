'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const [error, setError] = useState('');

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setError('');
      await login(values);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Sign in to your account</h1>
          <p className="text-sm text-gray-500 mt-2">Enter your email and password to access the dashboard</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
              {...form.register('password')}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="inline-flex w-full items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-gray-800 focus:outline-none disabled:opacity-50"
          >
            {isLoggingIn ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="text-center text-sm">
          Don't have an account?{' '}
          <Link href="/auth/register" className="font-medium underline underline-offset-4 hover:text-gray-900">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

