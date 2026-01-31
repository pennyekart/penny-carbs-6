import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowLeft,
  CalendarHeart,
  ClipboardList,
  FileText,
  ChefHat,
  Truck,
  Car,
  Users,
  BarChart3,
  Settings,
  Percent
} from 'lucide-react';

const IndoorEventsModule: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const isAdmin = role === 'super_admin' || role === 'admin';

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['indoor-events-stats'],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, status, total_amount')
        .eq('service_type', 'indoor_events');

      if (error) throw error;

      const newRequests = orders?.filter(o => o.status === 'pending').length || 0;
      const confirmed = orders?.filter(o => o.status === 'confirmed').length || 0;
      const completed = orders?.filter(o => o.status === 'delivered').length || 0;
      const totalRevenue = orders?.filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

      return { newRequests, confirmed, completed, totalRevenue, total: orders?.length || 0 };
    },
    enabled: isAdmin
  });

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Settings className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">Access Denied</h2>
        <Button className="mt-6" onClick={() => navigate('/admin')}>
          Go Back
        </Button>
      </div>
    );
  }

  const menuItems = [
    { 
      icon: ClipboardList, 
      label: 'All Event Bookings', 
      path: '/admin/indoor-events/orders',
      description: 'View & manage all event orders',
      badge: stats?.total
    },
    { 
      icon: FileText, 
      label: 'Planning Requests', 
      path: '/admin/indoor-events/planning',
      description: 'New requests awaiting planning',
      badge: stats?.newRequests,
      badgeVariant: 'destructive' as const
    },
    { 
      icon: ChefHat, 
      label: 'Cook Assignment', 
      path: '/admin/indoor-events/cooks',
      description: 'Assign cooks by panchayat'
    },
    { 
      icon: Car, 
      label: 'Rental Vehicles', 
      path: '/admin/indoor-events/vehicles',
      description: 'Manage vehicle details for events'
    },
    { 
      icon: Percent, 
      label: 'Commission Tracking', 
      path: '/admin/indoor-events/commissions',
      description: 'Agent & referral commissions'
    },
    { 
      icon: BarChart3, 
      label: 'Event Reports', 
      path: '/admin/indoor-events/reports',
      description: 'Panchayat & ward-wise sales'
    },
  ];

  const statusFlow = [
    { label: 'New Request', color: 'bg-yellow-500' },
    { label: 'Planning Submitted', color: 'bg-blue-500' },
    { label: 'Admin Reviewed', color: 'bg-purple-500' },
    { label: 'Quotation Sent', color: 'bg-indigo-500' },
    { label: 'Advance Paid', color: 'bg-orange-500' },
    { label: 'Confirmed', color: 'bg-green-500' },
    { label: 'Completed', color: 'bg-emerald-600' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-indoor-events text-white">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')} className="text-white hover:bg-white/20">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <CalendarHeart className="h-6 w-6" />
            <h1 className="font-display text-lg font-semibold">Indoor Events</h1>
          </div>
        </div>
      </header>

      <main className="p-4 pb-20">
        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats?.newRequests || 0}</p>
              <p className="text-xs text-muted-foreground">New Requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats?.confirmed || 0}</p>
              <p className="text-xs text-muted-foreground">Confirmed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{stats?.completed || 0}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">₹{stats?.totalRevenue?.toLocaleString() || 0}</p>
              <p className="text-xs text-muted-foreground">Revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Event Status Flow */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Event Status Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {statusFlow.map((status, index) => (
                <div key={status.label} className="flex items-center gap-1">
                  <span className={`h-3 w-3 rounded-full ${status.color}`} />
                  <span className="text-xs">{status.label}</span>
                  {index < statusFlow.length - 1 && <span className="text-muted-foreground">→</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Menu Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => (
            <Card 
              key={item.path}
              className="cursor-pointer transition-all hover:shadow-md hover:border-indoor-events/50"
              onClick={() => navigate(item.path)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-xl bg-indoor-events/10 p-3 text-indoor-events">
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{item.label}</h4>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge variant={item.badgeVariant || 'secondary'} className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Important Note */}
        <Card className="mt-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>⚠️ Note:</strong> Indoor Events module does not support instant cart orders. 
              All bookings go through the planning and quotation process.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default IndoorEventsModule;
