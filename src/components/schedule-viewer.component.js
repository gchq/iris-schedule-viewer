
import DataModel from '../models/data.model';
import EventEmitter from '../utilities/event-emitter';
import D3Renderer from './schedule-viewer.renderer.d3';

export default class ScheduleViewer {

  static get DEFAULT_OPTIONS() {

    return {

      // Whether to automatically re-render when data or options change.
      autoReRender: false,

      // the class of the root element that will be rendered - generally you will want to leave
      // this alone. 
      namespace: 'iris-schedule-viewer',

      // filter out certain bits of data by defining a function - each datum will be yielded to the 
      // function, which should return a 'true' if it wants the schedule to be displayed.
      filter: (d) => true,

      // width (pixels)
      width: 1000,

      // title width - how much space the headings should take up 
      titleWidth: 150, 

      // color of the schedule elements (as per CSS API). May pass function.
      scheduleColor: "cornflowerblue",

      // border for the schedule items (as per CSS API). May pass function.
      scheduleBorder: '',

      // show checkboxes next to each section header
      allowSectionSelection: false,

      // allow multi-select when selecting sections using the allowSectionSelection functionality
      allowSectionMultiSelect: false,    

      // border radius for the schedule items (as per CSS API). May pass function.
      scheduleRadius: '4px',

      // Font to use for group names / headings as per CSS API. May pass function.
      headingFontFamily: 'sans-serif',

      // Font size to use for group names / headings as per CSS API. May pass function.
      headingFontSize: '1em', 

      // Color to use for group names / headings as per CSS API. May pass function.
      headingColor: 'black',       

      // color of the border for the whole component (set to "transparent" if none required).  May pass function.
      borderColor: 'black',

      // color of the axis.  May pass function.
      axisColor: 'black',

      // size of the axis text.  May pass function.
      axisTextSize: '11px',

      // color of the lines that divide the groups. May pass function.
      dividingLineColor: 'lightgray',      

      // the margin for the chart
      chartMargin: 20,

      // Specify whether or not to display tooltips when a user hovers over a time range. Note that
      // the content will still be on the page (for screen readers) it just won't appear on hover.
      tooltips: true,

      // Specify tooltip content - You should ensure that you bear accessibility in mind when setting
      // this value as this is the only method screen readers have of accessing the information.
      tooltipPresentation: (d) => `${d.from.toUTCString()} - ${d.to.toUTCString()}`,

      // Date the series should start / end at. If no values specified here, the schedule viewer will 
      // automatically figure these out for you based on your data.
      startDate: null,
      endDate: null,

      // Whether the "brush" functionality should be enabled. 
      brushEnabled: true

    }
  }

  /**
   * @param containerId {string} the ID of the element to render to
   * @param data {array} the data series to represent
   * @param options {object} 
   */
  constructor(container, data, options) {
    this.container    = container;
    this.emitter      = new EventEmitter();
    this.options      = Object.assign({}, ScheduleViewer.DEFAULT_OPTIONS, options);    
    this.setData(data);
  }

  /**
   * Removes DOM elements from document and deletes in-memory references.
   */
  destroy() {
    if(this.container) {
      this.container.innerHTML = '';
      delete this.container;
    }
  }

  /**
   * render the actual component based on its current this.state.
   */
  render(renderer = new D3Renderer(this)) {
    this.emitter.emit('beforeRender');
    this.container.innerHTML = '';
    renderer.render();
    this.emitter.emit('afterRender');
  }

  /**
   * Get an option
   * @param key {string} the key of the object to get
   */
  getOption(key) {
    return this.options[key]
  }

  /**
   * Set an option
   * @param key {string} the key of the option to set
   * @param value {any} the value to set the option to
   */
  setOption(key, value) {
    ['beforeSetOption', `beforeSetOption:${key}`].forEach(e => this.emitter.emit(e));
    this.options[key] = value;  
    ['afterSetOption', `afterSetOption:${key}`].forEach(e => this.emitter.emit(e));
    if(this.options.autoReRender) this.render();
  }

  /**
   * Update the data
   */
  setData(data) {
    this.data = new DataModel(data);
    this.emitter.emit('dataChanged', this.data);
    if(this.options.autoReRender) this.render();
  }

  /**
  * Get the underlying data model
  */
  getDataModel() {
    return this.data;
  }

  /**
   * Returns all schedules between from/to dates specified
   * @param from {date} 
   * @param to {date}
   */
  getTimeRangesBetween(from, to) {
    return this.data.getTimeRangesBetween(from, to);
  }

  /**
   * Sets the currently selected range
   */
  setSelectionRange(from, to) {
    this.data.setSelectionRange(from, to);
  }

  /**
   * Gets the currently selected range (if any)
   */
  getSelectionRange() {
    return this.data.getSelectionRange();
  }

  /**
   * Clears the currently selected range
   */
  clearSelectionRange() {
    this.data.clearSelectionRange();
  }

  /**
   * Return the time ranges currently selected
   */  
  getSelectedTimeRanges() {
    return this.getTimeRangesBetween(...this.getSelectionRange())
  }

  /**
  * Get the earliest date from the underlying data
  */
  earliestDate() {
    return this.data.earliestDate();
  }

  /**
  * Get the latest date from the underlying data
  */
  latestDate() {
    return this.data.latestDate();
  }

  /**
   * Expand all groups
   */
  expandAllGroups() {
    this.emitter.emit('expandAllGroups');
  }

  /**
   * Collapse all groups
   */
  collapseAllGroups() {
    this.emitter.emit('collapseAllGroups');
  }

  /**
   * attach a listener to an event
   * @param eventName {string} the event to listen to
   * @param cb {function} function to run when the event occurs
   */
  on(eventName, cb) {
    this.emitter.on(eventName, cb);
  }


}