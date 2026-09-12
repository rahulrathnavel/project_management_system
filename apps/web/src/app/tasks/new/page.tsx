'use client';

import AppLayout from '@/components/layout/app-layout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Suspense } from 'react';
import { toast } from 'react-hot-toast';

const taskSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  dueDate: z.string().optional().or(z.literal('')),
});

function NewTaskContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get('projectId') || '';
  const queryClient = useQueryClient();

  const { data: projectsData } = useQuery({
    queryKey: ['projects', 'all'],
    queryFn: async () => {
      const res = await api.get('/projects', { params: { limit: 100 } });
      return res.data;
    },
  });

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: { 
      projectId: initialProjectId, 
      name: '', 
      description: '', 
      priority: 'MEDIUM', 
      status: 'PENDING', 
      dueDate: '' 
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof taskSchema>) => {
      const payload = { ...data };
      if (!payload.dueDate) delete payload.dueDate;
      const res = await api.post('/tasks', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      toast.success('Task created successfully');
      router.push('/tasks');
    },
  });

  const onSubmit = (values: z.infer<typeof taskSchema>) => {
    mutation.mutate(values);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Task</h1>
        <p className="text-gray-500">Fill in the details for your new task.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-2">
          <label className="text-sm font-medium">Project</label>
          <select
            className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-gray-400 focus:outline-none"
            {...form.register('projectId')}
          >
            <option value="">Select a project...</option>
            {projectsData?.data?.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {form.formState.errors.projectId && <p className="text-sm text-red-500">{form.formState.errors.projectId.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <input
            type="text"
            className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-gray-400 focus:outline-none"
            {...form.register('name')}
          />
          {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-gray-400 focus:outline-none"
            {...form.register('description')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-gray-400 focus:outline-none"
              {...form.register('status')}
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <select
              className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-gray-400 focus:outline-none"
              {...form.register('priority')}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Due Date</label>
          <input
            type="date"
            className="flex h-10 w-full md:w-1/2 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-gray-400 focus:outline-none"
            {...form.register('dueDate')}
          />
        </div>

        {mutation.error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
            {(mutation.error as any).response?.data?.message || 'Failed to create task'}
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewTaskPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <NewTaskContent />
      </Suspense>
    </AppLayout>
  );
}

