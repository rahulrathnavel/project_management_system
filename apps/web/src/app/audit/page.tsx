'use client';

import AppLayout from '@/components/layout/app-layout';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuditLogsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(1);
  
  useEffect(() => {
    if (!isAuthLoading && user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, isAuthLoading, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page],
    queryFn: async () => {
      const res = await api.get('/audit', { params: { page, limit: 20 } });
      return res.data;
    },
    enabled: !!user && user.role === 'ADMIN',
  });

  const getActionColor = (action: string) => {
    if (action.includes('CREATED')) return 'bg-green-100 text-green-800';
    if (action.includes('UPDATED')) return 'bg-blue-100 text-blue-800';
    if (action.includes('DELETED')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (isAuthLoading) {
    return <AppLayout><div className="p-8">Loading...</div></AppLayout>;
  }

  if (user?.role !== 'ADMIN') {
    return null; // Next.js will redirect
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-gray-500">System-wide audit trail (Admin only).</p>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity Type</TableHead>
                <TableHead>Entity ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-gray-500">Loading audit logs...</TableCell>
                </TableRow>
              ) : data?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-gray-500">No audit logs found.</TableCell>
                </TableRow>
              ) : (
                data?.data?.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      {log.user ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{log.user.fullName}</span>
                          <span className="text-xs text-gray-500">{log.user.email}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">System / Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`hover:bg-opacity-80 ${getActionColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.entityName}</TableCell>
                    <TableCell className="font-mono text-xs text-gray-500">
                      {log.entityId || '-'}
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
            <div className="text-center p-8 bg-white border rounded-md text-gray-500">Loading logs...</div>
          ) : data?.data?.length === 0 ? (
            <div className="text-center p-8 bg-white border rounded-md text-gray-500">No audit logs found.</div>
          ) : (
            data?.data?.map((log: any) => (
              <div key={log.id} className="bg-white border rounded-md p-4 space-y-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <Badge className={getActionColor(log.action)}>
                    {log.action.replace(/_/g, ' ')}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {format(new Date(log.createdAt), 'MMM d, yy HH:mm')}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-900">
                    {log.user ? log.user.fullName : 'System'}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {log.user ? log.user.email : 'Unknown'}
                  </span>
                </div>
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <span className="font-medium">{log.entityName}</span>: {log.entityId || '-'}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Pagination */}
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

