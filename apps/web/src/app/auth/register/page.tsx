'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import Link from 'next/link';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, 'Password must contain at least one letter and one number'),
});

export default function RegisterPage() {
  const { register, isRegistering } = useAuth();
  const [error, setError] = useState('');

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      setError('');
      await register(values);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="text-sm text-gray-500 mt-2">Enter your details below to create your account</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
              {...form.register('fullName')}
            />
            {form.formState.errors.fullName && (
              <p className="text-sm text-red-500">{form.formState.errors.fullName.message}</p>
            )}
          </div>

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
            disabled={isRegistering}
            className="inline-flex w-full items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-gray-800 focus:outline-none disabled:opacity-50"
          >
            {isRegistering ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="text-center text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium underline underline-offset-4 hover:text-gray-900">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

