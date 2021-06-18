export const aesthetics = [
  {
    name: 'x',
    icon: 'mdi-arrow-right',
    text: 'X coordinates of the marks, or width of horizontal "bar" and "area" without specified x2 or width',
  },
  {
    name: 'y',
    icon: 'mdi-arrow-up',
    text: 'Y coordinates of the marks, or height of vertical "bar" and "area" without specified y2 or height',
  },
  {
    name: 'x2',
    icon: 'mdi-arrow-left',
    text: 'X2 coordinates for ranged "area", "bar", "rect", and "rule"',
  },
  {
    name: 'y2',
    icon: 'mdi-arrow-down',
    text: 'Y2 coordinates for ranged "area", "bar", "rect", and "rule"',
  },
  {
    name: 'xError',
    icon: 'mdi-arrow-left-right',
    text: 'For errorbar, specifies error values extended from the center x',
  },
  {
    name: 'yError',
    icon: 'mdi-arrow-up-down',
    text: 'For errorbar, specifies error values extended from the center y',
  },
  {
    name: 'xError2',
    icon: 'mdi-arrow-left-right',
    text: 'For errorbar, specifies error values extended from the center x',
  },
  {
    name: 'yError2',
    icon: 'mdi-arrow-up-down',
    text: 'For errorbar, specifies error values extended from the center y',
  },

  // Polar Position Channels
  {
    name: 'theta',
    icon: 'mdi-angle-acute',
    text: 'For arc marks, the arc length in radians if theta2 is not specified, otherwise the start arc angle. For text marks, polar coordinate angle in radians',
  },
  {
    name: 'radius',
    icon: 'mdi-radius',
    text: 'The outer radius in pixels of arc marks',
  },
  {
    name: 'theta2',
    icon: 'mdi-angle-obtuse',
    text: 'The end angle of arc marks in radians. A value of 0 indicates up or “north”, increasing values proceed clockwise',
  },
  {
    name: 'radius2',
    icon: 'mdi-radius-outline',
    text: 'The inner radius in pixels of arc marks',
  },

  // Geographic Position Channels
  {
    name: 'longtitude',
    icon: 'mdi-earth-plus',
    text: 'Longitude position of geographically projected marks',
  },

  {
    name: 'latitude',
    icon: 'mdi-earth-minus',
    text: 'Latitude position of geographically projected marks',
  },
  {
    name: 'longtitude2',
    icon: 'mdi-earth-plus',
    text: 'Longitude-2 position for geographically projected ranged "area", "bar", "rect", and "rule"',
  },
  {
    name: 'latitude2',
    icon: 'mdi-earth-minus',
    text: 'Latitude-2 position for geographically projected ranged "area", "bar", "rect", and "rule"',
  },

  // Mark Properties Channels
  {
    name: 'color',
    icon: 'mdi-water',
    text: 'Color of the marks – either fill or stroke color based on the filled property of mark definition',
  },
  { name: 'opacity', icon: 'mdi-opacity', text: 'Opacity of the marks' },
  {
    name: 'fill',
    icon: 'mdi-format-color-fill',
    text: 'Fill color of the marks. Default value: If undefined, the default color depends on mark config’s color property',
  },
  {
    name: 'fillOpacity',
    icon: 'mdi-format-color-fill',
    text: 'Fill opacity of the marks',
  },
  {
    name: 'strokeOpacity',
    icon: 'mdi-water-plus-outline',
    text: 'Stroke opacity of the marks',
  },

  {
    name: 'strokeWidth',
    icon: 'mdi-arrow-collapse-vertical',
    text: 'Stroke width of the marks',
  },
  {
    name: 'strokeDash',
    icon: 'mdi-dots-horizontal',
    text: 'Stroke dash of the marks',
  },
  {
    name: 'size',
    icon: 'mdi-chart-bubble',
    text: 'Size of the mark. For "point", "square" and "circle", – the symbol size, or pixel area of the mark. For "bar" and "tick" – the bar and tick’s size. For "text" – the text’s font size',
  },
  {
    name: 'angle',
    icon: 'mdi-angle-right',
    text: 'Rotation angle of point and text marks',
  },
  {
    name: 'shape',
    icon: 'mdi-shape',
    text: 'Shape of the mark, "circle", "square", "cross" etc. See vega-lite docs for complete list. For geoshape marks it should be a field definition of the geojson data',
  },

  // Text and Tooltip Channels
  {
    name: 'text',
    icon: 'mdi-format-text-variant-outline',
    text: 'Text of the text mark',
  },
  {
    name: 'tooltip',
    icon: 'mdi-tooltip-text',
    text: 'The tooltip text to show upon mouse hover',
  },

  // Hyperlink Channel
  { name: 'href', icon: 'mdi-link', text: 'A URL to load upon mouse click' },

  // Level of Detail Channel
  {
    name: 'detail',
    icon: 'mdi-details',
    text: 'Additional levels of detail for grouping data in aggregate views and in line, trail, and area marks without mapping data to a specific visual channel',
  },

  // Order Channel
  {
    name: 'order',
    icon: 'mdi-order-numeric-ascending',
    text: 'Order of the marks. Stacked marks: stack order. Line and trail marks: order of data points in the lines. Otherwise, this order channel encodes layer order of the marks',
  },

  // Facet Channels
  {
    name: 'facet',
    icon: 'mdi-chart-multiple',
    text: 'A field definition for the (flexible) facet of trellis plots. If either row or column is specified, this channel will be ignored',
  },
  {
    name: 'row',
    icon: 'mdi-arrow-collapse-right',
    text: 'A field definition for the vertical facet of trellis plots',
  },

  {
    name: 'column',
    icon: 'mdi-arrow-collapse-down',
    text: 'A field definition for the horizontal facet of trellis plots',
  },
]

