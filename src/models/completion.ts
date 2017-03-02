import { User } from './user';

export interface Completion {
  id: number;
  objective_photo: string;
  user_id: number;
  user_comment: string;
  score: number;
  mt_users: User[];
}
