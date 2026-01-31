import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Search, Users, ChefHat, Truck } from 'lucide-react';
import AdminNavbar from '@/components/admin/AdminNavbar';

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('customers');

  // Fetch customers (profiles)
  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          panchayats(name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch cooks
  const { data: cooks, isLoading: cooksLoading } = useQuery({
    queryKey: ['admin-cooks-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cooks')
        .select(`
          *,
          panchayats(name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch delivery staff
  const { data: deliveryStaff, isLoading: deliveryLoading } = useQuery({
    queryKey: ['admin-delivery-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_staff')
        .select(`
          *,
          panchayats(name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const filteredCustomers = customers?.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.mobile_number.includes(searchTerm)
  );

  const filteredCooks = cooks?.filter(c =>
    c.kitchen_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.mobile_number.includes(searchTerm)
  );

  const filteredDelivery = deliveryStaff?.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.mobile_number.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <main className="p-4">
        <div className="mb-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="customers" className="gap-2">
              <Users className="h-4 w-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="cooks" className="gap-2">
              <ChefHat className="h-4 w-4" />
              Cooks
            </TabsTrigger>
            <TabsTrigger value="delivery" className="gap-2">
              <Truck className="h-4 w-4" />
              Delivery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Customers ({filteredCustomers?.length || 0})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customersLoading ? (
                  <p className="text-center py-4 text-muted-foreground">Loading...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Mobile</TableHead>
                          <TableHead>Panchayat</TableHead>
                          <TableHead>Ward</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomers?.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell>{customer.mobile_number}</TableCell>
                            <TableCell>{customer.panchayats?.name || '-'}</TableCell>
                            <TableCell>{customer.ward_number || '-'}</TableCell>
                            <TableCell>
                              <Badge variant={customer.is_active ? 'default' : 'secondary'}>
                                {customer.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredCustomers?.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                              No customers found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cooks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Food Partners ({filteredCooks?.length || 0})</span>
                  <Button size="sm" onClick={() => navigate('/admin/cooks')}>
                    Manage Cooks
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cooksLoading ? (
                  <p className="text-center py-4 text-muted-foreground">Loading...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kitchen Name</TableHead>
                          <TableHead>Mobile</TableHead>
                          <TableHead>Panchayat</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Orders</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCooks?.map((cook) => (
                          <TableRow key={cook.id}>
                            <TableCell className="font-medium">{cook.kitchen_name}</TableCell>
                            <TableCell>{cook.mobile_number}</TableCell>
                            <TableCell>{cook.panchayats?.name || '-'}</TableCell>
                            <TableCell>⭐ {cook.rating?.toFixed(1) || '0.0'}</TableCell>
                            <TableCell>{cook.total_orders || 0}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Badge variant={cook.is_active ? 'default' : 'secondary'}>
                                  {cook.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                                {cook.is_available && (
                                  <Badge variant="outline" className="text-green-600">
                                    Available
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredCooks?.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                              No cooks found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Delivery Staff ({filteredDelivery?.length || 0})</span>
                  <Button size="sm" onClick={() => navigate('/admin/delivery-staff')}>
                    Manage Staff
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deliveryLoading ? (
                  <p className="text-center py-4 text-muted-foreground">Loading...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Mobile</TableHead>
                          <TableHead>Panchayat</TableHead>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>Deliveries</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDelivery?.map((staff) => (
                          <TableRow key={staff.id}>
                            <TableCell className="font-medium">{staff.name}</TableCell>
                            <TableCell>{staff.mobile_number}</TableCell>
                            <TableCell>{staff.panchayats?.name || '-'}</TableCell>
                            <TableCell>{staff.vehicle_type}</TableCell>
                            <TableCell>{staff.total_deliveries || 0}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Badge variant={staff.is_approved ? 'default' : 'destructive'}>
                                  {staff.is_approved ? 'Approved' : 'Pending'}
                                </Badge>
                                {staff.is_available && (
                                  <Badge variant="outline" className="text-green-600">
                                    Available
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredDelivery?.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                              No delivery staff found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminUsers;
