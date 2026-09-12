'use client';

import AppLayout from '@/components/layout/app-layout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { use, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { ConfirmModal } from '@/components/ui/confirm-modal';

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

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}`);
      return res.data;
    },
  });

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: '', description: '', status: 'NOT_STARTED', startDate: '', endDate: '' },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description || '',
        status: project.status,
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        endDate: project.endDate ? project.endDate.split('T')[0] : '',
      });
    }
  }, [project, form]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof projectSchema>) => {
      const payload: any = { ...data };
      if (!payload.startDate) payload.startDate = null;
      if (!payload.endDate) payload.endDate = null;
      
      const res = await api.put(`/projects/${projectId}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      toast.success('Project updated successfully');
      router.push('/projects');
    },
  });

  const onSubmit = (values: z.infer<typeof projectSchema>) => {
    mutation.mutate(values);
  };

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      toast.success('Project deleted successfully');
      router.push('/projects');
    },
  });

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
  };

  if (isLoading) {
    return <AppLayout><div className="p-8">Loading...</div></AppLayout>;
  }

  return (
    <AppLayout>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Project"
        message="Are you sure you want to delete this project? ALL associated tasks will also be permanently deleted. This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isLoading={deleteMutation.isPending}
      />
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Project</h1>
          <p className="text-gray-500">Update the details for your project.</p>
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
              {(mutation.error as any).response?.data?.message || 'Failed to update project'}
            </div>
          )}
          
          {deleteMutation.error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
              {(deleteMutation.error as any).response?.data?.message || 'Failed to delete project'}
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t mt-6">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Project'}
            </button>
            <div className="flex space-x-2">
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
                {mutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

