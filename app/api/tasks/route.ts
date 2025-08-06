import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const TASKS_FILE = path.join(process.cwd(), 'tasks.json')

// Helper function to read tasks data from JSON
function readTasksData() {
  try {
    if (fs.existsSync(TASKS_FILE)) {
      console.log('📋 JSON FILE ACCESS: tasks.json accessed from api/tasks/route.ts -> readTasksData()');
      const data = fs.readFileSync(TASKS_FILE, 'utf8')
      return JSON.parse(data)
    }
    return { tasks: [], lastUpdated: new Date().toISOString() }
  } catch (error) {
    console.error('Error reading tasks.json:', error)
    return { tasks: [], lastUpdated: new Date().toISOString() }
  }
}

// Helper function to write tasks data to JSON
function writeTasksData(data: any): boolean {
  try {
    console.log('💾 JSON FILE ACCESS: tasks.json updated from api/tasks/route.ts -> writeTasksData()');
    data.lastUpdated = new Date().toISOString()
    fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error writing tasks.json:', error)
    return false
  }
}

// GET - Fetch all tasks from JSON
export async function GET() {
  try {
    console.log('📋 JSON FILE ACCESS: tasks data accessed from tasks.json -> GET()');
    
    const tasksData = readTasksData()
    
    return NextResponse.json({ 
      success: true, 
      tasks: tasksData.tasks || [],
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching tasks from JSON:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch tasks',
      tasks: []
    }, { status: 500 })
  }
}

// POST - Add new task or update existing task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, task, taskId } = body
    
    const tasksData = readTasksData()
    
    switch (action) {
      case 'create':
        // Add new task
        tasksData.tasks.unshift(task)
        break
        
      case 'update':
        // Update existing task
        const taskIndex = tasksData.tasks.findIndex((t: any) => t.id === taskId)
        if (taskIndex !== -1) {
          tasksData.tasks[taskIndex] = { ...tasksData.tasks[taskIndex], ...task, updatedAt: new Date().toISOString() }
        }
        break
        
      case 'delete':
        // Delete task
        tasksData.tasks = tasksData.tasks.filter((t: any) => t.id !== taskId)
        break
        
      case 'updateStatus':
        // Update task status
        const statusTaskIndex = tasksData.tasks.findIndex((t: any) => t.id === taskId)
        if (statusTaskIndex !== -1) {
          tasksData.tasks[statusTaskIndex].status = task.status
          tasksData.tasks[statusTaskIndex].updatedAt = new Date().toISOString()
        }
        break
        
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 })
    }
    
    const writeSuccess = writeTasksData(tasksData)
    
    if (writeSuccess) {
      return NextResponse.json({ 
        success: true, 
        message: `Task ${action} successful`,
        tasks: tasksData.tasks
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save tasks data' 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error processing task request:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process task request' 
    }, { status: 500 })
  }
}
