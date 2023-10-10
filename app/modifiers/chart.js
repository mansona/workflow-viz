import { modifier } from 'ember-modifier';

import { select, scaleUtc, min, max, axisBottom, timeMinute } from 'd3';

export default modifier(function chart(element, [data] /* named*/) {
  const taskArray = data.sort(
    (a, b) => new Date(a.started_at) - new Date(b.started_at),
  );

  const barHeight = 20;
  const actualGap = 4;
  // this is a badly named variable TODO fix it
  const gap = barHeight + actualGap;
  const topPadding = 75;
  const sidePadding = 75;

  this.w = 1500;
  // eslint-disable-next-line prettier/prettier
  this.h = (taskArray.length * (barHeight + actualGap)) + (topPadding * 2);

  select(element.querySelector('.loading')).remove();

  const svg = select(element)
    .append('svg')
    .attr('width', this.w)
    .attr('height', this.h)
    .attr('class', 'svg');

  const timeScale = scaleUtc()
    .domain([
      min(taskArray, (d) => {
        return new Date(d.started_at);
      }),
      max(taskArray, (d) => {
        return new Date(d.completed_at);
      }),
    ])
    .range([0, this.w - 150]);

  makeGant(taskArray, this.w, this.h);

  function makeGant(tasks, pageWidth, pageHeight) {
    makeGrid(sidePadding, topPadding, pageWidth, pageHeight);
    drawRects(
      tasks,
      gap,
      topPadding,
      sidePadding,
      barHeight,
      pageWidth,
      pageHeight,
    );
  }

  function makeGrid(theSidePad, theTopPad, w, h) {
    var xAxis = axisBottom()
      .scale(timeScale)
      .ticks(timeMinute.every(1))
      .tickSize(-h + theTopPad + 20, 0, 0)
      .tickSizeOuter(0);

    var grid = svg
      .append('g')
      .attr('class', 'grid')
      .attr('transform', 'translate(' + theSidePad + ', ' + (h - 50) + ')')
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'middle')
      .attr('fill', 'grey')
      .attr('stroke', 'none')
      .attr('font-size', 10)
      .attr('dy', '1em');
  }

  function drawRects(
    theArray,
    theGap,
    theTopPad,
    theSidePad,
    theBarHeight,
    w,
    h,
  ) {
    var bigRects = svg
      .append('g')
      .selectAll('rect')
      .data(theArray)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d, i) => {
        return i * theGap + theTopPad - 2;
      })
      .attr('width', (d) => {
        return w - theSidePad / 2;
      })
      .attr('height', theGap)
      .attr('stroke', 'none')
      .attr('fill', (d, i) => {
        if (i % 2 == 0) {
          return '#BDBDBD';
        }
      })
      .attr('opacity', 0.2);

    var rectangles = svg.append('g').selectAll('rect').data(theArray).enter();

    var innerRects = rectangles
      .append('rect')
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('x', (d) => {
        return timeScale(new Date(d.started_at)) + theSidePad;
      })
      .attr('y', (d, i) => {
        return i * theGap + theTopPad;
      })
      .attr('width', (d) => {
        return (
          timeScale(new Date(d.completed_at)) -
          timeScale(new Date(d.started_at))
        );
      })
      .attr('height', theBarHeight)
      .attr('stroke', 'none')
      .attr('fill', (d) => {
        for (var i = 0; i < taskArray.length; i++) {
          return 'RED'; //d3.rgb(theColorScale(i));
        }
      });

    var rectText = rectangles
      .append('text')
      .text((d) => {
        return d.name;
      })
      .attr('x', (d) => {
        return (
          (timeScale(new Date(d.completed_at)) -
            timeScale(new Date(d.started_at))) /
            2 +
          timeScale(new Date(d.started_at)) +
          theSidePad
        );
      })
      .attr('y', (d, i) => {
        return i * theGap + 14 + theTopPad;
      })
      .attr('font-size', 11)
      .attr('text-anchor', 'middle')
      .attr('text-height', theBarHeight);
  }
});
