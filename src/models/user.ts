import { Completion } from './completion';

export interface User {
  id: number;
  username: string;
  score: number;
  objectives_completed: number;
  mt_completions: Array<Completion>;
  mt_tracking_sessions?: any;
  isTracking?: boolean
}
