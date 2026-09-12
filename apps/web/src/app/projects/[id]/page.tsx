'use client';

import AppLayout from '@/components/layout/app-layout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { ConfirmModal } from '@/components/ui/confirm-modal';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
    onError: () => {
      toast.error('Failed to delete project');
      setIsDeleteModalOpen(false);
    }
  });

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  if (isLoading) {
    return <AppLayout><div className="p-8">Loading...</div></AppLayout>;
  }

  if (!project) {
    return <AppLayout><div className="p-8 text-red-500">Project not found</div></AppLayout>;
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <Badge className={getStatusColor(project.status)}>
                {project.status.replace('_', ' ')}
              </Badge>
              <span>Created on {format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link
              href={`/tasks?projectId=${projectId}`}
              className="inline-flex items-center justify-center rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              View Tasks
            </Link>
            <Link
              href={`/projects/${projectId}/edit`}
              className="inline-flex items-center justify-center rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-blue-600 shadow-sm hover:bg-gray-50"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Project Details</h3>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {project.description || 'No description provided.'}
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {project.startDate ? format(new Date(project.startDate), 'MMM d, yyyy') : 'Not set'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">End Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {project.endDate ? format(new Date(project.endDate), 'MMM d, yyyy') : 'Not set'}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

