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

const taskSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  dueDate: z.string().optional().or(z.literal('')),
});

export default function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const resolvedParams = use(params);
  const taskId = resolvedParams.id;

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const res = await api.get(`/tasks/${taskId}`);
      return res.data;
    },
  });

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: { 
      name: '', 
      description: '', 
      priority: 'MEDIUM', 
      status: 'PENDING', 
      dueDate: '' 
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        name: task.name,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      });
    }
  }, [task, form]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof taskSchema>) => {
      const payload: any = { ...data };
      if (!payload.dueDate) payload.dueDate = null;
      
      const res = await api.put(`/tasks/${taskId}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      toast.success('Task updated successfully');
      router.push('/tasks');
    },
  });

  const onSubmit = (values: z.infer<typeof taskSchema>) => {
    mutation.mutate(values);
  };

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      toast.success('Task deleted successfully');
      router.push('/tasks');
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
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isLoading={deleteMutation.isPending}
      />
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Task</h1>
          <p className="text-gray-500">Update the details for your task.</p>
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
              {(mutation.error as any).response?.data?.message || 'Failed to update task'}
            </div>
          )}

          {deleteMutation.error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
              {(deleteMutation.error as any).response?.data?.message || 'Failed to delete task'}
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t mt-6">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Task'}
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

