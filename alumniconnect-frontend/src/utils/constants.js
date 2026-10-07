export const API_BASE_URL = '/api';

export const ROLES = {
  STUDENT: 'ROLE_STUDENT',
  ALUMNI: 'ROLE_ALUMNI',
  ADMIN: 'ROLE_ADMIN'
};

export const MENTORSHIP_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const APPLICATION_STATUS = {
  APPLIED: 'APPLIED',
  REVIEWED: 'REVIEWED',
  SHORTLISTED: 'SHORTLISTED',
  REJECTED: 'REJECTED'
};

export const REFERRAL_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED'
};

export const EMPLOYMENT_TYPES = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'REMOTE', label: 'Remote' }
];

export const EVENT_TYPES = [
  { value: 'MEETUP', label: 'Alumni Meetup' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'CAREER_GUIDANCE', label: 'Career Guidance' },
  { value: 'MOCK_INTERVIEW', label: 'Mock Interview' },
  { value: 'WEBINAR', label: 'Webinar' },
  { value: 'NETWORKING', label: 'Networking' }
];

export const POST_CATEGORIES = [
  { value: 'INTERVIEW_EXPERIENCE', label: 'Interview Experience' },
  { value: 'CAREER_ADVICE', label: 'Career Advice' },
  { value: 'TECHNICAL_ARTICLE', label: 'Technical Article' },
  { value: 'RESUME_TIPS', label: 'Resume Tips' },
  { value: 'INDUSTRY_INSIGHTS', label: 'Industry Insights' }
];
