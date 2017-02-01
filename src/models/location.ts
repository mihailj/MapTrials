import { Objective } from './objective';

export interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  mt_objectives: Array<Objective>;
}
