import EventEmitter from '../utilities/event-emitter';

import flatten from 'lodash/flatten'
import map from 'lodash/map'
import uniq from 'lodash/uniq'
import union from 'lodash/union'
import cloneDeep from 'lodash/cloneDeep'

export default class DataModel {

  constructor(rawData) {
    this.rawData  = rawData || [];
    this.emitter  = new EventEmitter();
  }

  on(eventName, cb) {
    this.emitter.on(eventName, cb);
  }

  empty() {
    return !this.rawData || !this.rawData.length
  }

  allDates() {
    return flatten(this.rawData.map(d => d.timeRanges));
  }

  // returns all schedules between the from and to dates.
  getTimeRangesBetween(from, to) {
    return this.allDates().filter(d => {
      return (
        (d.from < to && d.from > from) ||   // it starts in the range
        (d.to > from && d.to < to) ||       // it ends in the range
        (d.from < from && d.to > to)        // it is covered by the range
      )
    })
  }

  // returns the earliest date in the passed in data
  earliestDate() {
    if(!this.empty())
      return this.allDates().sort((a,b) => a.from > b.from ? 1 : -1)[0].from;
  }

  // returns the latest date in the passed in data
  latestDate() {
    if(!this.empty())
      return this.allDates().sort((a,b) => a.to > b.to ? 1 : -1)[this.allDates().length - 1].to;
  }

  // sets the current selection range
  setSelectionRange(from, to, opts = {}) {
    this._selectionRangeFrom = from;
    this._selectionRangeTo = to;

    if(!opts.quiet)
      this.emitter.emit('selectionRangeChanged', from, to);
  }

  // returns the current selection range
  getSelectionRange() {
    return [this._selectionRangeFrom, this._selectionRangeTo];
  }

  // clears the current selection range
  clearSelectionRange(opts = {}) {
    delete this._selectionRangeFrom;
    delete this._selectionRangeTo;

    if(!opts.quiet)
      this.emitter.emit('selectionRangeCleared');
  }

  // returns a list of the unique groups represented by the data
  groups() {
    return uniq(map(this.rawData, 'group')).filter((n) => n);
  }

  /*
   organizes the data fully, which means it;

   * Puts the items in the right order
   * Adds in the "groups" which are derived from the raw data

  */
  fullData() {
    let groupedData = [];

    let normalizedGroups = this.groups().map((d) => {
      return { name: d, isGroup: true }
    });

    let rootItems = union(normalizedGroups, this.rawData.filter(d => !d.group));

    rootItems
      .sort((a,b) => a.name < b.name ? -1 : 1)
      .forEach(rootItem => {
        if(rootItem.isGroup) {
          
          let newTimeRanges = flatten(this.rawData.filter(d => d.group === rootItem.name).map(d => d.timeRanges))
            .sort((a,b) => a.from < b.from ? -1 : 1);

          // indicate within each time range that it is from a group rather than being the original range.
          rootItem.timeRanges = cloneDeep(newTimeRanges).map(d => Object.assign({ __group: true} , d ));

          groupedData.push(rootItem);
          this.rawData.filter(d => d.group == rootItem.name)
            .sort((a,b) => a.name > b.name ? 1 : -1)
            .forEach(d => groupedData.push(d));
        } else {
          groupedData.push(rootItem);
        }
    });

    return groupedData;
  }

}