export const typeOptions = [
  {
    value: 'quantitative',
    text: 'Numerical',
  },
  {
    value: 'temporal',
    text: 'Date or Time',
  },
  {
    value: 'ordinal',
    text: 'Ordinal',
  },
  {
    value: 'nominal',
    text: 'Nominal',
  },
  {
    value: 'geojson',
    text: 'Geographical',
  },
]

export const aggregateOptions = [
  {
    text: 'Count',
    value: 'count',
    description:
      'The total count of data objects in the group. Note: ‘count’ operates directly on the input objects and return the same value regardless of the provided field',
  },
  {
    text: 'Valid count',
    value: 'valid',
    description:
      'The count of field values that are not null, undefined or NaN',
  },
  {
    text: 'Values',
    value: 'values',
    description: 'A list of data objects in the group',
  },
  {
    text: 'Missing count',
    value: 'missing',
    description: 'The count of field values that are null, undefined or NaN',
  },
  {
    text: 'Distinct count',
    value: 'distinct',
    description: 'The count of distinct field values',
  },
  {
    text: 'Sum',
    value: 'sum',
    description: 'The sum of field values',
  },
  {
    text: 'Product',
    value: 'product',
    description: 'The product of field values',
  },
  {
    text: 'Mean',
    value: 'mean',
    description: 'The mean (average) field value',
  },
  {
    text: 'Variance',
    value: 'variance',
    description: 'The sample variance of field values',
  },
  {
    text: 'Population variance',
    value: 'variancep',
    description: 'The population variance of field values',
  },
  {
    text: 'Standard deviation',
    value: 'stdev',
    description: 'The sample standard deviation of field values',
  },
  {
    text: 'Population standard deviation',
    value: 'stdevp',
    description: 'The population standard deviation of field values',
  },
  {
    text: 'Standard error',
    value: 'stderr',
    description: 'The standard error of field values',
  },
  {
    text: 'Median',
    value: 'median',
    description: 'The median field value',
  },
  {
    text: 'Lower quartile',
    value: 'q1',
    description: 'The lower quartile boundary of field values',
  },
  {
    text: 'Upper quartile',
    value: 'q3',
    description: 'The upper quartile boundary of field values',
  },
  {
    text: 'Lower confidence interval',
    value: 'ci0',
    description:
      'The lower boundary of the bootstrapped 95% confidence interval of the mean field value',
  },
  {
    text: 'Upper confidence interval',
    value: 'ci1',
    description:
      'The upper boundary of the bootstrapped 95% confidence interval of the mean field value',
  },
  {
    text: 'Min',
    value: 'min',
    description: 'The minimum field value',
  },
  {
    text: 'Max',
    value: 'max',
    description: 'The maximum field value',
  },
  {
    text: 'Arg min',
    value: 'argmin',
    description:
      'An input data object containing the minimum field value. Note: When used inside encoding, argmin must be specified as an object',
  },
  {
    text: 'Arg max',
    value: 'argmax',
    description:
      'An input data object containing the maximum field value. Note: When used inside encoding, argmax must be specified as an object',
  },
]

