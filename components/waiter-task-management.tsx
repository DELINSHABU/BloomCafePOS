"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Target,
  Users,
  RefreshCw,
} from "lucide-react";

// Task interface - same as in task-assignment-manager
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

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-700", icon: Clock },
  { value: "in-progress", label: "In Progress", color: "bg-blue-100 text-blue-700", icon: AlertCircle },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700", icon: CheckCircle },
  { value: "overdue", label: "Overdue", color: "bg-red-100 text-red-700", icon: AlertCircle },
];

const PRIORITY_LEVELS = [
  { value: "low", label: "Low Priority", color: "bg-blue-100 text-blue-700" },
  { value: "medium", label: "Medium Priority", color: "bg-yellow-100 text-yellow-700" },
  { value: "high", label: "High Priority", color: "bg-red-100 text-red-700" },
];

interface WaiterTaskManagementProps {
  currentUser?: { username: string; role: string; name: string };
}

export default function WaiterTaskManagement({ currentUser }: WaiterTaskManagementProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  // Load tasks assigned to current waiter
  const loadTasks = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        // Filter tasks assigned to current waiter
        const waiterTasks = (data.tasks || []).filter((task: Task) => 
          task.assignedTo === currentUser?.name
        );
        setTasks(waiterTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadTasks();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentUser?.name) {
      loadTasks();
    }
  }, [currentUser]);

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
        // Update local state
        setTasks(tasks.map(task => 
          task.id === taskId 
            ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
            : task
        ));
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
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

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'completed') return false;
    const due = new Date(dueDate);
    const now = new Date();
    return now > due;
  };

  const getTasksCountByStatus = (status: string) => {
    return tasks.filter(task => task.status === status).length;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Tasks</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Tasks assigned to you
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Tasks</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Tasks assigned to you
          </p>
        </div>
        <Button 
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Task Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATUS_OPTIONS.map((status) => {
          const count = getTasksCountByStatus(status.value);
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Status</label>
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
              <label className="text-sm font-medium">Filter by Priority</label>
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

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600">
                {tasks.length === 0 
                  ? "You don't have any tasks assigned yet."
                  : "Try adjusting your filters to see more tasks."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => {
            const overdue = isOverdue(task.dueDate, task.status);
            
            return (
              <Card 
                key={task.id} 
                className={`hover:shadow-md transition-shadow ${
                  overdue ? 'ring-2 ring-red-500 ring-opacity-50' : ''
                }`}
              >
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
                        {overdue && (
                          <Badge className="bg-red-100 text-red-700">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 mb-3">{task.description}</p>
                      )}
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>Assigned by: <strong>{task.assignedBy}</strong></span>
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
