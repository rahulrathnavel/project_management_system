'use client';

import AppLayout from '@/components/layout/app-layout';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function ProjectsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const { data, isLoading } = useQuery({
    queryKey: ['projects', page, search],
    queryFn: async () => {
      const res = await api.get('/projects', { params: { page, limit: 10, search } });
      return res.data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
            <p className="text-gray-500">Manage your projects here.</p>
          </div>
          <Link 
            href="/projects/new" 
            className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-gray-800"
          >
            Create Project
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex h-10 w-full max-w-sm rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">Loading projects...</TableCell>
                </TableRow>
              ) : data?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-gray-500">
                    {search ? 'No projects match your search.' : 'No projects yet. Create one to get started!'}
                  </TableCell>
                </TableRow>
              ) : (
                data?.data?.map((project: any) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      <Link href={`/projects/${project.id}`} className="hover:underline">
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(project.status)}>{project.status.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell>{project.startDate ? format(new Date(project.startDate), 'MMM d, yyyy') : '-'}</TableCell>
                    <TableCell>{project.endDate ? format(new Date(project.endDate), 'MMM d, yyyy') : '-'}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/projects/${project.id}/edit`} className="text-sm font-medium text-blue-600 hover:underline mr-4">
                        Edit
                      </Link>
                      <Link href={`/tasks?projectId=${project.id}`} className="text-sm font-medium text-gray-600 hover:underline">
                        Tasks
                      </Link>
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
            <div className="text-center p-8 bg-white border rounded-md">Loading projects...</div>
          ) : data?.data?.length === 0 ? (
            <div className="text-center p-8 bg-white border rounded-md text-gray-500">
              {search ? 'No projects match your search.' : 'No projects yet. Create one to get started!'}
            </div>
          ) : (
            data?.data?.map((project: any) => (
              <div key={project.id} className="bg-white border rounded-md p-4 space-y-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <Link href={`/projects/${project.id}`} className="font-medium text-lg hover:underline truncate mr-2">
                    {project.name}
                  </Link>
                  <Badge className={getStatusColor(project.status)}>{project.status.replace('_', ' ')}</Badge>
                </div>
                <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wider">Start Date</span>
                    {project.startDate ? format(new Date(project.startDate), 'MMM d, yyyy') : '-'}
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wider">End Date</span>
                    {project.endDate ? format(new Date(project.endDate), 'MMM d, yyyy') : '-'}
                  </div>
                </div>
                <div className="pt-3 border-t flex justify-end space-x-4">
                  <Link href={`/projects/${project.id}/edit`} className="text-sm font-medium text-blue-600 hover:underline">
                    Edit
                  </Link>
                  <Link href={`/tasks?projectId=${project.id}`} className="text-sm font-medium text-gray-600 hover:underline">
                    Tasks
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Simple Pagination */}
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
    </AppLayout>
  );
}

