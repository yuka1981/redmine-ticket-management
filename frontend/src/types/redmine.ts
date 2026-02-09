// Redmine API response types

export interface RedmineUser {
  id: number;
  login: string;
  firstname: string;
  lastname: string;
  mail: string;
  created_on: string;
  updated_on: string;
  api_key?: string;
}

export interface NamedId {
  id: number;
  name: string;
}

export interface RedmineIssue {
  id: number;
  project: NamedId;
  tracker: NamedId;
  status: NamedId;
  priority: NamedId;
  author: NamedId;
  assigned_to?: NamedId;
  category?: NamedId;
  fixed_version?: NamedId;
  parent?: { id: number };
  subject: string;
  description: string;
  start_date?: string;
  due_date?: string;
  done_ratio: number;
  is_private: boolean;
  estimated_hours?: number;
  spent_hours?: number;
  created_on: string;
  updated_on: string;
  closed_on?: string;
  journals?: RedmineJournal[];
  attachments?: RedmineAttachment[];
  custom_fields?: RedmineCustomField[];
}

export interface RedmineJournal {
  id: number;
  user: NamedId;
  notes: string;
  created_on: string;
  details: RedmineJournalDetail[];
}

export interface RedmineJournalDetail {
  property: string;
  name: string;
  old_value?: string;
  new_value?: string;
}

export interface RedmineAttachment {
  id: number;
  filename: string;
  filesize: number;
  content_type: string;
  description: string;
  content_url: string;
  author: NamedId;
  created_on: string;
}

export interface RedmineCustomField {
  id: number;
  name: string;
  value: string | string[];
  multiple?: boolean;
}

export interface RedmineProject {
  id: number;
  name: string;
  identifier: string;
  description: string;
  status: number;
  is_public: boolean;
  created_on: string;
  updated_on: string;
  trackers?: NamedId[];
  issue_categories?: NamedId[];
}

export interface RedmineStatus {
  id: number;
  name: string;
  is_closed: boolean;
  position: number;
}

export interface RedminePriority {
  id: number;
  name: string;
  is_default: boolean;
  position: number;
}

export interface RedmineTracker {
  id: number;
  name: string;
  default_status?: NamedId;
}

export interface RedmineVersion {
  id: number;
  project: NamedId;
  name: string;
  description: string;
  status: string;
  due_date?: string;
  created_on: string;
  updated_on: string;
}

// API response wrappers (aligned with backend serializers)
export interface PaginatedResponse<T> {
  items: T[];
  total_count: number;
  offset: number;
  limit: number;
}

export interface TicketsResponse {
  tickets: RedmineIssue[];
  total_count: number;
  offset: number;
  limit: number;
}

export interface TicketResponse {
  ticket: RedmineIssue;
}

export interface ProjectsResponse {
  projects: RedmineProject[];
  total_count: number;
  offset: number;
  limit: number;
}

// Dashboard types (aligned with DashboardSerializer)
export interface DashboardResponse {
  dashboard: DashboardStats;
}

export interface DashboardStats {
  counts_by_status: Record<string, number>;
  counts_by_priority: Record<string, number>;
  overdue_count: number;
  total_assigned: number;
  recent_activity: DashboardActivity[];
}

export interface DashboardActivity {
  id: number;
  subject: string;
  status: string;
  priority: string;
  updated_on: string;
  project: string;
}

// Auth types
export interface AuthCredentials {
  redmineUrl: string;
  apiKey: string;
}

export interface AuthVerifyResponse {
  authenticated: boolean;
  user: RedmineUser;
}

// Issue mutation types
export interface CreateIssueParams {
  project_id: number;
  tracker_id: number;
  status_id?: number;
  priority_id: number;
  subject: string;
  description?: string;
  assigned_to_id?: number;
  parent_issue_id?: number;
  start_date?: string;
  due_date?: string;
  estimated_hours?: number;
  done_ratio?: number;
  category_id?: number;
  fixed_version_id?: number;
}

export interface UpdateIssueParams extends Partial<CreateIssueParams> {
  notes?: string;
}

// Filter and query types
export type IssueScope = 'assigned_to_me' | 'created_by_me' | 'watched';

export interface IssueFilters {
  scope: IssueScope;
  project_id?: number;
  status_id?: number | 'open' | 'closed' | '*';
  tracker_id?: number;
  priority_id?: number;
  sort?: string;
  page?: number;
  per_page?: number;
}
