import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Users, Crown, Calendar, DollarSign, Settings, RefreshCw, Trash2, Eye } from "lucide-react";
import { Link, useLocation } from "wouter";
import { LogoutButton } from "@/components/logout-button";

interface RevenueCatSubscriber {
  request_date: string;
  request_date_ms: number;
  subscriber: {
    first_seen: string;
    last_seen: string;
    management_url: string;
    non_subscriptions: Record<string, any>;
    original_app_user_id: string;
    original_application_version: string;
    original_purchase_date: string;
    other_purchases: Record<string, any>;
    subscriptions: Record<string, {
      auto_resume_date: string | null;
      billing_issues_detected_at: string | null;
      expires_date: string;
      grace_period_expires_date: string | null;
      is_sandbox: boolean;
      original_purchase_date: string;
      period_type: string;
      purchase_date: string;
      refunded_at: string | null;
      store: string;
      unsubscribe_detected_at: string | null;
    }>;
    entitlements: Record<string, {
      expires_date: string;
      grace_period_expires_date: string | null;
      product_identifier: string;
      purchase_date: string;
    }>;
  };
}

interface UserAttribute {
  value: string;
  updated_at_ms: number;
}

export default function RevenueCatUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<RevenueCatSubscriber | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const pageSize = 20;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();

  // Check if API key is configured
  useEffect(() => {
    const storedApiKey = localStorage.getItem("revenuecat_api_key");
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setIsConfigured(true);
    }
  }, []);

  // Save API key
  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      localStorage.setItem("revenuecat_api_key", apiKey.trim());
      setIsConfigured(true);
      toast({
        title: "API Key Saved",
        description: "RevenueCat API key has been configured successfully",
      });
    }
  };

  // Fetch all subscribers (this would need to be implemented with proper pagination)
  const { data: subscribers = [], isLoading, error, refetch } = useQuery({
    queryKey: ["/api/revenuecat/subscribers"],
    queryFn: async () => {
      if (!apiKey) return [];
      
      // Note: RevenueCat doesn't have a direct "list all subscribers" endpoint
      // This would typically require you to maintain a list of user IDs
      // For demonstration, we'll show how to fetch a specific user
      const response = await fetch('/api/revenuecat/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscribers');
      }
      
      return response.json();
    },
    enabled: isConfigured,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Get subscriber details
  const getSubscriberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/revenuecat/subscriber/${encodeURIComponent(userId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscriber details');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setSelectedUser(data);
      setIsUserModalOpen(true);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to fetch user details: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete subscriber
  const deleteSubscriberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/revenuecat/subscriber/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete subscriber');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscriber deleted successfully",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete subscriber: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filter subscribers
  const filteredSubscribers = subscribers.filter((subscriber: RevenueCatSubscriber) => {
    const matchesSearch = 
      subscriber.subscriber.original_app_user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.keys(subscriber.subscriber.subscriptions).some(key => 
        key.toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (statusFilter === "all") return matchesSearch;
    
    const hasActiveSubscription = Object.values(subscriber.subscriber.subscriptions).some(
      (sub: any) => new Date(sub.expires_date) > new Date()
    );
    
    if (statusFilter === "active") return matchesSearch && hasActiveSubscription;
    if (statusFilter === "expired") return matchesSearch && !hasActiveSubscription;
    
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSubscribers.length / pageSize);
  const paginatedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getSubscriptionStatus = (subscriptions: Record<string, any>) => {
    const hasActive = Object.values(subscriptions).some(
      (sub: any) => new Date(sub.expires_date) > new Date()
    );
    return hasActive ? "active" : "expired";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getSubscriptionCount = (subscriptions: Record<string, any>) => {
    return Object.keys(subscriptions).length;
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Users className="text-primary text-2xl" />
                <h1 className="text-xl font-medium text-gray-900">RevenueCat Users</h1>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Configure RevenueCat API</CardTitle>
              <CardDescription>
                Enter your RevenueCat secret API key to access subscriber data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="password"
                placeholder="sk_xxx..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <Button onClick={handleApiKeySubmit} className="w-full">
                Save API Key
              </Button>
              <p className="text-sm text-muted-foreground">
                Your API key will be stored securely in your browser and used to fetch subscriber data.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Users className="text-primary text-2xl" />
              <h1 className="text-xl font-medium text-gray-900">RevenueCat Users</h1>
              <nav className="flex items-center space-x-1 ml-8">
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    Foods
                  </Button>
                </Link>
                <Link href="/meals">
                  <Button variant="ghost" size="sm">
                    Meals
                  </Button>
                </Link>
                <Link href="/workout-plans">
                  <Button variant="ghost" size="sm">
                    Workouts
                  </Button>
                </Link>
                <Link href="/revenuecat-users">
                  <Button variant="ghost" size="sm" className="text-blue-600 bg-blue-50">
                    <Crown className="h-4 w-4 mr-1" />
                    Users
                  </Button>
                </Link>
              </nav>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscribers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscribers.filter((s: RevenueCatSubscriber) => 
                  getSubscriptionStatus(s.subscriber.subscriptions) === "active"
                ).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscribers.filter((s: RevenueCatSubscriber) => 
                  getSubscriptionStatus(s.subscriber.subscriptions) === "expired"
                ).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue This Month</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$-</div>
              <p className="text-xs text-muted-foreground">
                Requires transaction API
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active Subscriptions</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Subscribers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Subscribers</CardTitle>
            <CardDescription>
              Manage your RevenueCat subscribers and their subscription status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-center py-8 text-red-600">
                Error loading subscribers: {error.message}
              </div>
            )}
            
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                Loading subscribers...
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Subscriptions</TableHead>
                      <TableHead>First Seen</TableHead>
                      <TableHead>Last Seen</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSubscribers.map((subscriber: RevenueCatSubscriber) => (
                      <TableRow key={subscriber.subscriber.original_app_user_id}>
                        <TableCell className="font-medium">
                          {subscriber.subscriber.original_app_user_id}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={getSubscriptionStatus(subscriber.subscriber.subscriptions) === "active" ? "default" : "secondary"}
                          >
                            {getSubscriptionStatus(subscriber.subscriber.subscriptions)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getSubscriptionCount(subscriber.subscriber.subscriptions)} active
                        </TableCell>
                        <TableCell>{formatDate(subscriber.subscriber.first_seen)}</TableCell>
                        <TableCell>{formatDate(subscriber.subscriber.last_seen)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => getSubscriberMutation.mutate(subscriber.subscriber.original_app_user_id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteSubscriberMutation.mutate(subscriber.subscriber.original_app_user_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredSubscribers.length)} of {filteredSubscribers.length} subscribers
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Details Modal */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subscriber Details</DialogTitle>
            <DialogDescription>
              Detailed information for {selectedUser?.subscriber.original_app_user_id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">User ID</label>
                      <p className="text-sm text-muted-foreground">{selectedUser.subscriber.original_app_user_id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">First Seen</label>
                      <p className="text-sm text-muted-foreground">{formatDate(selectedUser.subscriber.first_seen)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Last Seen</label>
                      <p className="text-sm text-muted-foreground">{formatDate(selectedUser.subscriber.last_seen)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Management URL</label>
                      <a 
                        href={selectedUser.subscriber.management_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Open in RevenueCat
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subscriptions */}
              <Card>
                <CardHeader>
                  <CardTitle>Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.entries(selectedUser.subscriber.subscriptions).map(([productId, subscription]: [string, any]) => (
                    <div key={productId} className="border rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{productId}</h4>
                        <Badge variant={new Date(subscription.expires_date) > new Date() ? "default" : "secondary"}>
                          {new Date(subscription.expires_date) > new Date() ? "Active" : "Expired"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="font-medium">Purchase Date</label>
                          <p className="text-muted-foreground">{formatDate(subscription.purchase_date)}</p>
                        </div>
                        <div>
                          <label className="font-medium">Expires</label>
                          <p className="text-muted-foreground">{formatDate(subscription.expires_date)}</p>
                        </div>
                        <div>
                          <label className="font-medium">Store</label>
                          <p className="text-muted-foreground">{subscription.store}</p>
                        </div>
                        <div>
                          <label className="font-medium">Period Type</label>
                          <p className="text-muted-foreground">{subscription.period_type}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Entitlements */}
              <Card>
                <CardHeader>
                  <CardTitle>Entitlements</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.entries(selectedUser.subscriber.entitlements).map(([entitlementId, entitlement]: [string, any]) => (
                    <div key={entitlementId} className="border rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{entitlementId}</h4>
                        <Badge variant={new Date(entitlement.expires_date) > new Date() ? "default" : "secondary"}>
                          {new Date(entitlement.expires_date) > new Date() ? "Active" : "Expired"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="font-medium">Product ID</label>
                          <p className="text-muted-foreground">{entitlement.product_identifier}</p>
                        </div>
                        <div>
                          <label className="font-medium">Purchase Date</label>
                          <p className="text-muted-foreground">{formatDate(entitlement.purchase_date)}</p>
                        </div>
                        <div>
                          <label className="font-medium">Expires</label>
                          <p className="text-muted-foreground">{formatDate(entitlement.expires_date)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}