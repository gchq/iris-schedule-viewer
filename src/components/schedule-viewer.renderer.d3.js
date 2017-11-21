
import { select, selectAll, event } from 'd3-selection';
import { brushSelection, brushX } from 'd3-brush';
import { axisTop, axisBottom } from 'd3-axis';
import { scaleUtc } from "d3-scale";

/*
  scaling function for converting time to pixels and vice versa.
*/
const xScaler = (earliestDate, latestDate, canvasWidth) => {
  return scaleUtc()
    .domain([earliestDate, latestDate])
    .range([0, canvasWidth])
}

export default class ScheduleViewerRenderer {

  constructor(component) {
    this.data                   = component.data;
    this.container              = component.container;
    this.opts                   = component.options;
    this.componentEventEmitter  = component.emitter;
    this.innerWidth             = this.opts.width - (2 * this.opts.chartMargin);
    this.titleWidth             = this.opts.titleWidth;
    this.timesWidth             = this.innerWidth - this.opts.titleWidth
    this.xScale                 = xScaler(this.data.earliestDate(), this.data.latestDate(), this.timesWidth);
  }

  render() {
    const chart         = this.initializeChart();

    this.initializeAxis(chart, axisTop);
    const chartSections = this.initializeChartSections(chart);
    const timeButtons   = this.initializeTimeRanges(chartSections);
    this.initializeAxis(chart, axisBottom);

    this.initializeTooltip(chart, timeButtons);
    this.initializeBrush(chart);
  }


  /**
   * initializeChart
   */
  initializeChart() {
    let chart = select(this.container)
            .style('width', `${this.opts.width}px`)
            .style('border', `1px solid ${this.opts.borderColor}`)
            .append('article')
            .attr('class',  this.opts.namespace)
            .style('margin', `${this.opts.chartMargin}px`)
            .style('width', `${this.innerWidth}px`)

    if(this.opts.title)
      chart.append('h1').text(this.opts.title);

    return chart;
  }


  /**
   * initializeChartSections
   */
  initializeChartSections(chart) {
    
    const self = this;

    let chartSectionContainer = chart.append('div')
                             .attr('class', 'iris-schedule-viewer__section-container')

    let chartSections = chartSectionContainer.selectAll('section')
                             .data(this.data.fullData())
                             .enter()
                             .append('section')
                             .style('width', `${this.innerWidth}px`)
                             .style('border-color', this.opts.dividingLineColor)
                             .attr('data-parent-group', d => d.group ? d.group : null)
                             .attr('class', d => {
                               if(d.isGroup) return 'group'
                               else if(d.group) return 'grouped'
                               else return 'ungrouped'
                             })
                             .style('display', d => d.group ? 'none' : null)
                             .attr('aria-hidden', d => d.group ? true : null)
  

    let chartSectionHeaders = chartSections.append((d) => document.createElement(d.group ? 'h3' : 'h2'))
                 .attr('class', 'iris-schedule-viewer__section-title')
                 .style('width', `${this.titleWidth}px`);

    if(this.opts.allowSectionSelection) {
      chartSections.selectAll('.iris-schedule-viewer__section-title')
                   .append('input')
                   .attr('class', 'iris-schedule-viewer__select')
                   .attr('type', 'checkbox')
                   .on('click', function(d) {
                     const selected = this.checked;
                     self.data.clearSelectionRange();
                     self._selectSection(this, selected, d, !self.opts.allowSectionMultiSelect, self.componentEventEmitter);
                   });
    }
    

    let chartHeadings = chartSections.selectAll('.iris-schedule-viewer__section-title')
                 .append(d => document.createElement(d.isGroup ? 'button' : 'span'))
                 .style('font-family', this.opts.headingFontFamily)
                 .style('font-size', this.opts.headingFontSize)
                 .style('color', this.opts.headingColor)
                 .style('text-align', 'left')
                 .text(d => d.name)
                 .filter(d => d.isGroup)
                 .attr('data-group', d => d.name)
                 .attr('aria-expanded', false)
                 .attr('data-expanded', false)
                 .on('click', this._toggleGroupVisibility);
    

    // Headings for items that are not groups
    chartHeadings.filter(d => !d.isGroup).text(d => d.name);

    // Listen to component trying to expand/collapse all groups
    this.componentEventEmitter.on('expandAllGroups',   this._expandAllGroups);
    this.componentEventEmitter.on('collapseAllGroups', this._collapseAllGroups);

    return chartSections;
  }


  /**
   * initializeTimeRanges
   */
  initializeTimeRanges(chartSections) {

    const timeButtons = chartSections
          .append('ul')        
          .style('width', `${this.timesWidth}px`)
          .selectAll('li')
          .data(d => d.timeRanges)
          .enter()
          .filter(d => this.opts.filter(d))
          .append('li')          
          .append('time')
          .attr('dateTime', d => `${d.from} - ${d.to}`)
          .append('button')
          .style('background-color', this.opts.scheduleColor)
          .style('border-radius', this.opts.scheduleRadius)
          .style('border',        this.opts.scheduleBorder)
          .style('left',  d => `${this.xScale(d.from)}px`)
          .style('width', d => `${this.xScale(d.to) - this.xScale(d.from)}px`)
          .on('click', (d) => {
            this._selectSection(null, null, null, true);
            this.data.clearSelectionRange();
            this.componentEventEmitter.emit("timeDataClick", d)
          });

    timeButtons.append('span')
          .attr('data-iris-tooltip', true)
          .html(this.opts.tooltipPresentation);

    chartSections.append('hr').attr('class', 'clearFix');

    return timeButtons;
  }

