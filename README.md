# IRIS Schedule Viewer

An IRIS component for displaying gantt-style categorized data over time.

[Demo on gh-pages](https://gchq.github.io/iris-schedule-viewer/)

### Features

* Flexible data model.
* Group categorizations under headings.
* Interact via click or drag.
* Event and function based approach to allow for maximumum customisation.
* Fully customizable styles via CSS.
* Tiny (under 200 bytes minified)
* Accessibility-friendly

### Browsers

This component works with the following browsers:

* Chrome
* Firefox
* IE

### Installation

Install using the files in the "dist" folder - there are two you will need to include;
```
dist/bundle.min.js
dist/style.min.css
```
The module is provided in a UMD format, so you can use it with common.js, AMD or global syntaxes. The easiest way
to get up and running without needing a module loader is just to include the above two files on your page
somewhere;
```
<script type="text/javascript" src="/path/to/dist/bundle.js"></script>
<link href="/path/to/dist/style.css" rel="stylesheet">
```
You will then find that an `IRISScheduleViewer` object exists in global scope.

### Example
```
// set up data
var data = [
  {
    name: "schedule 1",
    group: "Main",
    timeRanges: [
      { from: new Date("2017-01-01T12:30"), to: new Date("2017-01-10T09:00"), data: { foo: "bar" }  },
      { from: new Date("2017-02-09T12:30"), to: new Date("2017-02-09T23:00"), data: { bar: "foo" }  },
      { from: new Date("2017-06-21T12:30"), to: new Date("2017-06-22T09:00"), data: { hello: "world" }  }
    ]
  },
  {
    name: "schedule 2",
    group: "Main",
    timeRanges: [
      { from: new Date("2017-06-21T12:30"), to: new Date("2017-06-22T09:00"), data: { foo: "bar" }  }
    ]
  },
  {
    name: "schedule 3",
    timeRanges: [
      { from: new Date("2017-01-01T12:30"), to: new Date("2017-01-10T09:00"), data: { foo: "bar" }  },
      { from: new Date("2017-02-09T12:30"), to: new Date("2017-02-09T23:00"), data: { bar: "foo" }  },
    ]
  },
]

// specify any options you want
var options = {
  title: "Foobar"
}

// construct a new instance
var scheduleViewer = new IRISScheduleViewer(document.getElementById('containerId'), data, options);

// render the component
scheduleViewer.render();
```

The data you pass in must be an array of objects (schedules) that *must* adhere to the following schema;

```
name: (required) a name to associated with the schedule. Will be displayed on the left hand axis.

timeRanges: (requried) an array of objects representing the time ranges within the schedule. Each object *must*
            have the properties `from` and `to`, which need to be javascript Date objects. Beyond that
            though, you can store any additional data you want against a time range. The whole object will
            be available to you when you interact with the schedule. You should avoid using a property called
            __group, though, as you will potentially override functionality described elsewhere.

group: (optional) if the schedule is to be grouped together with other schedules. Will result in a
       collapsible/expandable heading being generated on the chart, under which all schedules will
       be available.
```

### Options
You can get or set the options for a schedule viewer using the following interface;

```
scheduleViewer.getOption(<optionName>);
scheduleViewer.setOption(<optionName>, <optionValue>);
```

The options themselves are documented within the code however have been reproduced here for convinience.

You will notice that some options are indicated as accepting functions ("May pass function"). In these cases,
you can computationally determine the value of the option if you want to. The current datum will be yielded
to the function you pass in. This allows you to do things like making each title / schedule / border a different
color based on the data.

```
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
```

### Events
The schedule viewer emits many events that can be subscribed to in order to provide custom behaviour. These events are subscribed to using the
following interface;

```
  scheduleViewer.on('beforeRender', function() {
    //...
  });
```

Events are as follows;

```
  beforeRender
  afterRender
  beforeSetOption:{optionName} - optionName is optional and allows you to listen to only certain options changing
  afterSetOption:{optionName}
  dataChanged              // emitted when the data changes / is initially set.
  sectionSelected          // if the user clicks the checkbox to the right of a section title (requires these to be enabled)
  timeDataClick            // datum user clicked on will be yielded (see comments re: group clicks below)
  timeDataBrushStart
  timeDataBrushEnd         // from/to dates of the brush will be yielded
  timeDataBrushCancelled   // When the brush is cancelled (by clicking in a blank space)

```

Regarding "group clicks", where the user has clicked on a time schedule but they've clicked on the "group" version
rather than the original, the yielded datum will also include "__group: true" in its properties.

### Public Methods

Methods available on an instance of the schedule viewer. Note that the schedule viewer only speaks in
Date objects, so that's what you should be passing into methods when a date is required.

```
scheduleViewer.render()
```
Renders the scheduleViewer.

```
scheduleViewer.destroy()
```
Destructor.

```
scheduleViewer.on(eventname, callback)
```
Subscribe to a scheduleViewer event. See Events section above.

```
scheduleViewer.getOption(key)
```
Returns the specified option

```
scheduleViewer.setOption(key, value)
```
Sets the specified option. Unless the option "autoReRender" is set, you will need to call the "render" method to see the changes.

```
scheduleViewer.setData(data)
```
Update the underlying data. Unless the option "autoReRender" is set, you will need to call the "render" method to see the changes.

```
scheduleViewer.getDataModel()
```
Returns the underlying `DataModel` representing the data.

```
scheduleViewer.getTimeRangesBetween(from, to)
```
Returns any data items (schedules) that lie between the from and to dates (which should be `Date` objects)

```
scheduleViewer.earliestDate()
```
Returns the earliest date represented by the scheduleViewer's data.

```
scheduleViewer.latestDate()
```
Returns the earliest date represented by the scheduleViewer's data.

```
scheduleViewer.setSelectionRange(from, to)
```
Sets the currently selected data (brush).

```
scheduleViewer.getSelectionRange()
```
Returns the current selection range as an array where the first item is the "from" and the second item is the "to".

```
scheduleViewer.clearSelectionRange()
```
Clears the selection range from the graph.

```
scheduleViewer.getSelectedTimeRanges()
```
Gets the time ranges currently selected by the brush.

```
scheduleViewer.expandAllGroups() / scheduleViewer.collapseAllGroups()
```
Data in the schedule viewer can be rendered in groups - these methods allow you to collapse / expand all the
displayed groups.


### Styling

Stying can be achieved by either customizing or overriding the styles provided in the distributed CSS files. You
do have access to change the color of a particular time range through the "timeColor" option (see above) but
beyond that it's all CSS. Note that while you can override what you want, the visual nature of the component
is such that some of the provided styling is nessecary for the component to function correctly, so you should
use the provided CSS as a base (or dig into the .less files).


### Accessibility

This component has been designed with accessibility in mind - you should also try to adhere to accessibility best
practices when integrating. The component itself is parseable by screen readers and interactable via keyboard.

If dragging / selecting data is a core part of what you use this component for, you should ensure users are able to
perform these actions *without* dragging / using the mouse. All brush-based functionality can be manipulated
programatically via the "setSelectionRange"/"clearSelectionRange" methods. You should consider hooking these up
to buttons in the host application.

### License

See [LICENSE](./LICENSE) for details. External modules' individual licenses can be found in [main.licenses.txt](dist/main.licenses.txt).
