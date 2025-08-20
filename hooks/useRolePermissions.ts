import { useState, useEffect, useMemo } from 'react';

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

interface RolePermissionData {
  roles: Role[];
  permissions: Permission[];
}

// Default tab configurations for each role
const ROLE_TAB_CONFIG: Record<string, {
  allowedTabs: string[];
  defaultTab: string;
}> = {
  superadmin: {
    allowedTabs: [
      'overview',
      'waiter',
      'admin',
      'qr-generator',
      'todays-special',
      'order-statistics',
      'offers',
      'user-credentials',
      'task-assignment',
      'about-us-content',
      'blog',
      'inventory',
      'role-permission'
    ],
    defaultTab: 'overview'
  },
  admin: {
    allowedTabs: [
      'overview',
      'waiter',
      'admin',
      'qr-generator',
      'todays-special',
      'order-statistics',
      'offers',
      'user-credentials',
      'task-assignment',
      'about-us-content',
      'blog',
      'inventory'
    ],
    defaultTab: 'overview'
  },
  manager: {
    allowedTabs: [
      'overview',
      'waiter',
      'qr-generator',
      'todays-special',
      'order-statistics',
      'task-assignment',
      'inventory'
    ],
    defaultTab: 'overview'
  },
  waiter: {
    allowedTabs: ['waiter'],
    defaultTab: 'waiter'
  },
  kitchen: {
    allowedTabs: ['waiter'],
    defaultTab: 'waiter'
  }
};

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

// Tab to permission mapping
const TAB_PERMISSIONS: Record<string, string[]> = {
  overview: ['view_dashboard'],
  waiter: ['manage_orders', 'view_orders'],
  admin: ['manage_menu', 'manage_users'],
  'qr-generator': ['generate_qr'],
  'todays-special': ['manage_specials'],
  'order-statistics': ['view_statistics'],
  offers: ['manage_offers'],
  'user-credentials': ['manage_users'],
  'task-assignment': ['assign_tasks'],
  'about-us-content': ['manage_settings'],
  blog: ['manage_blog'],
  inventory: ['manage_inventory'],
  'role-permission': ['manage_roles']
};

export function useRolePermissions() {
  const [permissions, setPermissions] = useState<RolePermissionData>({
    roles: [],
    permissions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load permissions on mount
  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from API first
        try {
          const response = await fetch('/api/roles-permissions');
          if (response.ok) {
            const data = await response.json();
            setPermissions({
              roles: data.roles || defaultRoles,
              permissions: data.permissions || defaultPermissions
            });
            return;
          }
        } catch (apiError) {
          console.log('API not available, using default permissions');
        }

        // Fallback to default data
        setPermissions({
          roles: defaultRoles,
          permissions: defaultPermissions
        });

      } catch (err) {
        console.error('Error loading permissions:', err);
        setError('Failed to load permissions');
        
        // Even on error, provide default data
        setPermissions({
          roles: defaultRoles,
          permissions: defaultPermissions
        });
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, []);

  // Memoized helper functions
  const getRoleById = useMemo(() => {
    return (roleId: string): Role | undefined => {
      return permissions.roles.find(role => role.id === roleId || role.name === roleId);
    };
  }, [permissions.roles]);

  const hasPermission = useMemo(() => {
    return (roleName: string, tabOrPermission: string): boolean => {
      const role = getRoleById(roleName);
      if (!role || !role.active) return false;

      // Check if it's a direct permission
      if (role.permissions.includes(tabOrPermission)) return true;

      // Check if it's a tab that requires specific permissions
      const requiredPermissions = TAB_PERMISSIONS[tabOrPermission];
      if (!requiredPermissions) return true; // If no specific permissions required, allow

      // Check if user has at least one required permission
      return requiredPermissions.some(permission => 
        role.permissions.includes(permission)
      );
    };
  }, [permissions.roles, getRoleById]);

  const getAllowedTabs = useMemo(() => {
    return (roleName: string): string[] => {
      const roleConfig = ROLE_TAB_CONFIG[roleName];
      if (!roleConfig) return ['overview']; // Fallback to overview

      // Filter tabs based on permissions
      return roleConfig.allowedTabs.filter(tab => 
        hasPermission(roleName, tab)
      );
    };
  }, [hasPermission]);

  const getDefaultTab = useMemo(() => {
    return (roleName: string): string => {
      const roleConfig = ROLE_TAB_CONFIG[roleName];
      if (!roleConfig) return 'overview';

      // Return default tab if user has permission, otherwise first allowed tab
      const allowedTabs = getAllowedTabs(roleName);
      if (allowedTabs.includes(roleConfig.defaultTab)) {
        return roleConfig.defaultTab;
      }
      
      return allowedTabs[0] || 'overview';
    };
  }, [getAllowedTabs]);

  const getRoleDisplayName = useMemo(() => {
    return (roleName: string): string => {
      const role = getRoleById(roleName);
      return role?.displayName || roleName;
    };
  }, [getRoleById]);

  const getUserPermissions = useMemo(() => {
    return (roleName: string): string[] => {
      const role = getRoleById(roleName);
      return role?.permissions || [];
    };
  }, [getRoleById]);

  const canAccessTab = useMemo(() => {
    return (roleName: string, tabName: string): boolean => {
      return hasPermission(roleName, tabName);
    };
  }, [hasPermission]);

  const isRoleActive = useMemo(() => {
    return (roleName: string): boolean => {
      const role = getRoleById(roleName);
      return role?.active ?? false;
    };
  }, [getRoleById]);

  const getRolePriority = useMemo(() => {
    return (roleName: string): number => {
      const role = getRoleById(roleName);
      return role?.priority || 0;
    };
  }, [getRoleById]);

  return {
    // Data
    permissions,
    roles: permissions.roles,
    allPermissions: permissions.permissions,
    loading,
    error,

    // Role functions
    getRoleById,
    getRoleDisplayName,
    getUserPermissions,
    isRoleActive,
    getRolePriority,

    // Permission functions
    hasPermission,
    canAccessTab,

    // Tab functions
    getAllowedTabs,
    getDefaultTab,

    // Constants
    ROLE_TAB_CONFIG,
    TAB_PERMISSIONS
  };
}
