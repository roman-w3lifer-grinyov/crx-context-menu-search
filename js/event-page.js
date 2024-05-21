;'use strict';

/* global app, chrome */

/**
 * @property chrome.contextMenus.onClicked
 * @property chrome.contextMenus.removeAll
 * @property chrome.storage.onChanged
 * @property chrome.runtime.onInstalled
 * @property chrome.storage.sync
 */

chrome.runtime.onInstalled.addListener(() => {
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
    window.open(url);
  })
);
