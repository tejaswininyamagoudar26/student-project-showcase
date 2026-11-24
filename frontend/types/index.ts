export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'admin';
  avatar_url?: string | null;
  bio?: string | null;
  college?: string | null;
  department?: string | null;
  graduation_year?: number | null;
  skills?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserPublic {
  id: number;
  name: string;
  role: string;
  avatar_url?: string | null;
  bio?: string | null;
  college?: string | null;
  department?: string | null;
  graduation_year?: number | null;
  skills?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  created_at: string;
}

export interface Project {
  id: number;
  title: string;
  short_description?: string | null;
  description?: string | null;
  problem_statement?: string | null;
  proposed_solution?: string | null;
  category?: string | null;
  technology?: string | null;
  github_url?: string | null;
  demo_url?: string | null;
  image_url?: string | null;
  screenshots?: string | null;
  status: 'draft' | 'published';
  is_featured: boolean;
  is_hidden: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
  likes_count: number;
  favorites_count: number;
  comments_count: number;
  owner_name?: string | null;
  owner_avatar?: string | null;
  is_liked?: boolean;
  is_favorited?: boolean;
  owner?: UserPublic | null;
}

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Comment {
  id: number;
  project_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_avatar?: string | null;
  user_role?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  created_at: string;
}

export interface DashboardStats {
  total_projects: number;
  published_projects: number;
  draft_projects: number;
  total_likes: number;
  total_favorites: number;
}

export interface AdminStats {
  total_users: number;
  total_projects: number;
  published_projects: number;
  pending_reports: number;
  total_categories: number;
}

export interface ProjectReport {
  id: number;
  project_id: number;
  user_id: number;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  created_at: string;
  project_title?: string;
  reporter_name?: string;
}
