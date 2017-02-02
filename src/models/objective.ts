import { Completion } from './completion';
import { User } from './user';

export interface Objective {
  id: number;
  title: string;
  score: number;
  distance: number;
  completed: string;
  objective_photo: string;
  mt_completions: Completion[];
  mt_user: User
}
