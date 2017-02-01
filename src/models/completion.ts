import { User } from './user';

export interface Completion {
  id: number;
  objective_photo: string;
  user_id: number;
  user_comment: string;
  mt_users: User[];
}
