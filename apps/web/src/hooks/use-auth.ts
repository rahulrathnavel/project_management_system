import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data as User;
    },
    retry: false, // Don't retry on 401
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const res = await api.post('/auth/login', credentials);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], data.user);
      toast.success('Signed in successfully');
      router.push('/dashboard');
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/auth/register', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Account created successfully');
      router.push('/auth/login?registered=true');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['me'], null);
      queryClient.clear();
      toast.success('Signed out successfully');
      router.push('/auth/login');
    },
  });

  return {
    user,
    isLoading,
    error,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
};

