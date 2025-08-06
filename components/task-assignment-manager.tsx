"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  User,
  Calendar,
  Target,
} from "lucide-react";

// Task interface
interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  status: "pending" | "in-progress" | "completed" | "overdue";
  priority: "low" | "medium" | "high";
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  category: "service" | "cleaning" | "inventory" | "training" | "customer-service" | "special-events" | "maintenance" | "other";
}

// Waiter interface
interface Waiter {
  id: number;
  name: string;
  username: string;
  role: string;
}

const TASK_CATEGORIES = [
  { value: "service", label: "Customer Service" },
  { value: "cleaning", label: "Cleaning & Maintenance" },
  { value: "inventory", label: "Inventory Management" },
  { value: "training", label: "Training & Development" },
  { value: "other", label: "Other Tasks" },
];

const PRIORITY_LEVELS = [
  { value: "low", label: "Low Priority", color: "bg-blue-100 text-blue-700" },
  { value: "medium", label: "Medium Priority", color: "bg-yellow-100 text-yellow-700" },
  { value: "high", label: "High Priority", color: "bg-red-100 text-red-700" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-700", icon: Clock },
  { value: "in-progress", label: "In Progress", color: "bg-blue-100 text-blue-700", icon: AlertCircle },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700", icon: CheckCircle },
  { value: "overdue", label: "Overdue", color: "bg-red-100 text-red-700", icon: AlertCircle },
];

interface TaskAssignmentManagerProps {
  currentUser?: { username: string; role: string; name: string };
}

export default function TaskAssignmentManager({ currentUser }: TaskAssignmentManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterWaiter, setFilterWaiter] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  // New task form state
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
    category: "service" as "service" | "cleaning" | "inventory" | "training" | "customer-service" | "special-events" | "maintenance" | "other",
  });

  // Load tasks and waiters from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load tasks
        const tasksResponse = await fetch('/api/tasks');
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          setTasks(tasksData.tasks || []);
        }
        
        // Load waiters from staff credentials
        const waitersResponse = await fetch('/api/load-credentials');
        if (waitersResponse.ok) {
          const waitersData = await waitersResponse.json();
          // Filter only waiters and superadmins from the users list
          const waitersList = waitersData.users?.filter((user: any) => 
            user.role === 'waiter' || user.role === 'superadmin' || user.role === 'admin'
          ) || [];
          setWaiters(waitersList);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const createTask = async () => {
    if (!newTask.title || !newTask.assignedTo || !newTask.dueDate) {
      return;
    }

    const assignedWaiter = waiters.find(w => w.name === newTask.assignedTo);
    const task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      assignedTo: newTask.assignedTo,
      assignedBy: currentUser?.name || "Super Admin",
      status: "pending" as const,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: newTask.category,
    };

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', task }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setTasks(result.tasks || [task, ...tasks]);
        setNewTask({
          title: "",
          description: "",
          assignedTo: "",
          priority: "medium",
          dueDate: "",
          category: "service",
        });
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task["status"]) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'updateStatus', 
          taskId, 
          task: { status: newStatus }
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setTasks(result.tasks || tasks.map(task => 
          task.id === taskId 
            ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
            : task
        ));
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', taskId }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setTasks(result.tasks || tasks.filter(task => task.id !== taskId));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const editTask = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo,
      priority: task.priority,
      dueDate: task.dueDate,
      category: task.category,
    });
    setIsCreateDialogOpen(true);
  };

  const updateTask = async () => {
    if (!editingTask || !newTask.title || !newTask.assignedTo || !newTask.dueDate) {
      return;
    }

    const updatedTaskData = {
      title: newTask.title,
      description: newTask.description,
      assignedTo: newTask.assignedTo,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      category: newTask.category,
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'update', 
          taskId: editingTask.id, 
          task: updatedTaskData
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setTasks(result.tasks || tasks.map(task => 
          task.id === editingTask.id ? { ...editingTask, ...updatedTaskData } : task
        ));
        setEditingTask(null);
        setNewTask({
          title: "",
          description: "",
          assignedTo: "",
          priority: "medium",
          dueDate: "",
          category: "service",
        });
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filterWaiter !== "all" && task.assignedTo !== filterWaiter) return false;
    if (filterStatus !== "all" && task.status !== filterStatus) return false;
    if (filterPriority !== "all" && task.priority !== filterPriority) return false;
    return true;
  });

  const getStatusBadge = (status: Task["status"]) => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status);
    const Icon = statusConfig?.icon || Clock;
    
    return (
      <Badge className={statusConfig?.color || "bg-gray-100 text-gray-700"}>
        <Icon className="w-3 h-3 mr-1" />
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: Task["priority"]) => {
    const priorityConfig = PRIORITY_LEVELS.find(p => p.value === priority);
    
    return (
      <Badge className={priorityConfig?.color || "bg-gray-100 text-gray-700"}>
        {priorityConfig?.label || priority}
      </Badge>
    );
  };

  const getCategoryIcon = (category: Task["category"]) => {
    switch (category) {
      case "service": return <User className="w-4 h-4" />;
      case "cleaning": return <Target className="w-4 h-4" />;
      case "inventory": return <CheckCircle className="w-4 h-4" />;
      case "training": return <Users className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const resetForm = () => {
    setNewTask({
      title: "",
      description: "",
      assignedTo: "",
      priority: "medium",
      dueDate: "",
      category: "service",
    });
    setEditingTask(null);
  };

  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleDialogOpen = () => {
    resetForm(); // Reset form when opening for new task
    setEditingTask(null);
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Task Assignment</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Assign and manage tasks for waiters and staff members
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleDialogOpen}
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              {loading ? "Loading..." : "Assign New Task"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingTask ? "Edit Task" : "Assign New Task"}
              </DialogTitle>
              <DialogDescription>
                {editingTask 
                  ? "Update the task details and assignment." 
                  : "Create a new task and assign it to a waiter."
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter task title..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed task description..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Assign to Waiter *</Label>
                  <Select 
                    value={newTask.assignedTo} 
                    onValueChange={(value) => setNewTask({...newTask, assignedTo: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select waiter" />
                    </SelectTrigger>
                    <SelectContent>
                      {waiters.map((waiter) => (
                        <SelectItem key={waiter.id} value={waiter.name}>
                          {waiter.name} - {waiter.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Priority Level</Label>
                  <Select 
                    value={newTask.priority} 
                    onValueChange={(value: "low" | "medium" | "high") => setNewTask({...newTask, priority: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_LEVELS.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={newTask.category} 
                    onValueChange={(value: Task["category"]) => setNewTask({...newTask, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button 
                onClick={editingTask ? updateTask : createTask}
                disabled={!newTask.title || !newTask.assignedTo || !newTask.dueDate}
              >
                {editingTask ? "Update Task" : "Assign Task"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Filter by Waiter</Label>
              <Select value={filterWaiter} onValueChange={setFilterWaiter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Waiters</SelectItem>
                  {waiters.map((waiter) => (
                    <SelectItem key={waiter.id} value={waiter.name}>
                      {waiter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Filter by Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {PRIORITY_LEVELS.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilterWaiter("all");
                  setFilterStatus("all");
                  setFilterPriority("all");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {STATUS_OPTIONS.map((status) => {
          const count = tasks.filter(task => task.status === status.value).length;
          const Icon = status.icon;
          
          return (
            <Card key={status.value}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{status.label}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <Icon className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600 mb-4">
                {tasks.length === 0 
                  ? "Create your first task assignment for the waiters."
                  : "Try adjusting your filters to see more tasks."
                }
              </p>
              <Button onClick={handleDialogOpen} disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                {loading ? "Loading..." : "Assign First Task"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(task.category)}
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                      </div>
                      {getStatusBadge(task.status)}
                      {getPriorityBadge(task.priority)}
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>Assigned to: <strong>{task.assignedTo}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Due: <strong>{new Date(task.dueDate).toLocaleDateString()}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {task.status !== "completed" && (
                      <Select
                        value={task.status}
                        onValueChange={(value: Task["status"]) => updateTaskStatus(task.id, value)}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editTask(task)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Task</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this task? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteTask(task.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
