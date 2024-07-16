;'use strict';

const app = {};

app.methods = {};

app.initialStorage = {
  fieldsets: [{
    name: 'Google - Exact match',
    url: 'https://google.com/search?q="%s"',
  }, {
    name: 'Google Images',
    url: 'https://google.com/search?q=%s&tbm=isch',
  }, {
    name: 'YouTube',
    url: 'https://youtube.com/results?search_query=%s',
  }, {
    name: 'Facebook',
    url: 'https://facebook.com/search?q=%s',
  }, {
    name: 'Wikipedia',
    url: 'https://wikipedia.org/wiki/%s',
  }, {
    name: '_separator_',
  }, {
    name: 'Google Maps',
    url: 'https://google.com/maps/search/%s',
  }, {
    name: 'Yandex Maps',
    url: 'https://yandex.com/maps?text=%s',
  }],
};

app.methods.setContextMenuItems = (fieldsets) => {
  for (const index in fieldsets) {
    if (fieldsets[index].name === '_separator_') {
      chrome.contextMenus.create({
        id: index,
        contexts: ['selection'],
        type: 'separator',
      });
    } else {
      chrome.contextMenus.create({
        id: index,
        title: fieldsets[index].name,
        contexts: ['selection'],
      });
    }
  }
};

/* global app, chrome */

/**
 * @property chrome.contextMenus.onClicked
 * @property chrome.contextMenus.removeAll
 * @property chrome.storage.onChanged
 * @property chrome.runtime.onInstalled
 * @property chrome.storage.sync
 */

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set(app.initialStorage);
  chrome.storage.sync.get(null, (storage) => {
    if (!storage.fieldsets) {
      chrome.storage.sync.set(app.initialStorage);
    } else { // When the page reloads
      app.methods.setContextMenuItems(storage.fieldsets);
    }
  });
});

chrome.storage.onChanged.addListener((changes) =>
  chrome.contextMenus.removeAll(
    () => app.methods.setContextMenuItems(changes.fieldsets.newValue)
  )
);

/**
 * @param {String} info.menuItemId
 * @param {String} info.selectionText
 */
chrome.contextMenus.onClicked.addListener(
  (info) => chrome.storage.sync.get(null, (storage) => {
    let url = storage.fieldsets[info.menuItemId].url;
    url = url.replace('%s', encodeURIComponent(info.selectionText));
    chrome.tabs.query({
      active: true,
      currentWindow: true,
    }, tabs => {
      let currentTab = tabs[0];
      chrome.tabs.create({
        url: url,
        index: currentTab.index + 1,
        openerTabId: currentTab.id,
      });
    });
  })
);
