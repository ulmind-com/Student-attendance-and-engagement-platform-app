const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://kids-attendance-production.up.railway.app';

export interface Student {
  rollNumber: string;
  firstName: string;
  lastInitial: string;
  class: string;
  class_name?: string;
  otp: string;
  parentConsent: boolean;
  status: 'active' | 'inactive';
  risk?: 'Stable' | 'Needs Attention' | 'Emotional Drop' | 'High Risk' | 'Moderate Risk' | 'Urgent Assistance';
  profilePhoto?: string;
  timeline?: Array<{
    day: string;
    date: string;
    score: number;
    emoji: string;
    status: 'present' | 'absent';
    alert?: boolean;
    time?: string;
    emotions?: string[];
    journal_text?: string;
  }>;
}

export interface OTPConfig {
  expiration_hours: number;
  time_range_enabled: boolean;
  start_time: string;
  end_time: string;
}

export interface BrandingConfig {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  visual_style: string;
  dark_mode: boolean;
}

export interface QuestionConfig {
  id: string;
  text: string;
  emoji: string;
  category: string;
}

export const api = {
  // --- STUDENTS ---
  async getStudents(): Promise<Student[]> {
    const res = await fetch(`${API_URL}/students`);
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  },

  async createStudent(student: Partial<Student>): Promise<Student> {
    const res = await fetch(`${API_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    });
    if (!res.ok) throw new Error('Failed to create student');
    return res.json();
  },

  async updateStudent(rollNumber: string, student: Partial<Student>): Promise<Student> {
    const res = await fetch(`${API_URL}/students/${rollNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    });
    if (!res.ok) throw new Error('Failed to update student');
    return res.json();
  },

  async deleteStudent(rollNumber: string): Promise<boolean> {
    const res = await fetch(`${API_URL}/students/${rollNumber}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete student');
    return true;
  },

  // --- CLASSES ---
  async getClasses(): Promise<any> {
    const res = await fetch(`${API_URL}/settings/classes`);
    if (!res.ok) throw new Error('Failed to fetch classes');
    return res.json();
  },

  async saveClasses(payload: any): Promise<any> {
    const res = await fetch(`${API_URL}/settings/classes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save classes');
    return res.json();
  },

  // --- OTPs ---
  async getOtpsList(): Promise<any[]> {
    const res = await fetch(`${API_URL}/otps/list`);
    if (!res.ok) throw new Error('Failed to fetch OTPs list');
    return res.json();
  },

  async getOtpsHistory(): Promise<any[]> {
    const res = await fetch(`${API_URL}/otps/history`);
    if (!res.ok) throw new Error('Failed to fetch OTPs history');
    return res.json();
  },

  async getOtpConfig(): Promise<OTPConfig> {
    const res = await fetch(`${API_URL}/settings/otp-config`);
    if (!res.ok) throw new Error('Failed to fetch OTP config');
    return res.json();
  },

  async saveOtpConfig(config: OTPConfig): Promise<OTPConfig> {
    const res = await fetch(`${API_URL}/settings/otp-config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Failed to save OTP config');
    return res.json();
  },

  async generateBulkOtps(payload: { action: 'all' | 'class'; class_name?: string; section_name?: string }): Promise<any> {
    const res = await fetch(`${API_URL}/otps/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to generate bulk OTPs');
    return res.json();
  },

  async generateStudentOtp(roll: string, customOtp?: string): Promise<any> {
    const res = await fetch(`${API_URL}/otps/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'student', roll_number: roll, custom_otp: customOtp }),
    });
    if (!res.ok) throw new Error('Failed to generate student OTP');
    return res.json();
  },

  // --- BRANDING ---
  async getBranding(): Promise<BrandingConfig> {
    const res = await fetch(`${API_URL}/settings/branding`);
    if (!res.ok) throw new Error('Failed to fetch branding config');
    return res.json();
  },

  async saveBranding(config: BrandingConfig): Promise<BrandingConfig> {
    const res = await fetch(`${API_URL}/settings/branding`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Failed to save branding config');
    return res.json();
  },

  // --- SCHOOL INFO ---
  async getSchoolInfo(): Promise<any> {
    const res = await fetch(`${API_URL}/settings/school`);
    if (!res.ok) throw new Error('Failed to fetch school info');
    return res.json();
  },

  async saveSchoolInfo(info: any): Promise<any> {
    const res = await fetch(`${API_URL}/settings/school`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(info),
    });
    if (!res.ok) throw new Error('Failed to save school info');
    return res.json();
  },

  // --- EMOTIONAL QUESTIONS ---
  async getQuestions(): Promise<QuestionConfig[]> {
    const res = await fetch(`${API_URL}/settings/emotional-questions`);
    if (!res.ok) throw new Error('Failed to fetch emotional questions');
    return res.json();
  },

  async saveQuestions(questions: QuestionConfig[]): Promise<QuestionConfig[]> {
    const res = await fetch(`${API_URL}/settings/emotional-questions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questions),
    });
    if (!res.ok) throw new Error('Failed to save emotional questions');
    return res.json();
  },

  // --- NOTIFICATIONS ---
  async getNotifications(): Promise<any> {
    const res = await fetch(`${API_URL}/settings/notifications`);
    if (!res.ok) throw new Error('Failed to fetch notifications config');
    return res.json();
  },

  async saveNotifications(config: any): Promise<any> {
    const res = await fetch(`${API_URL}/settings/notifications`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Failed to save notifications config');
    return res.json();
  },

  // --- AI INSIGHTS ---
  async getAiInsightsConfig(): Promise<any> {
    const res = await fetch(`${API_URL}/settings/ai-insights`);
    if (!res.ok) throw new Error('Failed to fetch AI insights config');
    return res.json();
  },

  async saveAiInsightsConfig(config: any): Promise<any> {
    const res = await fetch(`${API_URL}/settings/ai-insights`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Failed to save AI insights config');
    return res.json();
  },

  // --- SECURITY ---
  async getSecurityConfig(): Promise<any> {
    const res = await fetch(`${API_URL}/settings/security`);
    if (!res.ok) throw new Error('Failed to fetch security config');
    return res.json();
  },

  async saveSecurityConfig(config: any): Promise<any> {
    const res = await fetch(`${API_URL}/settings/security`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Failed to save security config');
    return res.json();
  },

  // --- ADVANCED ---
  async getAdvancedConfig(): Promise<any> {
    const res = await fetch(`${API_URL}/settings/advanced`);
    if (!res.ok) throw new Error('Failed to fetch advanced config');
    return res.json();
  },

  async saveAdvancedConfig(config: any): Promise<any> {
    const res = await fetch(`${API_URL}/settings/advanced`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Failed to save advanced config');
    return res.json();
  },

  async resetData(): Promise<any> {
    const res = await fetch(`${API_URL}/settings/advanced/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset data');
    return res.json();
  },

  // --- ADMIN USERS ---
  async getAdminUsers(): Promise<any[]> {
    const res = await fetch(`${API_URL}/settings/admin-users`);
    if (!res.ok) throw new Error('Failed to fetch admin users');
    return res.json();
  },

  async saveAdminUsers(users: any[]): Promise<any[]> {
    const res = await fetch(`${API_URL}/settings/admin-users`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(users),
    });
    if (!res.ok) throw new Error('Failed to save admin users');
    return res.json();
  }
};
