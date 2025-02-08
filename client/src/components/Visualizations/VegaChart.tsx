import React, { useEffect, useRef } from 'react';
import * as vega from 'vega';
import * as vegaLite from 'vega-lite';
import vegaEmbed from 'vega-embed';
import { inferChartType } from './chartUtils';
import './VegaChart.css';

interface VegaChartProps {
  data: any[];
  fields: {
    name: string;
    type: string;
  }[];
}

export const VegaChart: React.FC<VegaChartProps> = ({ data, fields }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data.length || !chartRef.current) return;

    const spec = inferChartType(data, fields);
    
    vegaEmbed(chartRef.current, spec, {
      actions: true,
      theme: 'dark'
    }).catch(console.error);
  }, [data, fields]);

  return (
    <div className="vega-chart">
      <div ref={chartRef} />
    </div>
  );
}; 