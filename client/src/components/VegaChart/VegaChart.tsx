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
    if (!chartRef.current || !data.length) return;

    const spec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      width: 'container',
      height: 300,
      data: { values: data },
      mark: options.type,
      encoding: {
        x: {
          field: options.xField || fields[0].name,
          type: fields.find(f => f.name === options.xField)?.type === 'number' ? 'quantitative' : 'nominal',
          axis: { labelAngle: -45 }
        },
        y: {
          field: options.yField,
          aggregate: options.aggregation,
          type: 'quantitative',
          title: `${options.aggregation} of ${options.yField}`
        },
        ...(options.color && {
          color: {
            field: options.color,
            type: 'nominal'
          }
        }),
        ...(options.groupBy && {
          column: {
            field: options.groupBy,
            type: 'nominal'
          }
        })
      }
    };

    embed(chartRef.current, spec, {
      actions: false,
      theme: 'light'
    }).catch(console.error);
  }, [data, fields, options]);

  return (
    <div className="vega-chart">
      <div ref={chartRef} className="chart-container" />
    </div>
  );
}; 