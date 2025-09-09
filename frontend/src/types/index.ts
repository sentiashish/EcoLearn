export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  is_email_verified: boolean;
  is_active: boolean;
  date_joined: string;
  profile?: UserProfile;
  teacher_profile?: TeacherProfile;
}

export interface UserProfile {
  id: number;
  bio?: string;
  avatar?: string;
  date_of_birth?: string;
  phone_number?: string;
  grade_level?: string;
  created_at: string;
  updated_at: string;
}

export interface TeacherProfile {
  id: number;
  employee_id?: string;
  department?: string;
  subjects: string[];
  years_of_experience: number;
  qualifications?: string;
  is_verified: boolean;
  verification_date?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: 'student' | 'teacher' | 'admin';
    is_email_verified: boolean;
  };
}

export interface Content {
  id: number;
  title: string;
  description: string;
  content_type: 'lesson' | 'tutorial' | 'article';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration: number;
  content_data: any;
  author: User;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  tags: string[];
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  problem_statement: string;
  examples: ChallengeExample[];
  hints: string[];
  test_cases: TestCase[];
  solution_code?: string;
  author: User;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  tags: string[];
  points: number;
}

export interface ChallengeExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  input: string;
  expected_output: string;
  is_hidden: boolean;
}

export interface Submission {
  id: number;
  challenge: number;
  user: User;
  code: string;
  language: string;
  status: 'pending' | 'running' | 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'runtime_error' | 'compilation_error';
  score: number;
  execution_time?: number;
  memory_used?: number;
  test_results: TestResult[];
  submitted_at: string;
}

export interface TestResult {
  test_case_id: number;
  status: 'passed' | 'failed' | 'error';
  actual_output?: string;
  execution_time?: number;
  error_message?: string;
}

export interface UserProgress {
  id: number;
  user: number;
  total_points: number;
  level: number;
  experience_points: number;
  challenges_solved: number;
  content_completed: number;
  streak_days: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: string;
  criteria: any;
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: number;
  user: number;
  achievement: Achievement;
  earned_at: string;
  progress: number;
}

export interface LeaderboardEntry {
  user: User;
  total_points: number;
  level: number;
  challenges_solved: number;
  rank: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirm: string;
  role: 'student' | 'teacher';
}

export interface SubmissionForm {
  code: string;
  language: string;
}

// UI types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface PosterGridItem {
  id: number;
  title: string;
  description: string;
  image?: string;
  category: string;
  difficulty?: string;
  points?: number;
  href: string;
}