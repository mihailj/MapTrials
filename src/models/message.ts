import { User } from './user';

export interface Message {
  id?: number;
  uid?: string;
  type?: string;
  subject?: string;
  body?: string;
  user_id?: number;
  recipient_id?: number;
  to?: string[];
  reply_to?: number;
  user_sender?: User,
  user_recipient?: User
}
