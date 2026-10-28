export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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

export const EMPLOYMENT_TYPES = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
  REMOTE: 'Remote'
};

export const EVENT_TYPES = {
  MEETUP: 'Alumni Meetup',
  WORKSHOP: 'Workshop',
  CAREER_GUIDANCE: 'Career Guidance',
  MOCK_INTERVIEW: 'Mock Interview',
  WEBINAR: 'Webinar',
  NETWORKING: 'Networking'
};

export const POST_CATEGORIES = {
  INTERVIEW_EXPERIENCE: 'Interview Experience',
  CAREER_ADVICE: 'Career Advice',
  TECHNICAL_ARTICLE: 'Technical Article',
  RESUME_TIPS: 'Resume Tips',
  INDUSTRY_INSIGHTS: 'Industry Insights'
};
