interface Field {
  name: string;
  type: string;
}

export const inferChartType = (data: any[], fields: Field[]) => {
  const numericFields = fields.filter(f => f.type === 'number');
  const categoricalFields = fields.filter(f => f.type === 'string');
  const temporalFields = fields.filter(f => f.type === 'date');

  // Bar chart for categorical + numeric
  if (categoricalFields.length && numericFields.length) {
    return {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { values: data },
      mark: 'bar',
      encoding: {
        x: { field: categoricalFields[0].name, type: 'nominal' },
        y: { field: numericFields[0].name, type: 'quantitative' },
        tooltip: [
          { field: categoricalFields[0].name, type: 'nominal' },
          { field: numericFields[0].name, type: 'quantitative' }
        ]
      }
    };
  }

  // Line chart for temporal + numeric
  if (temporalFields.length && numericFields.length) {
    return {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { values: data },
      mark: 'line',
      encoding: {
        x: { field: temporalFields[0].name, type: 'temporal' },
        y: { field: numericFields[0].name, type: 'quantitative' },
        tooltip: [
          { field: temporalFields[0].name, type: 'temporal' },
          { field: numericFields[0].name, type: 'quantitative' }
        ]
      }
    };
  }

  // Scatter plot for two numeric fields
  if (numericFields.length >= 2) {
    return {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { values: data },
      mark: 'point',
      encoding: {
        x: { field: numericFields[0].name, type: 'quantitative' },
        y: { field: numericFields[1].name, type: 'quantitative' },
        tooltip: [
          { field: numericFields[0].name, type: 'quantitative' },
          { field: numericFields[1].name, type: 'quantitative' }
        ]
      }
    };
  }

  // Fallback to table view
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { values: data },
    mark: 'text',
    encoding: {
      text: { field: fields[0].name }
    }
  };
}; 