  /**
   * initializeTooltip
   */
  initializeTooltip(chart, timeRanges) {
    if(!this.opts.tooltips) return;

    timeRanges
      .on('focus mouseover', function() {
        select(this).select('span[data-iris-tooltip]').style('display', 'block')
      })
      .on('focusout mouseout', function() {
        select(this).select('span[data-iris-tooltip]').style('display', 'none')
      });
  }


  /**
   * initializeAxis
   */
  initializeAxis(chart, axisType) {
    let axis = axisType(this.xScale)

    chart.append("svg")
      .attr('aria-hidden', true)
      .attr('class', 'iris-schedule-viewer__axis')
      .attr("width", `${this.timesWidth}px`)
      .attr("height", '50px')
      .style("margin-left", `${this.titleWidth}px`)
      .append("g")
      .attr('stroke', this.opts.axisColor)
      .attr("transform", "translate(0,30)")
      .call(axis)
      .selectAll('text, path, line')
      .style('font-size', this.opts.axisTextSize)
      .style('color', this.opts.axisColor)
      .style('stroke', this.opts.axisColor)
  }


  /**
   * initializeBrush
   */
  initializeBrush(chart) {
    if(this.data.empty() || !this.opts.brushEnabled)
      return;

    let brush = brushX();

    let sectionsContainer = chart.select('.iris-schedule-viewer__section-container')

    let brushContainer = sectionsContainer
      .insert('svg', ':first-child')
      .attr('class', 'brushContainer')
      .attr('width',  `${this.timesWidth + 1}px`)
      .attr('height', `${sectionsContainer.node().clientHeight}px`)
      .style('position', 'absolute')
      .style('margin-left', `${this.titleWidth - 1}px`)

    let brushGroup = brushContainer.append('g')
                                   .attr('class', 'brush')
                                   .call(brush)

    // Because the brush size is going to vary (when users expand/collapse the
    // timeline items) we need to recalculate the brush size when various events
    // occur. This function handles the resize.
    let resetBrushHeight = (sectionsContainer, brushContainer) => {
      let height =  sectionsContainer.node().clientHeight;

      brushContainer.attr('height', height)
                    .selectAll('rect')
                    .attr('height', height)
                    .style('height', `${height}px`)
    }

    resetBrushHeight(sectionsContainer, brushContainer);

    brush.on('start', () => {
      this.componentEventEmitter.emit("timeDataBrushStart");
      resetBrushHeight(sectionsContainer, brushContainer);
    });

    brush.on('brush', () => {
      resetBrushHeight(sectionsContainer, brushContainer);
    });

    brush.on('end', () => {
      let selectedRange = brushSelection(brushGroup.node());
      this._selectSection(null, null, null, true)

      if(selectedRange) {
        let from = this.xScale.invert(selectedRange[0])
        let to = this.xScale.invert(selectedRange[1])
        this.data.setSelectionRange(from, to, { quiet: true });
        this.componentEventEmitter.emit("timeDataBrushEnd", from, to);
      } else {
        this.componentEventEmitter.emit("timeDataBrushCancelled")
      }
    });

    this.data.on('selectionRangeChanged', (from, to) => {
      brushGroup.call(brush.move, [this.xScale(from), this.xScale(to)]);
    });

    this.data.on('selectionRangeCleared', (from, to) => {
      brushGroup.call(brush.move, [null, null]);
    });
    
  }

  // Toggle group visibility
  _selectSection(el, checked, datum, deselectOthers, emitter) {
    const checkboxes = selectAll('.iris-schedule-viewer__select')

    if(el) el.checked = checked;      

    if(deselectOthers) {
      checkboxes
        .filter(function() { return this != el })
        .property('checked', false);
    }

    const selectedSections = checkboxes    
      .filter(function() { return this.checked });

    if(el && emitter) emitter.emit("sectionSelected", selectedSections.data());
  }


  // Toggle group visibility
  _toggleGroupVisibility(datum) {
    let isExpanded    = !(this.getAttribute('data-expanded') == "true");
    _setGroupVisibility(this, isExpanded);
  }

  // Expand all groups
  _expandAllGroups() {
    select('.iris-schedule-viewer__section-container')
      .selectAll('.group button')
      .each(function(d) { _setGroupVisibility(this, true) });
  }

  // Collapse all groups
  _collapseAllGroups() {
    select('.iris-schedule-viewer__section-container')
      .selectAll('.group button')
      .each(function(d) { _setGroupVisibility(this, false) });
  }

}


function _setGroupVisibility(groupEl, isExpanded) {
  let group = groupEl.getAttribute('data-group');

  select(groupEl)
    .attr('data-expanded', isExpanded)
    .attr('aria-expanded', isExpanded)

  let sectionsContainer = select('.iris-schedule-viewer__section-container')

  sectionsContainer.selectAll('section')
    .filter(d => d.group === group)
    .style('display', d => isExpanded ? 'block' : 'none')
    .attr('aria-hidden', d => isExpanded ? false : true)

  let height = sectionsContainer.node().clientHeight;

  sectionsContainer.select('.brushContainer')
                    .attr('height', height).style('height', `${height}px`)
                    .selectAll('rect')
                    .attr('height', height).style('height', `${height}px`)
}
