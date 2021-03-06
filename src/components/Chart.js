import React from 'react';
import { connect } from 'react-redux';

import payments from '../selectors/payments';

import { select } from 'd3-selection';
import { line } from 'd3-shape';
import { scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import 'd3-transition';


const margin = { top: 20, right: 20, bottom: 20, left: 80 },
  fullWidth = 800,
  fullHeight = 300,
  width = fullWidth - margin.left - margin.right,
  height = fullHeight - margin.top - margin.bottom;

const x = scaleLinear()
  .range([0, width]);

const y = scaleLinear()
  .range([0, height]);

const lineGenerator = line()
  .x((d, i) => x(i + ((d.partial / 12) || 1) - 1))
  .y(d => y(d.balance));

const baselineGenerator = line()
  .x((d, i) => x(i))
  .y(d => y(d.baseline));

class Chart extends React.Component {
  render() {
    const data = this.props.payments;
    x.domain([0, data.length - 1]);
    y.domain([data[0].balance, 0]);

    return (<svg
      height="100%"
      width="100%"
      viewBox={`0 0 ${fullWidth} ${fullHeight}`}>
      <g transform={`translate(${margin.left},${margin.top})`}>
        <g className="axis" ref={r => this.xAxis = select(r) } transform={`translate(0, ${height})`}></g>
        <g className="axis" ref={r => this.yAxis = select(r) }></g>
        <path className="line baseline" ref={r => this.baseline = select(r) } d={baselineGenerator(data) }></path>
        <path className="line" ref={r => this.actual = select(r) } d={lineGenerator(data) }></path>
      </g>
    </svg>);
  }
  componentDidMount() {
    this.drawAxis();
  }
  shouldComponentUpdate({ payments }) {

    if ((payments.length !== this.props.payments.length) || (payments[0].balance !== this.props.payments[0].balance)) {
        x.domain([0, payments.length - 1]);
        y.domain([payments[0].balance, 0]);

        this.drawAxis();
      }
      this.baseline.transition().attr('d', baselineGenerator(payments))
      this.actual.transition().attr('d', lineGenerator(payments));
    return false;
  }
  drawAxis() {
    this.xAxis.call(axisBottom().scale(x).ticks(Math.min(this.props.payments.length, 30)));
    this.yAxis.call(axisLeft().scale(y));
  }
};

export default connect((state)=>({ ...payments(state) }))(Chart)
