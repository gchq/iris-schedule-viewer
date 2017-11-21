
import ScheduleViewer from './schedule-viewer.component';
import DataModel from '../models/data.model';

let mockData = [
        {
            name: "London",
            group: "United Kingdom",
            timeRanges: [
                { from: new Date("2017-01-01T00:00"), to: new Date("2017-01-02T09:00") }
            ] 
        },
        {
            name: "Birmingham",
            group: "United Kingdom",
            timeRanges: [
                { from: new Date("2018-01-01T00:00"), to: new Date("2018-09-25T09:00") }
            ] 
        }
      ];

describe("ScheduleViewer", () => {

  describe('#getOption', () => {

    it('retrieves a previously set option', () => {
      let scheduleViewer = new ScheduleViewer(null, null, { scheduleColor: "blue" });
      expect(scheduleViewer.getOption("scheduleColor")).to.equal("blue");
    });

    it('retrieves the default value if no option set', () => {
      let scheduleViewer = new ScheduleViewer();
      expect(scheduleViewer.getOption("scheduleColor")).to.equal("cornflowerblue");
    });

  });    

  describe('#setOption', () => {

    it('allows you to set an option', () => {
      let scheduleViewer = new ScheduleViewer();
      scheduleViewer.setOption('scheduleColor', 'green');
      expect(scheduleViewer.getOption('scheduleColor')).to.equal('green');
    });      

    it('emits the relevant events', () => {
      let events = ['beforeSetOption', 'afterSetOption', 'beforeSetOption:scheduleColor', 'afterSetOption:scheduleColor'];
      var spy = sinon.spy();
      let scheduleViewer = new ScheduleViewer();
      events.forEach(evt => scheduleViewer.on(evt, spy));        

      scheduleViewer.setOption('scheduleColor', 'green');

      // 4 times, once for each of the events specified above
      expect(spy.callCount).to.equal(4);
    })

  });

  describe('#getDataModel', () =>  {
    it('returns the data-model wrapper for the component', () => {
      let scheduleViewer = new ScheduleViewer(document.createElement("div"), []);
      expect(scheduleViewer.getDataModel()).to.be.an.instanceOf(DataModel);
    });
  });

  describe('#setData', () => {
    it('emits a dataChanged event', () => {
      let scheduleViewer = new ScheduleViewer(document.createElement("div"), []);
      let spy = sinon.spy();

      scheduleViewer.on('dataChanged', spy);
      scheduleViewer.setData([]);

      expect(spy.calledOnce).to.be.true;
    })
  });
  
  describe('#earliestDate', () => {
    it('retrieves the earliest date from the underlying data', () => {
      let scheduleViewer = new ScheduleViewer(document.createElement('div'), mockData);
      expect(scheduleViewer.earliestDate()).to.eql(new Date('2017-01-01T00:00'))
    })
  });


  describe('#latestDate', () => {
    it('retrieves the latest date from the underlying data', () => {
      let scheduleViewer = new ScheduleViewer(document.createElement('div'), mockData);
      expect(scheduleViewer.latestDate()).to.eql(new Date('2018-09-25T09:00'))
    })
  });

  describe('#destroy', () => {
    it('destroys the node and the in-memory reference to it', () => {    
      let scheduleViewer = new ScheduleViewer(document.createElement('div'), []);
      scheduleViewer.destroy();

      expect(scheduleViewer.container).to.be.blank;      
    });
  });

  describe('#set/getSelectionRange', () => {
    it('sets and gets the selection range', () => {
      let from = new Date("2017-01-01T00:00");
      let to   = new Date("2017-01-02T00:00");      

      let scheduleViewer = new ScheduleViewer(document.createElement('div'), []);
      scheduleViewer.setSelectionRange(from, to);
      expect(scheduleViewer.getSelectionRange()).to.eql([from, to]);
    });
  });

  describe('#render', () => {

    let scheduleViewer, renderSpy;

    beforeEach(() => {
      let container = document.createElement("div");
      renderSpy = sinon.spy();    
      scheduleViewer = new ScheduleViewer(container, []);
    });

    it('calls render on the renderer', () => {
      scheduleViewer.render({ render: renderSpy });      
      expect(renderSpy.calledOnce).to.be.true;    
    });

    it('emits beforeRender/afterRender event', () => {
      let events = ['beforeRender', 'afterRender'];
      let spy = sinon.spy();

      events.forEach((evt) => { scheduleViewer.on(evt, spy) });
      
      scheduleViewer.render();

      expect(spy.calledTwice).to.be.true;
    });

  });

  describe('#expandAllGroups', () => {
    it('emits a message that the renderer can listen to', () => {
      let scheduleViewer = new ScheduleViewer(document.createElement('div'), mockData);
      let spy = sinon.spy();
      scheduleViewer.on('expandAllGroups', spy);
      scheduleViewer.expandAllGroups();
      expect(spy.calledOnce).to.be.true;
    });
  });

  describe('#collapseAllGroups', () => {
    it('emits a message that the renderer can listen to', () => {
      let scheduleViewer = new ScheduleViewer(document.createElement('div'), mockData);
      let spy = sinon.spy();
      scheduleViewer.on('collapseAllGroups', spy);
      scheduleViewer.collapseAllGroups();
      expect(spy.calledOnce).to.be.true;
    });
  });

});