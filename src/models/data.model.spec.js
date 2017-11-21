import DataModel from './data.model';
import moment from 'moment';

// This construct forms the brittle part of the test - all tests rely on testing
// specifically this data, so change it with care.
var mockData = [
        {
            name: "London",
            group: "United Kingdom",
            timeRanges: [
                { from: new Date("2017-01-01T12:30"), to: new Date("2017-01-02T09:00") },      
                { from: new Date("2017-12-21T12:30"), to: new Date("2017-12-31T23:59") },
                { from: new Date("2017-05-02T00:00"), to: new Date("2017-05-03T00:00") },
                { from: new Date("2017-02-01T12:30"), to: new Date("2017-02-20T09:00") },      
                { from: new Date("2017-05-10T12:30"), to: new Date("2017-05-11T09:00") }      
            ] 
        },
        {
            name: "Birmingham",
            group: "United Kingdom",
            timeRanges: [
                { from: new Date("2017-02-01T12:30"), to: new Date("2017-02-02T09:00") },                  
                { from: new Date("2017-01-01T00:00"), to: new Date("2017-09-25T09:00") },
                { from: new Date("2017-04-30T00:00"), to: new Date("2017-05-10T09:00") }
            ] 
        },
        {
            name: "Madrid",
            group: "Spain",
            timeRanges: [
                { from: new Date("2017-06-21T12:30"), to: new Date("2017-07-25T09:00") }
            ]
        },
        {
            name: "Ungrouped Item",
            timeRanges: [
                { from: new Date("2017-04-21T12:30"), to: new Date("2017-07-25T09:00") }
            ] 
        },
        {
            name: "Another Ungrouped Item",
            timeRanges: [
                { from: new Date("2017-06-21T12:30"), to: new Date("2017-07-25T09:00") }
            ] 
        },
      ]

