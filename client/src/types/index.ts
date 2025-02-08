export interface DataSource {
  id: string;
  name: string;
  type: string;
  lastUpdated: Date;
  fields: {
    name: string;
    type: string;
  }[];
}

export interface ChartOptions {
  type: 'bar' | 'line' | 'area' | 'point' | 'circle';
  xField: string;
  yField: string;
  aggregation: 'count' | 'sum' | 'mean' | 'min' | 'max' | 'median';
  color: string;
  groupBy: string;
} 