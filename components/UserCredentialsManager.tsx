"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Edit, Trash2, Plus, Users, Shield, Crown, UserCheck, Settings, ChefHat } from "lucide-react";

interface User {
  id: number;
  username: string;
  password: string;
  role: string;
  name: string;
}

interface UserCredentialsManagerProps {
  currentUser?: { username: string; role: string; name: string };
}

export default function UserCredentialsManager({ currentUser }: UserCredentialsManagerProps) {
  const [credentials, setCredentials] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPasswords, setShowPasswords] = useState<{[key: number]: boolean}>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [addUserError, setAddUserError] = useState<string>('');
  const [editUserError, setEditUserError] = useState<string>('');
  const [newUser, setNewUser] = useState<{
    username: string;
    password: string;
    name: string;
    role: string;
  }>({ username: '', password: '', name: '', role: 'waiter' });

  // Load credentials on component mount
  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      const response = await fetch('/api/load-credentials');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCredentials(data.users || []);
    } catch (error) {
      console.error('Error loading credentials:', error);
      setAlert({ type: 'error', message: 'Failed to load user credentials' });
    }
  };

  const saveCredentials = async (updatedCredentials: User[]) => {
    try {
      const response = await fetch('/api/save-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ users: updatedCredentials }),
      });
      
      if (response.ok) {
        setCredentials(updatedCredentials);
        setAlert({ type: 'success', message: 'Credentials updated successfully' });
      } else {
        setAlert({ type: 'error', message: 'Failed to save credentials' });
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
      setAlert({ type: 'error', message: 'Error saving credentials' });
    }
  };

  const handleAddUser = async () => {
    // Clear previous errors
    setAddUserError('');
    
    if (!newUser.username.trim() || !newUser.password.trim() || !newUser.name.trim()) {
      setAddUserError('Please fill in all fields');
      return;
    }

    // Check if username already exists
    if (credentials.some(user => user.username === newUser.username.trim())) {
      setAddUserError('Username already exists');
      return;
    }

    const newId = credentials.length > 0 ? Math.max(...credentials.map(u => u.id)) + 1 : 1;
    const userToAdd: User = {
      id: newId,
      username: newUser.username.trim(),
      password: newUser.password,
      name: newUser.name.trim(),
      role: newUser.role
    };

    const updatedCredentials = [...credentials, userToAdd];
    await saveCredentials(updatedCredentials);
    
    setNewUser({ username: '', password: '', name: '', role: 'waiter' });
    setAddUserError('');
    setIsAddDialogOpen(false);
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    // Clear previous errors
    setEditUserError('');

    if (!editingUser.username.trim() || !editingUser.password.trim() || !editingUser.name.trim()) {
      setEditUserError('Please fill in all fields');
      return;
    }

    // Check if username already exists for a different user
    if (credentials.some(user => user.username === editingUser.username.trim() && user.id !== editingUser.id)) {
      setEditUserError('Username already exists');
      return;
    }

    const updatedCredentials = credentials.map(user => 
      user.id === editingUser.id ? editingUser : user
    );
    
    await saveCredentials(updatedCredentials);
    setEditingUser(null);
    setEditUserError('');
    setIsEditDialogOpen(false);
  };

  const handleDeleteUser = async (userId: number) => {
    const userToDelete = credentials.find(u => u.id === userId);
    if (!userToDelete) return;

    // Prevent deletion of superadmin users
    if (userToDelete.role === 'superadmin') {
      setAlert({ type: 'error', message: 'Cannot delete superadmin users' });
      return;
    }

    // Prevent deletion of current user
    if (userToDelete.username === currentUser?.username) {
      setAlert({ type: 'error', message: 'Cannot delete your own account' });
      return;
    }

    if (confirm(`Are you sure you want to delete user "${userToDelete.username}"?`)) {
      const updatedCredentials = credentials.filter(user => user.id !== userId);
      await saveCredentials(updatedCredentials);
    }
  };

  const togglePasswordVisibility = (userId: number) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Crown className="w-4 h-4 text-purple-600" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'manager':
        return <Settings className="w-4 h-4 text-orange-600" />;
      case 'cook':
        return <ChefHat className="w-4 h-4 text-red-600" />;
      case 'waiter':
        return <UserCheck className="w-4 h-4 text-green-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'manager':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'cook':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'waiter':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Auto-hide alerts after 5 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            User Credentials Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage user accounts, passwords, and access levels
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setAddUserError('');
            setNewUser({ username: '', password: '', name: '', role: 'waiter' });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Error Alert within Dialog */}
              {addUserError && (
                <Alert variant="destructive">
                  <AlertDescription>{addUserError}</AlertDescription>
                </Alert>
              )}
              <div>
                <Label htmlFor="new-username">Username</Label>
                <Input
                  id="new-username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <Label htmlFor="new-name">Full Name</Label>
                <Input
                  id="new-name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="new-password">Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <div>
                <Label htmlFor="new-role">Role</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="waiter">Waiter</SelectItem>
                    <SelectItem value="cook">Cook</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddUser} className="flex-1">
                  Add User
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setNewUser({ username: '', password: '', name: '', role: 'waiter' });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert */}
      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Accounts ({credentials.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {credentials.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">
                        {showPasswords[user.id] ? user.password : '••••••••'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePasswordVisibility(user.id)}
                      >
                        {showPasswords[user.id] ? 
                          <EyeOff className="w-4 h-4" /> : 
                          <Eye className="w-4 h-4" />
                        }
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      <div className="flex items-center gap-1">
                        {getRoleIcon(user.role)}
                        {user.role}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog open={isEditDialogOpen && editingUser?.id === user.id} onOpenChange={(open) => {
                        setIsEditDialogOpen(open);
                        if (!open) {
                          setEditingUser(null);
                          setEditUserError('');
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser({ ...user })}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                          </DialogHeader>
                          {editingUser && (
                            <div className="space-y-4">
                              {/* Error Alert within Edit Dialog */}
                              {editUserError && (
                                <Alert variant="destructive">
                                  <AlertDescription>{editUserError}</AlertDescription>
                                </Alert>
                              )}
                              <div>
                                <Label htmlFor="edit-username">Username</Label>
                                <Input
                                  id="edit-username"
                                  value={editingUser.username}
                                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-name">Full Name</Label>
                                <Input
                                  id="edit-name"
                                  value={editingUser.name}
                                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-password">Password</Label>
                                <Input
                                  id="edit-password"
                                  type="password"
                                  value={editingUser.password}
                                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-role">Role</Label>
                                <Select value={editingUser.role} onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="waiter">Waiter</SelectItem>
                                    <SelectItem value="cook">Cook</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="superadmin">Super Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex gap-2 pt-4">
                                <Button onClick={handleEditUser} className="flex-1">
                                  Save Changes
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setIsEditDialogOpen(false);
                                    setEditingUser(null);
                                  }}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      {user.role !== 'superadmin' && user.username !== currentUser?.username && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
