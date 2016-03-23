'use strict';

const defaults = {
  host: 'http://localhost:8384'
};

let config = {
  _: {},

  get host() {
    if (typeof this._.host === 'string' && this._.host.length) {
      return this._.host;
    } else {
      return defaults.host;
    }
  }
};

let lastEvent = 0;
let folderState = {};

chrome.storage.local.get(null, items => config._ = items);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area == 'local') {
    chrome.storage.local.get(null, items => config._ = items);
  }
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name !== 'refresh') {
    return;
  }

  fetch(`${config.host}/rest/events${lastEvent ? '?since=' + lastEvent : ''}`)
    .then(response => response.json())
    .then(events => {
      let indicator = 'offline';

      for (let event of events) {
        lastEvent = event.id;

        if (event.type === 'StateChanged' && event.data) {
          folderState[event.data.folder] = event.data.to;
        }
      }

      let states = ['scanning', 'syncing'];
      let folders = Object.keys(folderState);

      for (let folder of folders) {
        let state = folderState[folder];

        if (states.indexOf(state) >= 0 ||
            states.indexOf(indicator) === -1) {
          indicator = state;
        } else if (state === 'error') {
          indicator = state;
          break;
        }
      }

      console.log(indicator);

      chrome.browserAction.setIcon({ path: `indicator-${indicator}.png` });

      chrome.alarms.create('refresh', { when: Date.now() + 500 });
    })
    .catch(error => {
      console.log(error);
      chrome.browserAction.setIcon({ path: 'indicator-error.png' });
    });
});

chrome.alarms.create('refresh', { when: Date.now() });
