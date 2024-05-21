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
