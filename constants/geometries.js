export const geometries = [
  {
    value: 'arc',
    text: 'Arc',
    icon: 'mdi-chart-arc',
    description:
      'Arc marks are circular arcs defined by a center point plus angular and radial extents. Arc marks are typically used for radial plots such as pie and donut charts',
    defaultAesthetics: ['theta', 'color'],
    options: [
      {
        value: 'innerRadius',
        vegaKey: ['innerRadius'],
        default: null,
        type: 'textBoxNumber',
      },
      {
        value: 'outerRadius',
        vegaKey: ['outerRadius'],
        default: null,
        type: 'textBoxNumber',
      },
    ],
  },
  {
    value: 'area',
    text: 'Area',
    icon: 'mdi-chart-areaspline',
    description:
      'Area graphs represent multiple data elements as a single area shape. Area marks are often used to show change over time, using either a single area or stacked areas',
    defaultAesthetics: ['x', 'y', 'color'],
    options: [],
  },
  {
    value: 'bar',
    text: 'Bar',
    icon: 'mdi-chart-bar',
    description:
      'Bar marks are useful in many visualizations, including bar charts, stacked bar charts, and timelines',
    defaultAesthetics: ['x', 'y', 'color'],
    options: [],
  },
  {
    value: 'boxPlot',
    text: 'Box Plot',
    icon: 'mdi-chart-timeline',
    description:
      'A box plot summarizes a distribution of quantitative values using a set of summary statistics. The median tick in the box represents the median. The lower and upper parts of the box represent the first and third quartile respectively',
    defaultAesthetics: ['x', 'y', 'color'],
    options: [],
  },
  {
    value: 'circle',
    text: 'Circle',
    icon: 'mdi-chart-scatter-plot',
    description:
      'A circle mark is similar to point mark, except that (1) the shape value is always set to circle (2) they are filled by default',
    defaultAesthetics: ['x', 'y', 'size', 'color'],
    options: [],
  },
  {
    value: 'errorband',
    text: 'Error Band',
    icon: 'mdi-chart-gantt',
    description:
      'An error band summarizes an error range of quantitative values using a set of summary statistics, representing by area. Error band in Vega-Lite can either be used to aggregate raw data or directly visualize aggregated data',
    defaultAesthetics: ['x', 'y', 'color', 'x2', 'y2'],
    options: [],
  },
  {
    value: 'errorbar',
    text: 'Error Bar',
    icon: 'mdi-chart-gantt',
    description:
      'An error bar summarizes an error range of quantitative values using a set of summary statistics, representing by rules (and optional end ticks)',
    defaultAesthetics: ['x', 'y', 'color', 'x2', 'y2'],
    options: [],
  },
  {
    value: 'geoshape',
    text: 'Geo Shape',
    icon: 'mdi-earth',
    description:
      'Represents an arbitrary shapes whose geometry is determined by specified TopoJSON/GeoJSON shape data that is projected from geographical coordinates to pixels',
    defaultAesthetics: ['shape', 'color'],
    options: [
      {
        value: 'filled',
        vegaKey: ['filled'],
        default: false,
        type: 'checkBox',
      },
      {
        value: 'strokeWidth',
        vegaKey: ['outerRadius'],
        default: 1,
        type: 'textBoxNumber',
      },
    ],
  },
  {
    value: 'line',
    text: 'Line',
    icon: 'mdi-chart-line',
    description:
      'The line mark represents the data points stored in a field with a line connecting all of these points. The line mark represents multiple data element as a single line, akin to area and trail',
    defaultAesthetics: ['x', 'y', 'color'],
    options: [],
  },
  {
    value: 'point',
    text: 'Point',
    icon: 'mdi-chart-scatter-plot',
    description:
      'A point mark represents each data point with a symbol. Point marks are commonly used in visualizations like scatterplots',
    defaultAesthetics: ['x', 'y', 'size', 'color'],
    options: [],
  },
  {
    value: 'rect',
    text: 'Rectangle',
    icon: 'mdi-rectangle',
    description:
      'The rect mark represents an arbitrary rectangle. This can be used to create heatmaps or to show ranges on other plots',
    defaultAesthetics: ['x', 'y', 'size', 'color'],
    options: [],
  },
  {
    value: 'rule',
    text: 'Rule',
    icon: 'mdi-segment',
    description:
      'The rule mark represents each data point as a line segment. It can be used in two ways. First, as a line segment that spans the complete width or height of a view. Second, a rule can be used to draw a line segment between two positions',
    defaultAesthetics: ['x', 'y', 'color', 'x2', 'y2'],
    options: [],
  },
  {
    value: 'square',
    text: 'Square',
    description:
      'Square marks are similar to point marks, except that (1) the shape value is always set to square (2) they are filled by default',
    icon: 'mdi-square',
    defaultAesthetics: ['x', 'y', 'size', 'color'],
    options: [],
  },
  {
    value: 'text',
    text: 'Text',
    icon: 'mdi-format-color-text',
    description:
      'A text mark represents each data point with a text instead of a point',
    defaultAesthetics: ['text', 'x', 'y', 'color'],
    options: [],
  },
  {
    value: 'tick',
    text: 'Tick',
    icon: 'mdi-segment',
    description:
      'The tick mark represents each data point as a short line. This is a useful mark for displaying the distribution of values in a field',
    defaultAesthetics: ['x', 'y'],
    options: [],
  },
  {
    value: 'trail',
    text: 'Trail',
    description:
      'The trail mark represents the data points stored in a field with a line connecting all of these points. Trail is similar to the line mark but a trail can have variable widths determined by backing data',
    icon: 'mdi-chart-line-stacked',
    defaultAesthetics: ['x', 'y', 'size', 'color'],
    options: [],
  },
]
