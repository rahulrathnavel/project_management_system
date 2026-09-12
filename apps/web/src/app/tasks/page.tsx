'use client';

import AppLayout from '@/components/layout/app-layout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState, Suspense } from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ConfirmModal } from '@/components/ui/confirm-modal';

function TasksContent() {
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get('projectId') || '';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [projectId, setProjectId] = useState(initialProjectId);
  const [status, setStatus] = useState('');
  
  const queryClient = useQueryClient();

  // Fetch projects for the filter dropdown
  const { data: projectsData } = useQuery({
    queryKey: ['projects', 'all'],
    queryFn: async () => {
      const res = await api.get('/projects', { params: { limit: 100 } });
      return res.data;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', page, search, projectId, status],
    queryFn: async () => {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (projectId) params.projectId = projectId;
      if (status) params.status = status;

      const res = await api.get('/tasks', { params });
      return res.data;
    },
  });

  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      toast.success('Task deleted successfully');
      setTaskToDelete(null);
    },
    onError: () => {
      toast.error('Failed to delete task');
      setTaskToDelete(null);
    }
  });

  const confirmDelete = (id: string) => {
    setTaskToDelete(id);
  };

  const executeDelete = () => {
    if (taskToDelete) {
      deleteMutation.mutate(taskToDelete);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'LOW': return 'bg-green-100 text-green-800 hover:bg-green-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={!!taskToDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={executeDelete}
        onCancel={() => setTaskToDelete(null)}
        isLoading={deleteMutation.isPending}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-gray-500">Manage your tasks across projects.</p>
        </div>
        <Link 
          href={projectId ? `/tasks/new?projectId=${projectId}` : '/tasks/new'} 
          className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-gray-800"
        >
          Create Task
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex h-10 w-full sm:w-64 rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        
        <select
          value={projectId}
          onChange={(e) => { setProjectId(e.target.value); setPage(1); }}
          className="flex h-10 w-full sm:w-48 rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <option value="">All Projects</option>
          {projectsData?.data?.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="flex h-10 w-full sm:w-48 rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-gray-500">Loading tasks...</TableCell>
              </TableRow>
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-gray-500">
                  {(search || projectId || status) ? 'No tasks match your filters.' : 'No tasks yet. Create one to get started!'}
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((task: any) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">
                    <Link href={`/tasks/${task.id}/edit`} className="hover:underline">
                      {task.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(task.status)}>{task.status.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  </TableCell>
                  <TableCell>{task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '-'}</TableCell>
                  <TableCell className="text-right space-x-3">
                    <Link href={`/tasks/${task.id}/edit`} className="text-sm font-medium text-blue-600 hover:underline">
                      Edit
                    </Link>
                    <button 
                      onClick={() => confirmDelete(task.id)}
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="text-center p-8 bg-white border rounded-md text-gray-500">Loading tasks...</div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center p-8 bg-white border rounded-md text-gray-500">
            {(search || projectId || status) ? 'No tasks match your filters.' : 'No tasks yet. Create one to get started!'}
          </div>
        ) : (
          data?.data?.map((task: any) => (
            <div key={task.id} className="bg-white border rounded-md p-4 space-y-3 shadow-sm">
              <div className="flex justify-between items-start">
                <Link href={`/tasks/${task.id}/edit`} className="font-medium text-lg hover:underline truncate mr-2">
                  {task.name}
                </Link>
              </div>
              <div className="flex space-x-2">
                <Badge className={getStatusColor(task.status)}>{task.status.replace('_', ' ')}</Badge>
                <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
              </div>
              <div className="text-sm text-gray-600">
                <span className="block text-xs text-gray-400 uppercase tracking-wider">Due Date</span>
                {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '-'}
              </div>
              <div className="pt-3 border-t flex justify-end space-x-4">
                <Link href={`/tasks/${task.id}/edit`} className="text-sm font-medium text-blue-600 hover:underline">
                  Edit
                </Link>
                <button 
                  onClick={() => confirmDelete(task.id)}
                  className="text-sm font-medium text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {data.meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
            disabled={page === data.meta.totalPages}
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div>Loading tasks...</div>}>
        <TasksContent />
      </Suspense>
    </AppLayout>
  );
}