export const scaleOptions = [
  {
    text: 'Linear',
    value: 'linear',
    description: 'Linear scale',
  },
  {
    text: 'Logarithmic',
    value: 'log',
    description: 'Logarithmic (exponential) scale',
  },
]

export const timeOptions = [
  {
    text: 'Year',
    value: 'year',
    description: 'Gregorian calendar years',
  },
  {
    text: 'Quarter',
    value: 'quarter',
    description:
      'Three-month intervals, starting in one of January, April, July, and October',
  },
  {
    text: 'Month',
    value: 'month',
    description: 'Calendar months (January, February, etc.)',
  },
  {
    text: 'Date',
    value: 'date',
    description: 'Calendar day of the month (January 1, January 2, etc.)',
  },
  {
    text: 'Week',
    value: 'week',
    description:
      'Sunday-based weeks. Days before the first Sunday of the year are considered to be in week 0, the first Sunday of the year is the start of week 1, the second Sunday week 2, etc.',
  },
  {
    text: 'Day',
    value: 'day',
    description: 'Day of the week (Sunday, Monday, etc.)',
  },
  {
    text: 'Day of the year',
    value: 'dayofyear',
    description: 'Day of the year (1, 2, …, 365, etc.)',
  },
  {
    text: 'Hours',
    value: 'hours',
    description: 'Hours of the day (12:00am, 1:00am, etc.)',
  },
  {
    text: 'Minutes',
    value: 'minutes',
    description: 'Minutes in an hour (12:00, 12:01, etc.)',
  },
  {
    text: 'Seconds',
    value: 'seconds',
    description: 'Seconds in a minute (12:00:00, 12:00:01, etc.)',
  },
  {
    text: 'Milliseconds',
    value: 'milliseconds',
    description: 'Milliseconds in a second',
  },
]

// {
//   name: 'stack',
//   default: null,
//   type: 'parent',
//   vegaKey: ['stack'],
//   options: {
//     zero: 'stacking with baseline offset at zero value of the scale (for creating typical stacked bar and area chart)',
//     normalize:
//       'stacking with normalized domain (for creating normalized stacked bar and area charts',
//     center: 'stacking with center baseline (for streamgraph)',
//     false: 'No-stacking. This will produce layered bar and area chart',
//   },
//   optional: true,
// },

export const aestheticOptions = [
  {
    name: 'type',
    default: 'quantitative',
  },
  {
    name: 'aggregate',
    default: null,
  },
  {
    name: 'bin',
    default: null,
  },
  {
    name: 'maxbins',
    default: null,
  },
  {
    name: 'title',
    default: null,
  },
  {
    name: 'scale',
    default: null,
  },
  {
    name: 'timeUnit',
    default: null,
  },
]

export default {
  aesthetics,
  aggregateOptions,
  scaleOptions,
  timeOptions,
  typeOptions,
  aestheticOptions,
}
