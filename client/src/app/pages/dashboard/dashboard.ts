import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CreatorStat {
  value: string;
  label: string;
  sub: string;
  icon: string;
  color: string;
  bg: string;
}

interface Task {
  id: string;
  name: string;
  project: string;
  assigneeId: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Todo' | 'In Progress' | 'Review' | 'Done';
  dueDate: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  status: 'online' | 'busy' | 'focus' | 'offline';
  activeTask: string;
}

interface Activity {
  avatar: string;
  text: string;
  time: string;
  type: 'publish' | 'edit' | 'generate' | 'schedule';
}

@Component({
  selector: 'gz-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardPage implements OnInit, OnDestroy {
  protected readonly activeWorkspaceId = signal<string>(localStorage.getItem('activeWorkspaceId') || 'genz-studio');
  protected readonly creatorName = signal('Sanjay');
  protected readonly greeting = signal(this.getGreeting());

  // ── Task State ───────────────────────────────────────────
  protected readonly tasks = signal<Task[]>([]);
  protected readonly kanbanSearch = signal('');
  protected readonly kanbanPriorityFilter = signal<string>('All');
  protected readonly activeTab = signal<'board' | 'list'>('board');

  // ── Time Tracker State ───────────────────────────────────
  protected readonly isTrackingTime = signal(false);
  protected readonly trackerSeconds = signal(0);
  protected readonly trackerTaskName = signal('');
  protected readonly trackerProjectName = signal('Thumbnail Maker');
  protected readonly workspaceHoursTracked = signal<number>(28.5);

  // ── Modals & Forms ───────────────────────────────────────
  protected readonly showAddTaskModal = signal(false);
  protected newTaskName = '';
  protected newTaskProject = 'Thumbnail Maker';
  protected newTaskAssignee = 'sanjay';
  protected newTaskPriority: 'High' | 'Medium' | 'Low' = 'Medium';
  protected newTaskDueDate = '';

  // ── Team Members ─────────────────────────────────────────
  protected readonly teamMembers = signal<TeamMember[]>([
    { id: 'sanjay', name: 'Sanjay C.', role: 'Lead Editor', avatar: 'S', color: '#7C3AED', status: 'online', activeTask: 'Reviewing Banner' },
    { id: 'priya', name: 'Priya S.', role: 'Designer', avatar: 'P', color: '#EF4444', status: 'online', activeTask: 'Thumbnail Maker' },
    { id: 'marcus', name: 'Marcus T.', role: 'Developer', avatar: 'M', color: '#10B981', status: 'busy', activeTask: 'Refactoring Workspace' },
    { id: 'aisha', name: 'Aisha K.', role: 'Content Writer', avatar: 'A', color: '#F59E0B', status: 'focus', activeTask: 'AI Content Calendar' }
  ]);

  // ── Activity Log ─────────────────────────────────────────
  protected readonly activities = signal<Activity[]>([
    { avatar: 'Y', text: 'Thumbnail "Summer Vlog" went live on YouTube', time: '1h ago', type: 'publish' },
    { avatar: 'A', text: 'AI generated 3 script variations for your podcast', time: '3h ago', type: 'generate' },
    { avatar: 'C', text: 'Content Calendar updated — 5 posts scheduled', time: '5h ago', type: 'schedule' },
    { avatar: 'L', text: 'Logo "Brand v3" exported in 4 formats', time: '1d ago', type: 'edit' }
  ]);

  protected readonly activityColors: Record<string, string> = {
    publish: '#10B981', generate: '#7C3AED', schedule: '#6366F1', edit: '#F59E0B'
  };

  // ── Chart Analytics State ────────────────────────────────
  protected readonly chartRange = signal<'weekly' | 'monthly'>('weekly');
  protected readonly chartMetric = signal<'tasks' | 'hours'>('tasks');
  protected readonly hoverPoint = signal<{ x: number; y: number; value: number; label: string } | null>(null);

  protected readonly weeklyData = signal([
    { label: 'Mon', tasks: 3, hours: 4.2 },
    { label: 'Tue', tasks: 5, hours: 6.8 },
    { label: 'Wed', tasks: 2, hours: 3.5 },
    { label: 'Thu', tasks: 8, hours: 9.1 },
    { label: 'Fri', tasks: 6, hours: 5.5 },
    { label: 'Sat', tasks: 1, hours: 1.5 },
    { label: 'Sun', tasks: 4, hours: 4.0 }
  ]);

  protected readonly monthlyData = signal([
    { label: 'Week 1', tasks: 12, hours: 18.5 },
    { label: 'Week 2', tasks: 18, hours: 25.2 },
    { label: 'Week 3', tasks: 15, hours: 22.0 },
    { label: 'Week 4', tasks: 24, hours: 32.8 }
  ]);

  // ── Computed Values ──────────────────────────────────────
  protected readonly totalTasksCount = computed(() => this.tasks().length);
  protected readonly completedTasksCount = computed(() => this.tasks().filter(t => t.status === 'Done').length);
  protected readonly tasksProgressPercentage = computed(() => {
    const total = this.totalTasksCount();
    if (total === 0) return 0;
    return Math.round((this.completedTasksCount() / total) * 100);
  });

  protected readonly hoursTrackedFormatted = computed(() => this.workspaceHoursTracked().toFixed(1));
  
  protected readonly workspaceCredits = computed(() => {
    const id = this.activeWorkspaceId();
    if (id === 'genz-studio') return 2400;
    if (id === 'acme-agency') return 1200;
    return 500;
  });

  protected readonly stats = computed<CreatorStat[]>(() => [
    { value: `${this.completedTasksCount()}/${this.totalTasksCount()}`, label: 'Tasks Done', sub: `${this.tasksProgressPercentage()}% complete`, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: '#7C3AED', bg: '#f5f3ff' },
    { value: this.hoursTrackedFormatted(), label: 'Hours Tracked', sub: '+12% vs last week', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: '#06B6D4', bg: '#ecfeff' },
    { value: this.workspaceCredits().toLocaleString(), label: 'AI Credits', sub: 'Resets next month', icon: 'M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z', color: '#10B981', bg: '#f0fdf4' },
    { value: this.teamMembers().filter(m => m.status !== 'offline').length.toString(), label: 'Online Team', sub: 'Out of 4 members', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m20-10V9a2 2 0 00-2-2h-2m-3-4H8a4 4 0 00-4 4v2', color: '#F59E0B', bg: '#fffbeb' },
  ]);

  protected readonly trackerTimeFormatted = computed(() => {
    const s = this.trackerSeconds();
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return [hrs, mins, secs].map(v => v.toString().padStart(2, '0')).join(':');
  });

  // Filter tasks based on search string and priority
  protected readonly filteredTasks = computed(() => {
    const search = this.kanbanSearch().toLowerCase().trim();
    const prio = this.kanbanPriorityFilter();
    return this.tasks().filter(t => {
      const matchSearch = t.name.toLowerCase().includes(search) || t.project.toLowerCase().includes(search);
      const matchPrio = prio === 'All' || t.priority === prio;
      return matchSearch && matchPrio;
    });
  });

  // Sub-task lists for Kanban columns
  protected readonly tasksTodo = computed(() => this.filteredTasks().filter(t => t.status === 'Todo'));
  protected readonly tasksInProgress = computed(() => this.filteredTasks().filter(t => t.status === 'In Progress'));
  protected readonly tasksReview = computed(() => this.filteredTasks().filter(t => t.status === 'Review'));
  protected readonly tasksDone = computed(() => this.filteredTasks().filter(t => t.status === 'Done'));

  // SVG Chart Computations
  protected readonly chartPoints = computed(() => {
    const isWeekly = this.chartRange() === 'weekly';
    const isTasks = this.chartMetric() === 'tasks';
    const data = isWeekly ? this.weeklyData() : this.monthlyData();
    
    const width = 580;
    const height = 220;
    const paddingX = 40;
    const paddingY = 30;
    
    const stepX = (width - paddingX * 2) / (data.length - 1);
    const maxVal = Math.max(...data.map(d => isTasks ? d.tasks : d.hours)) || 10;
    
    return data.map((d, index) => {
      const val = isTasks ? d.tasks : d.hours;
      const x = paddingX + index * stepX;
      const y = height - paddingY - (val / maxVal) * (height - paddingY * 2);
      return { x, y, label: d.label, value: val };
    });
  });

  protected readonly chartPath = computed(() => {
    const pts = this.chartPoints();
    if (pts.length === 0) return '';
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const cpX1 = pts[i-1].x + (pts[i].x - pts[i-1].x) / 3;
      const cpY1 = pts[i-1].y;
      const cpX2 = pts[i-1].x + 2 * (pts[i].x - pts[i-1].x) / 3;
      const cpY2 = pts[i].y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pts[i].x} ${pts[i].y}`;
    }
    return path;
  });

  protected readonly chartAreaPath = computed(() => {
    const pts = this.chartPoints();
    if (pts.length === 0) return '';
    let path = this.chartPath();
    const height = 220;
    const paddingY = 30;
    path += ` L ${pts[pts.length - 1].x} ${height - paddingY}`;
    path += ` L ${pts[0].x} ${height - paddingY} Z`;
    return path;
  });

  // ── Lifecycles & Listeners ───────────────────────────────
  private workspaceListener = (event: Event) => {
    const workspaceId = (event as CustomEvent).detail;
    this.activeWorkspaceId.set(workspaceId);
    this.loadWorkspaceData(workspaceId);
  };

  private timerInterval: any;

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.addEventListener('workspaceChanged', this.workspaceListener);
    }
    this.loadWorkspaceData(this.activeWorkspaceId());
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('workspaceChanged', this.workspaceListener);
    }
    this.stopStopwatchTick();
  }

  private loadWorkspaceData(workspaceId: string): void {
    const key = `gz_tasks_${workspaceId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      this.tasks.set(JSON.parse(saved));
    } else {
      const defaults: Record<string, Task[]> = {
        'genz-studio': [
          { id: '1', name: 'Summer Vlog Thumbnail', project: 'Thumbnail Maker', assigneeId: 'sanjay', priority: 'High', status: 'Done', dueDate: '2026-07-15' },
          { id: '2', name: 'Channel Rebrand Banner', project: 'YouTube Banner', assigneeId: 'marcus', priority: 'Medium', status: 'In Progress', dueDate: '2026-07-16' },
          { id: '3', name: 'Podcast Intro Script', project: 'AI Content', assigneeId: 'aisha', priority: 'Low', status: 'Todo', dueDate: '2026-07-20' },
          { id: '4', name: 'Brand Logo v3', project: 'Logo Generator', assigneeId: 'priya', priority: 'High', status: 'Review', dueDate: '2026-07-14' },
          { id: '5', name: 'Reel Background Music', project: 'Music Library', assigneeId: 'sanjay', priority: 'Medium', status: 'Done', dueDate: '2026-07-12' }
        ],
        'acme-agency': [
          { id: '11', name: 'SaaS Social Graphics', project: 'Image Editor', assigneeId: 'marcus', priority: 'High', status: 'Todo', dueDate: '2026-07-18' },
          { id: '12', name: 'Marketing Promo Video', project: 'AI Videos', assigneeId: 'priya', priority: 'High', status: 'Review', dueDate: '2026-07-19' },
          { id: '13', name: 'Product Launch Audio', project: 'AI Audio', assigneeId: 'sanjay', priority: 'Medium', status: 'Done', dueDate: '2026-07-15' }
        ],
        'personal-space': [
          { id: '21', name: 'Portfolio Logo Idea', project: 'Logo Generator', assigneeId: 'sanjay', priority: 'Low', status: 'Todo', dueDate: '2026-07-25' },
          { id: '22', name: 'Vlog Meme Edits', project: 'Meme Library', assigneeId: 'sanjay', priority: 'Medium', status: 'In Progress', dueDate: '2026-07-28' }
        ]
      };
      const seed = defaults[workspaceId] || [];
      this.tasks.set(seed);
      localStorage.setItem(key, JSON.stringify(seed));
    }

    const savedHours = localStorage.getItem(`gz_hours_${workspaceId}`);
    this.workspaceHoursTracked.set(savedHours ? parseFloat(savedHours) : (workspaceId === 'genz-studio' ? 28.5 : (workspaceId === 'acme-agency' ? 14.2 : 4.0)));
  }

  private saveTasks(): void {
    const key = `gz_tasks_${this.activeWorkspaceId()}`;
    localStorage.setItem(key, JSON.stringify(this.tasks()));
  }

  // ── Actions ──────────────────────────────────────────────
  protected submitNewTask(e: Event): void {
    e.preventDefault();
    if (!this.newTaskName.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      name: this.newTaskName.trim(),
      project: this.newTaskProject,
      assigneeId: this.newTaskAssignee,
      priority: this.newTaskPriority,
      status: 'Todo',
      dueDate: this.newTaskDueDate || new Date().toISOString().split('T')[0]
    };

    this.tasks.update(t => [newTask, ...t]);
    this.saveTasks();
    this.addActivity(`Task "${newTask.name}" was added to To Do`, 'generate');

    // Reset Form
    this.newTaskName = '';
    this.newTaskDueDate = '';
    this.showAddTaskModal.set(false);
  }

  protected updateTaskStatus(taskId: string, newStatus: Task['status']): void {
    this.tasks.update(tasks => tasks.map(t => {
      if (t.id === taskId) {
        const updated = { ...t, status: newStatus };
        this.addActivity(`Task "${t.name}" status updated to ${newStatus}`, newStatus === 'Done' ? 'publish' : 'edit');
        return updated;
      }
      return t;
    }));
    this.saveTasks();
  }

  protected deleteTask(taskId: string): void {
    const taskToDelete = this.tasks().find(t => t.id === taskId);
    if (taskToDelete) {
      this.tasks.update(tasks => tasks.filter(t => t.id !== taskId));
      this.saveTasks();
      this.addActivity(`Task "${taskToDelete.name}" was deleted`, 'edit');
    }
  }

  // ── Stopwatch Timer Operations ────────────────────────────
  protected toggleStopwatch(): void {
    if (this.isTrackingTime()) {
      this.pauseStopwatch();
    } else {
      this.startStopwatch();
    }
  }

  private startStopwatch(): void {
    this.isTrackingTime.set(true);
    this.timerInterval = setInterval(() => {
      this.trackerSeconds.update(s => s + 1);
    }, 1000);
  }

  private pauseStopwatch(): void {
    this.isTrackingTime.set(false);
    this.stopStopwatchTick();
  }

  private stopStopwatchTick(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  protected logStopwatchTime(): void {
    this.pauseStopwatch();
    const elapsed = this.trackerSeconds();
    if (elapsed > 0) {
      const hrs = elapsed / 3600;
      this.workspaceHoursTracked.update(h => h + hrs);
      localStorage.setItem(`gz_hours_${this.activeWorkspaceId()}`, String(this.workspaceHoursTracked()));

      const taskDescription = this.trackerTaskName().trim() || 'General Creative Tasks';
      this.addActivity(`Logged ${this.trackerTimeFormatted()} on "${taskDescription}"`, 'schedule');
    }
    this.trackerSeconds.set(0);
    this.trackerTaskName.set('');
  }

  protected cancelStopwatch(): void {
    this.pauseStopwatch();
    this.trackerSeconds.set(0);
    this.trackerTaskName.set('');
  }

  // ── Helpers ──────────────────────────────────────────────
  protected getAssigneeName(assigneeId: string): string {
    const member = this.teamMembers().find(m => m.id === assigneeId);
    return member ? member.name : 'Unassigned';
  }

  protected getAssigneeAvatar(assigneeId: string): { letter: string; color: string } {
    const member = this.teamMembers().find(m => m.id === assigneeId);
    return member ? { letter: member.avatar, color: member.color } : { letter: '?', color: '#94a3b8' };
  }

  protected getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  private addActivity(text: string, type: Activity['type']): void {
    const newAct: Activity = {
      avatar: 'S',
      text,
      time: 'Just now',
      type
    };
    this.activities.update(act => [newAct, ...act.slice(0, 5)]);
  }
}

