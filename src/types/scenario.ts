import { Process } from './process';

export interface Scenario {
  id: string;
  name: string;
  description: string;
  category: 'Textbook' | 'Edge Case' | 'Phenomenon' | 'Custom';
  processes: Process[];
  defaultAlgorithm?: string;
  defaultQuantum?: number;
}