describe('DataModel', () => {
  let model;

  beforeEach(() => {
    model = new DataModel(mockData);
  });

  describe('#earliestDate', () => {
    it('returns a date', () => {
      expect(model.earliestDate()).to.be.a('date');
    });
    it('returns the earliest date in the series', () => {
      expect(moment(model.earliestDate()).isSame("2017-01-01T00:00")).to.be.true;
    });
  });

  describe('#latestDate', () => {
    it('returns a date', () => {
      expect(model.latestDate()).to.be.a('date');
    });
    it('returns the latest date in the series', () => {
      expect(moment(model.latestDate()).isSame("2017-12-31T23:59")).to.be.true;
    });
  });

  describe('#empty', () => {
    it('returns true if there is no data', () => {
      model = new DataModel([]);
      expect(model.empty()).to.be.true;
    });

    it('returns false if there is data', () => {
      expect(model.empty()).to.be.falsey;
    });
  });

  context('get/set selection range', () => {
    let from, to;

    beforeEach(() => {
      from = new Date("2017-01-01T00:00");
      to   = new Date("2017-01-02T00:00");
    })
    describe('#getSelectionRange', () => {
      it('gets the current selection range', () => {
        model = new DataModel([]);
        model.setSelectionRange(from ,to);

        expect(model.getSelectionRange()).to.eql([from, to]);
      });
    });

    describe('#setSelectionRange', () => {
      it('sets the current selection range', () => {
        model = new DataModel([]);
        model.setSelectionRange(from, to);

        expect(model._selectionRangeFrom).to.equal(from);
        expect(model._selectionRangeTo).to.equal(to)
      });

      it('emits a "selectionRangeChanged" event', () => {        
        let spy = sinon.spy();
        model = new DataModel([]);        
        model.on('selectionRangeChanged', spy)

        model.setSelectionRange(from, to);
        
        expect(spy.called).to.be.true;
      })
    });

    describe('#clearSelectionRange', () => {
      it('clears the current selection range', () => {
        model = new DataModel([]);
        model.setSelectionRange(from, to);
        model.clearSelectionRange();
        expect(model.getSelectionRange()).to.eql([undefined, undefined]);
      });
    });    
  });

  describe('#getTimeRangesBetween', () => {
    let data;

    beforeEach('returns any datum that lie within the specified range', () => {
      let startOfMay = new Date("2017-05-01T00:00");
      let endOfJune  = new Date("2017-06-31T00:00");

      data = model.getTimeRangesBetween(startOfMay, endOfJune);
    });

    it('includes dates where the start and end both fall entirely inside of the range', () => {
      expect(data).to.include({ from: new Date("2017-05-02T00:00"), to: new Date("2017-05-03T00:00") })
    });

    it('incldues dates where only the back-end falls within the range', () => {
      // e.g. April to May
      expect(data).to.include({ from: new Date("2017-04-30T00:00"), to: new Date("2017-05-10T09:00") })
    });

    it('incldues dates where only the front-end falls within the range', () => {
      // e.g. June to July
      expect(data).to.include({ from: new Date("2017-06-21T12:30"), to: new Date("2017-07-25T09:00") })
    });

    it('includes dates where the start is before the range and the end is after the range', () => {
      // e.g. April to July
      expect(data).to.include({ from: new Date("2017-04-21T12:30"), to: new Date("2017-07-25T09:00") })
    });

    it('does not include things that fall entirely before the start of the range', () => {
      // e.g. a date entirely in January
      expect(data).to.not.include({ from: new Date("2017-01-01T12:30"), to: new Date("2017-01-02T09:00") })
    });
  
    it('does not include things that fall entirely after the end of the range', () => {
      // e.g. a date entirely in December
      expect(data).to.not.include({ from: new Date("2017-12-21T12:30"), to: new Date("2017-12-31T23:59") })
    });      
  })

  describe('#groups', () => {
    it('returns the groups from the data', () => {
      expect(model.groups().length).to.eql(2)
      expect(model.groups()).to.include('United Kingdom');
      expect(model.groups()).to.include('Spain');
    });
  });

  describe('#fullData', () => {
    let fullData, names;

    beforeEach(() => {
      fullData = model.fullData();
      names = fullData.map(n => n.name);
    });

    context('presence', () => {
      it('includes groups', () => {
        expect(names).to.include('United Kingdom');
        expect(names).to.include('Spain');      
      });

      it('includes ungrouped items', () => {
        expect(names).to.include('Ungrouped Item');
      })

      it('includes grouped items', () => {
        expect(names).to.include('London');
        expect(names).to.include('Birmingham');
        expect(names).to.include('Madrid');
      });
    })

    context('sorting', () => {

      // convinience function to check if one thing is earlier than another thing in the "names" array
      let expectedOrder = (earlier, later) => {
        let correctOrder = names.indexOf(earlier) < names.indexOf(later);
        let msg = `"${earlier}" (${names.indexOf(earlier)}) should be earlier than "${later}" (${names.indexOf(later)})`;

        if(!correctOrder) console.log(names)
        expect(correctOrder, msg).to.be.true;
      }

      it('puts grouped items after their groups.', () => {
        expectedOrder('United Kingdom', 'London');
        expectedOrder('United Kingdom', 'Birmingham');
        expectedOrder('Spain', 'Madrid');
      });

      it('puts the groups in the correct order', () => {
        expectedOrder('Spain', 'United Kingdom')
      });

      it('puts the ungrouped items in the correct order', () => {
        expectedOrder('Another Ungrouped Item', 'Ungrouped Item');
      });

      it('puts the ungrouped items and the groups in the correct order', () => {
        expectedOrder('Another Ungrouped Item', 'Spain');
        expectedOrder('Ungrouped Item', 'United Kingdom');      
      });

      context('times within groups', () =>  {
        let ukTimes;

        beforeEach(() => {
          ukTimes = fullData.filter(d => d.name == "United Kingdom")[0].timeRanges;
        });

        it('puts the earliest date first', () => {
          // that would be the "midnight on the 1st Jan" date from Birmingham
          let earliestTime = ukTimes[0];
          expect(earliestTime.from).to.eql(new Date("2017-01-01T00:00"));
        });

        it('puts the latest date last', () => {                    
          // that would be the "31st December 23:59" date from London
          let latestTime = ukTimes[ukTimes.length-1]
          expect(latestTime.to).to.eql(new Date("2017-12-31T23:59"));          
        });

        it('indicates the time came from a group using the __group indicator', () => {
          let arbitraryUkTime = ukTimes[0]
          expect(arbitraryUkTime.__group).to.be.true;
        });
      });

    });    

  });

});
