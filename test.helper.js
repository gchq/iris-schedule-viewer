
const jsdom = require('jsdom').jsdom;

global.document = jsdom({ file: 'index.html' });

global.window = document.defaultView;

global.sinon = require('sinon');

global.expect = require('chai').expect;