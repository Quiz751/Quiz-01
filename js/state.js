// Application State and Data are centralized here to be shared across modules.

export let currentRoute = '/';
export let currentTheme = localStorage.getItem('theme') || 'dark';
export let isScrolled = false;
export let isMobileMenuOpen = false;
export let activeAuthTab = 'login';
export let activeLeaderboardFilter = 'weekly';
export let avatarPreview = null;
export let settingsAvatarPreview = null;
export let showPassword = false;
export let notifications = {
  email: true,
  push: false,
  streak: true,
  achievements: true
};

export const appData = {
  user: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'JD',
    xp: 1250,
    level: 12,
    streak: 7,
    memberSince: 'January 2024',
    role: 'Advanced Learner',
    focus: 'Computer Science'
  },
  stats: [
    { icon: '🔥', value: '7', label: 'Day Streak' },
    { icon: '⭐', value: '1,250', label: 'XP Points' },
    { icon: '🎯', value: '15', label: 'Quizzes Completed' },
    { icon: '🏆', value: '#5', label: 'Global Rank' }
  ],
  recentActivity: [
    { subject: 'JavaScript Fundamentals', score: 85, date: '2 hours ago' },
    { subject: 'Data Structures', score: 92, date: 'Yesterday' },
    { subject: 'Algorithms', score: 78, date: '2 days ago' },
    { subject: 'System Design', score: 88, date: '3 days ago' }
  ],
  podiumPlayers: [
    { name: 'Maria Johnson', xp: 2890, avatar: 'MJ', position: 1 },
    { name: 'Alex Smith', xp: 2450, avatar: 'AS', position: 2 },
    { name: 'David Lee', xp: 2120, avatar: 'DL', position: 3 }
  ],
  rankings: [
    { position: 4, name: 'Sarah Kim', subject: 'Computer Science', streak: 15, xp: 1980, trend: 'up', change: 50 },
    { position: 5, name: 'John Doe', subject: 'Software Engineering', streak: 7, xp: 1850, trend: 'down', change: 25 },
    { position: 6, name: 'Emma Martinez', subject: 'Data Science', streak: 12, xp: 1720, trend: 'up', change: 75 },
    { position: 7, name: 'Ryan Taylor', subject: 'Cybersecurity', streak: 3, xp: 1650, trend: 'neutral', change: 0 },
    { position: 8, name: 'Lisa Wang', subject: 'Machine Learning', streak: 20, xp: 1580, trend: 'up', change: 120 }
  ],
  subjects: [
    { id: 'algorithms', title: 'Algorithms & Data Structures', description: 'Master the fundamentals of computer science with sorting, searching, and optimization techniques.', icon: '💻', progress: 75, quizzes: 24, difficulty: 'Intermediate', color: 'var(--primary)' },
    { id: 'databases', title: 'Database Systems', description: 'Learn SQL, NoSQL, and database design principles for modern applications.', icon: '🗄️', progress: 60, quizzes: 18, difficulty: 'Beginner', color: 'var(--accent)' },
    { id: 'operating-systems', title: 'Operating Systems', description: 'Understand process management, memory allocation, and system architecture.', icon: '⚙️', progress: 45, quizzes: 21, difficulty: 'Advanced', color: 'var(--success)' },
    { id: 'cybersecurity', title: 'Cybersecurity', description: 'Explore network security, encryption, and ethical hacking techniques.', icon: '🛡️', progress: 30, quizzes: 15, difficulty: 'Advanced', color: 'var(--danger)' },
    { id: 'machine-learning', title: 'Machine Learning', description: 'Dive into AI algorithms, neural networks, and predictive modeling.', icon: '🧠', progress: 85, quizzes: 27, difficulty: 'Advanced', color: 'var(--warning)' },
    { id: 'web-development', title: 'Web Development', description: 'Build modern web applications with HTML, CSS, JavaScript, and frameworks.', icon: '🌐', progress: 90, quizzes: 32, difficulty: 'Intermediate', color: 'var(--info)' }
  ],
  achievements: [
    { icon: '🎯', title: 'Perfect Score', description: 'Scored 100% on 5 quizzes' },
    { icon: '🔥', title: 'Week Warrior', description: '7-day learning streak' },
    { icon: '📚', title: 'Subject Master', description: 'Completed JavaScript track' },
    { icon: '⚡', title: 'Speed Demon', description: 'Answered 10 questions in 30 seconds' }
  ],
  leaderboardStats: [
    { icon: '🏆', value: '2,890', label: 'Top Score' },
    { icon: '👥', value: '15,234', label: 'Active Players' },
    { icon: '🔥', value: '42', label: 'Day Streak Record' }
  ]
};

// Simple setters to keep reactive values in sync across modules
export function setCurrentRoute(route) { currentRoute = route; }
export function setCurrentTheme(theme) { currentTheme = theme; }
export function setIsScrolled(val) { isScrolled = val; }
export function setIsMobileMenuOpen(val) { isMobileMenuOpen = val; }
export function setActiveAuthTab(val) { activeAuthTab = val; }
export function setActiveLeaderboardFilter(val) { activeLeaderboardFilter = val; }
export function setAvatarPreview(val) { avatarPreview = val; }
export function setSettingsAvatarPreview(val) { settingsAvatarPreview = val; }
export function setShowPassword(val) { showPassword = val; }

