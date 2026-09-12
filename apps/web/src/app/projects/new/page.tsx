'use client';

import AppLayout from '@/components/layout/app-layout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

const projectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']),
  startDate: z.string().optional().or(z.literal('')),
  endDate: z.string().optional().or(z.literal('')),
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: 'End date must be greater than or equal to start date',
  path: ['endDate'],
});

export default function NewProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: '', description: '', status: 'NOT_STARTED', startDate: '', endDate: '' },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof projectSchema>) => {
      const payload = { ...data };
      if (!payload.startDate) delete payload.startDate;
      if (!payload.endDate) delete payload.endDate;
      const res = await api.post('/projects', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      toast.success('Project created successfully');
      router.push('/projects');
    },
  });

  const onSubmit = (values: z.infer<typeof projectSchema>) => {
    mutation.mutate(values);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Project</h1>
          <p className="text-gray-500">Fill in the details for your new project.</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-gray-400 focus:outline-none"
              {...form.register('status')}
            >
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-gray-400 focus:outline-none"
                {...form.register('startDate')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-gray-400 focus:outline-none"
                {...form.register('endDate')}
              />
              {form.formState.errors.endDate && <p className="text-sm text-red-500">{form.formState.errors.endDate.message}</p>}
            </div>
          </div>

          {mutation.error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
              {(mutation.error as any).response?.data?.message || 'Failed to create project'}
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
              {mutation.isPending ? 'Saving...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

