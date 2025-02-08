import React, { useEffect, useRef } from 'react';
import './VegaChart.css';
import embed from 'vega-embed';
import { ChartOptions } from '../../types';

interface VegaChartProps {
  data: any[];
  fields: {
    name: string;
    type: string;
  }[];
  options: ChartOptions;
}

export const VegaChart: React.FC<VegaChartProps> = ({ data, fields, options }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !data.length || !options.xField) return;

    const getFieldType = (fieldName: string) => {
      const field = fields.find(f => f.name === fieldName);
      if (!field) return 'nominal';
      
      switch (field.type) {
        case 'number':
          return 'quantitative';
        case 'date':
          return 'temporal';
        default:
          return 'nominal';
      }
    };

    const spec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      width: 'container',
      height: 300,
      data: { values: data },
      mark: options.type,
      encoding: {
        x: {
          field: options.xField,
          type: getFieldType(options.xField),
          axis: { labelAngle: -45 }
        },
        y: options.aggregation === 'count' 
          ? { aggregate: 'count' }
          : {
              field: options.yField,
              aggregate: options.aggregation,
              type: getFieldType(options.yField)
            },
        ...(options.color && {
          color: {
            field: options.color,
            type: getFieldType(options.color)
          }
        })
      }
    };

    embed(chartRef.current, spec, {
      actions: false,
      theme: 'light'
    }).catch(error => {
      console.error('Chart rendering error:', error);
    });
  }, [data, fields, options]);

  return (
    <div className="vega-chart">
      <div ref={chartRef} className="chart-container" />
    </div>
  );
}; 