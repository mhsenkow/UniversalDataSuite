export type QueryOperator = 
  | 'equals' 
  | 'contains' 
  | 'greater_than' 
  | 'less_than'
  | 'between'
  | 'starts_with'
  | 'ends_with';

export interface QueryCondition {
  field: string;
  operator: QueryOperator;
  value: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'live' | 'snapshot';
  lastUpdated: Date;
  fields: {
    name: string;
    type: 'string' | 'number' | 'date' | 'boolean';
  }[];
} 