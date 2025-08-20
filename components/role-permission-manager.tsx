"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Save, 
  RefreshCw, 
  Plus,
  Edit3, 
  Trash2,
  Eye,
  Shield,
  Users,
  Settings,
  Lock,
  Unlock,
  Crown,
  User,
  AlertCircle,
  CheckCircle,
  Info,
  X
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  action: string;
}

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  priority: number;
  isSystemRole: boolean;
  active: boolean;
  color: string;
}

interface UserRoleAssignment {
  userId: string;
  username: string;
  name: string;
  email: string;
  currentRole: string;
  assignedDate: string;
  lastActivity: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface RolePermissionData {
  roles: Role[];
  permissions: Permission[];
  userAssignments: UserRoleAssignment[];
  settings: {
    allowMultipleRoles: boolean;
    requireApprovalForRoleChanges: boolean;
    defaultRole: string;
    sessionTimeout: number;
  };
}

interface RolePermissionManagerProps {
  currentUser?: { username: string; role: string; name: string };
}

export default function RolePermissionManager({ currentUser }: RolePermissionManagerProps) {
  const [rolePermissionData, setRolePermissionData] = useState<RolePermissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState("roles");
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [creatingRole, setCreatingRole] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [creatingPermission, setCreatingPermission] = useState(false);
  const [newRole, setNewRole] = useState<Partial<Role>>({
    name: '',
    displayName: '',
    description: '',
    permissions: [],
    priority: 1,
    isSystemRole: false,
    active: true,
    color: 'blue'
  });
  const [newPermission, setNewPermission] = useState<Partial<Permission>>({
    name: '',
    description: '',
    category: '',
    resource: '',
    action: ''
  });

  // Default permissions for the system
  const defaultPermissions: Permission[] = [
    { id: 'view_dashboard', name: 'View Dashboard', description: 'Access to main dashboard', category: 'Dashboard', resource: 'dashboard', action: 'view' },
    { id: 'manage_orders', name: 'Manage Orders', description: 'Create, view, and modify orders', category: 'Orders', resource: 'orders', action: 'manage' },
    { id: 'view_orders', name: 'View Orders', description: 'View order details', category: 'Orders', resource: 'orders', action: 'view' },
    { id: 'manage_menu', name: 'Manage Menu', description: 'Add, edit, delete menu items', category: 'Menu', resource: 'menu', action: 'manage' },
    { id: 'view_menu', name: 'View Menu', description: 'Access menu information', category: 'Menu', resource: 'menu', action: 'view' },
    { id: 'manage_users', name: 'Manage Users', description: 'Create, edit, delete user accounts', category: 'Users', resource: 'users', action: 'manage' },
    { id: 'view_users', name: 'View Users', description: 'Access user information', category: 'Users', resource: 'users', action: 'view' },
    { id: 'manage_inventory', name: 'Manage Inventory', description: 'Track and update inventory', category: 'Inventory', resource: 'inventory', action: 'manage' },
    { id: 'view_statistics', name: 'View Statistics', description: 'Access reports and analytics', category: 'Reports', resource: 'statistics', action: 'view' },
    { id: 'manage_settings', name: 'Manage Settings', description: 'Configure system settings', category: 'System', resource: 'settings', action: 'manage' },
    { id: 'manage_roles', name: 'Manage Roles', description: 'Create and modify user roles', category: 'Security', resource: 'roles', action: 'manage' },
    { id: 'generate_qr', name: 'Generate QR Codes', description: 'Create QR codes for tables', category: 'System', resource: 'qr', action: 'generate' },
    { id: 'manage_specials', name: 'Manage Specials', description: 'Create and edit daily specials', category: 'Menu', resource: 'specials', action: 'manage' },
    { id: 'manage_offers', name: 'Manage Offers', description: 'Create and manage promotional offers', category: 'Marketing', resource: 'offers', action: 'manage' },
    { id: 'manage_blog', name: 'Manage Blog', description: 'Create and edit blog posts', category: 'Content', resource: 'blog', action: 'manage' },
    { id: 'assign_tasks', name: 'Assign Tasks', description: 'Assign tasks to staff members', category: 'Management', resource: 'tasks', action: 'assign' }
  ];

  // Default roles for the system
  const defaultRoles: Role[] = [
    {
      id: 'superadmin',
      name: 'superadmin',
      displayName: 'Super Administrator',
      description: 'Full system access with all permissions',
      permissions: defaultPermissions.map(p => p.id),
      priority: 100,
      isSystemRole: true,
      active: true,
      color: 'purple'
    },
    {
      id: 'admin',
      name: 'admin',
      displayName: 'Administrator',
      description: 'System administrator with most permissions',
      permissions: [
        'view_dashboard', 'manage_orders', 'view_orders', 'manage_menu', 'view_menu',
        'manage_users', 'view_users', 'manage_inventory', 'view_statistics',
        'generate_qr', 'manage_specials', 'manage_offers', 'assign_tasks'
      ],
      priority: 80,
      isSystemRole: true,
      active: true,
      color: 'blue'
    },
    {
      id: 'manager',
      name: 'manager',
      displayName: 'Manager',
      description: 'Restaurant manager with operational permissions',
      permissions: [
        'view_dashboard', 'manage_orders', 'view_orders', 'view_menu',
        'view_users', 'manage_inventory', 'view_statistics',
        'manage_specials', 'assign_tasks'
      ],
      priority: 60,
      isSystemRole: true,
      active: true,
      color: 'green'
    },
    {
      id: 'waiter',
      name: 'waiter',
      displayName: 'Waiter/Server',
      description: 'Front-of-house staff with order management',
      permissions: ['view_dashboard', 'manage_orders', 'view_orders', 'view_menu'],
      priority: 40,
      isSystemRole: true,
      active: true,
      color: 'orange'
    },
    {
      id: 'kitchen',
      name: 'kitchen',
      displayName: 'Kitchen Staff',
      description: 'Kitchen staff with order viewing permissions',
      permissions: ['view_dashboard', 'view_orders', 'view_menu'],
      priority: 30,
      isSystemRole: true,
      active: true,
      color: 'red'
    }
  ];

  // Load role permission data on mount
  useEffect(() => {
    loadRolePermissionData();
  }, []);

  const loadRolePermissionData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API first
      try {
        const response = await fetch('/api/roles-permissions');
        if (response.ok) {
          const data = await response.json();
          setRolePermissionData(data);
          setMessage({ type: 'info', text: `Loaded ${data.roles.length} roles and ${data.permissions.length} permissions` });
          return;
        }
      } catch (apiError) {
        console.log('API not available, using default data');
      }

      // Fallback to default data
      const defaultData: RolePermissionData = {
        roles: defaultRoles,
        permissions: defaultPermissions,
        userAssignments: [
          {
            userId: '1',
            username: 'superadmin',
            name: 'Super Administrator',
            email: 'admin@bloomcafe.com',
            currentRole: 'superadmin',
            assignedDate: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            status: 'active'
          }
        ],
        settings: {
          allowMultipleRoles: false,
          requireApprovalForRoleChanges: true,
          defaultRole: 'waiter',
          sessionTimeout: 24
        }
      };

      setRolePermissionData(defaultData);
      setMessage({ type: 'info', text: 'Loaded default role and permission configuration' });

    } catch (error) {
      console.error('Error loading role permission data:', error);
      setMessage({ type: 'error', text: 'Error loading role permission data' });
    } finally {
      setLoading(false);
    }
  };

  const saveRolePermissionData = async () => {
    if (!rolePermissionData) return;

    try {
      setSaving(true);
      const updatedData = {
        ...rolePermissionData,
        updatedBy: currentUser?.username || 'superadmin',
        updatedAt: new Date().toISOString()
      };

      const response = await fetch('/api/roles-permissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Role and permission data saved successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save role and permission data' });
      }
    } catch (error) {
      console.error('Error saving role permission data:', error);
      setMessage({ type: 'error', text: 'Error saving role and permission data' });
    } finally {
      setSaving(false);
    }
  };

  const createRole = () => {
    if (!rolePermissionData || !newRole.name) return;

    const role: Role = {
      id: newRole.name.toLowerCase().replace(/\s+/g, '-'),
      name: newRole.name.toLowerCase().replace(/\s+/g, '-'),
      displayName: newRole.displayName || newRole.name || '',
      description: newRole.description || '',
      permissions: newRole.permissions || [],
      priority: newRole.priority || 1,
      isSystemRole: false,
      active: newRole.active !== false,
      color: newRole.color || 'blue'
    };

    setRolePermissionData({
      ...rolePermissionData,
      roles: [...rolePermissionData.roles, role]
    });

    setCreatingRole(false);
    setNewRole({
      name: '',
      displayName: '',
      description: '',
      permissions: [],
      priority: 1,
      isSystemRole: false,
      active: true,
      color: 'blue'
    });
    setMessage({ type: 'success', text: 'Role created successfully!' });
  };

  const updateRole = (roleId: string, updates: Partial<Role>) => {
    if (!rolePermissionData) return;

    const updatedRoles = rolePermissionData.roles.map(role =>
      role.id === roleId ? { ...role, ...updates } : role
    );

    setRolePermissionData({
      ...rolePermissionData,
      roles: updatedRoles
    });
  };

  const deleteRole = (roleId: string) => {
    if (!rolePermissionData) return;

    const role = rolePermissionData.roles.find(r => r.id === roleId);
    if (role?.isSystemRole) {
      setMessage({ type: 'error', text: 'Cannot delete system roles' });
      return;
    }

    setRolePermissionData({
      ...rolePermissionData,
      roles: rolePermissionData.roles.filter(role => role.id !== roleId)
    });

    setMessage({ type: 'success', text: 'Role deleted successfully!' });
  };

  const toggleRolePermission = (roleId: string, permissionId: string) => {
    if (!rolePermissionData) return;

    const role = rolePermissionData.roles.find(r => r.id === roleId);
    if (!role) return;

    const hasPermission = role.permissions.includes(permissionId);
    const updatedPermissions = hasPermission
      ? role.permissions.filter(p => p !== permissionId)
      : [...role.permissions, permissionId];

    updateRole(roleId, { permissions: updatedPermissions });
  };

  const getPermissionsByCategory = () => {
    if (!rolePermissionData) return {};
    
    return rolePermissionData.permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  };

  const dismissMessage = () => setMessage(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading role and permission data...</span>
      </div>
    );
  }

  if (!rolePermissionData) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load role and permission data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const permissionsByCategory = getPermissionsByCategory();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" />
            Role & Permission Manager
          </h2>
          <p className="text-gray-600 mt-1">
            Manage user roles, permissions, and access control
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadRolePermissionData}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={saveRolePermissionData}
            disabled={saving}
            size="sm"
          >
            <Save className={`w-4 h-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {message && (
        <Alert className={`mb-6 ${
          message.type === 'error' ? 'border-red-500 bg-red-50' :
          message.type === 'success' ? 'border-green-500 bg-green-50' :
          'border-blue-500 bg-blue-50'
        }`}>
          {message.type === 'error' ? <AlertCircle className="h-4 w-4" /> :
           message.type === 'success' ? <CheckCircle className="h-4 w-4" /> :
           <Info className="h-4 w-4" />}
          <AlertDescription className="flex items-center justify-between">
            {message.text}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={dismissMessage}
              className="ml-2 h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Roles ({rolePermissionData.roles.length})
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Permissions ({rolePermissionData.permissions.length})
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            User Assignments
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">System Roles</h3>
            <Button
              onClick={() => setCreatingRole(true)}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rolePermissionData.roles.map((role) => (
              <Card key={role.id} className={`border-l-4 border-l-${role.color}-500`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {role.isSystemRole && <Crown className="w-4 h-4 text-yellow-500" />}
                        {role.displayName}
                        <Badge 
                          variant={role.active ? "default" : "secondary"}
                          className="ml-2"
                        >
                          {role.active ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                    </div>
                    {!role.isSystemRole && (
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingRole(role)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteRole(role.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Permissions ({role.permissions.length})</Label>
                      <div className="mt-2 max-h-48 overflow-y-auto">
                        {Object.entries(permissionsByCategory).map(([category, permissions]) => {
                          const categoryPermissions = permissions.filter(p => 
                            role.permissions.includes(p.id)
                          );
                          
                          if (categoryPermissions.length === 0) return null;

                          return (
                            <div key={category} className="mb-3">
                              <h4 className="text-xs font-medium text-gray-700 mb-1">{category}</h4>
                              <div className="space-y-1">
                                {categoryPermissions.map((permission) => (
                                  <div key={permission.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${role.id}-${permission.id}`}
                                      checked={role.permissions.includes(permission.id)}
                                      onCheckedChange={() => toggleRolePermission(role.id, permission.id)}
                                      disabled={role.isSystemRole}
                                    />
                                    <Label 
                                      htmlFor={`${role.id}-${permission.id}`}
                                      className="text-xs cursor-pointer"
                                    >
                                      {permission.name}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Priority: {role.priority}</span>
                      <Badge variant="outline" className={`text-${role.color}-600`}>
                        {role.color}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create Role Dialog */}
          <Dialog open={creatingRole} onOpenChange={setCreatingRole}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role-name">Role Name</Label>
                    <Input
                      id="role-name"
                      value={newRole.name || ''}
                      onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                      placeholder="e.g., supervisor"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role-display-name">Display Name</Label>
                    <Input
                      id="role-display-name"
                      value={newRole.displayName || ''}
                      onChange={(e) => setNewRole({ ...newRole, displayName: e.target.value })}
                      placeholder="e.g., Supervisor"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="role-description">Description</Label>
                  <Textarea
                    id="role-description"
                    value={newRole.description || ''}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    placeholder="Describe the role's responsibilities..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role-priority">Priority</Label>
                    <Input
                      id="role-priority"
                      type="number"
                      value={newRole.priority || 1}
                      onChange={(e) => setNewRole({ ...newRole, priority: parseInt(e.target.value) })}
                      min="1"
                      max="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role-color">Color</Label>
                    <Select
                      value={newRole.color}
                      onValueChange={(color) => setNewRole({ ...newRole, color })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="red">Red</SelectItem>
                        <SelectItem value="yellow">Yellow</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="role-active"
                    checked={newRole.active !== false}
                    onCheckedChange={(active) => setNewRole({ ...newRole, active })}
                  />
                  <Label htmlFor="role-active">Active</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCreatingRole(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={createRole}
                  disabled={!newRole.name}
                >
                  Create Role
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">System Permissions</h3>
            <Button
              onClick={() => setCreatingPermission(true)}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Permission
            </Button>
          </div>

          {Object.entries(permissionsByCategory).map(([category, permissions]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{permission.name}</h4>
                        <Badge variant="outline">
                          {permission.resource}:{permission.action}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{permission.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <h3 className="text-lg font-semibold">User Role Assignments</h3>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-medium">User</th>
                      <th className="text-left p-4 font-medium">Current Role</th>
                      <th className="text-left p-4 font-medium">Assigned Date</th>
                      <th className="text-left p-4 font-medium">Last Activity</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rolePermissionData.userAssignments.map((assignment) => (
                      <tr key={assignment.userId} className="border-b">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{assignment.name}</p>
                            <p className="text-sm text-gray-600">{assignment.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">
                            {rolePermissionData.roles.find(r => r.id === assignment.currentRole)?.displayName || assignment.currentRole}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {new Date(assignment.assignedDate).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {new Date(assignment.lastActivity).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant={assignment.status === 'active' ? 'default' : 'secondary'}
                          >
                            {assignment.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Button variant="ghost" size="sm">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <h3 className="text-lg font-semibold">Permission Settings</h3>
          
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Allow Multiple Roles</Label>
                  <p className="text-sm text-gray-600">Allow users to have multiple roles assigned</p>
                </div>
                <Switch
                  checked={rolePermissionData.settings.allowMultipleRoles}
                  onCheckedChange={(checked) => 
                    setRolePermissionData({
                      ...rolePermissionData,
                      settings: { ...rolePermissionData.settings, allowMultipleRoles: checked }
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Require Approval for Role Changes</Label>
                  <p className="text-sm text-gray-600">Require admin approval when changing user roles</p>
                </div>
                <Switch
                  checked={rolePermissionData.settings.requireApprovalForRoleChanges}
                  onCheckedChange={(checked) => 
                    setRolePermissionData({
                      ...rolePermissionData,
                      settings: { ...rolePermissionData.settings, requireApprovalForRoleChanges: checked }
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="default-role">Default Role</Label>
                <Select
                  value={rolePermissionData.settings.defaultRole}
                  onValueChange={(defaultRole) => 
                    setRolePermissionData({
                      ...rolePermissionData,
                      settings: { ...rolePermissionData.settings, defaultRole }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rolePermissionData.roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 mt-1">Role assigned to new users by default</p>
              </div>

              <div>
                <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={rolePermissionData.settings.sessionTimeout}
                  onChange={(e) => 
                    setRolePermissionData({
                      ...rolePermissionData,
                      settings: { ...rolePermissionData.settings, sessionTimeout: parseInt(e.target.value) }
                    })
                  }
                  min="1"
                  max="168"
                />
                <p className="text-sm text-gray-600 mt-1">How long user sessions remain active</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
