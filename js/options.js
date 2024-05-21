;'use strict';

/* global app, chrome */

/**
 * @property chrome.downloads
 */

window.addEventListener('DOMContentLoaded', () => {

  // Elements

  const listOfFieldsets = document.getElementById('list-of-fieldsets');
  const fieldsetTemplate = document.getElementById('fieldset-template');
  const separatorTemplate = document.getElementById('separator-template');
  const addButton = document.getElementById('add-button');
  const addSeparatorButton = document.getElementById('add-separator-button');
  const saveButton = document.getElementById('save-button');
  const savedNotification = document.getElementById('saved-notification');
  const sortAlphabeticallyButton = document.getElementById('sort-alphabetically-button');
  const listOfExamples = document.getElementById('list-of-examples');

  // Initialization

  chrome.storage.sync.get(null, (storage) => {
    setFieldsets(storage.fieldsets);
    if (document.querySelectorAll('.remove-fieldset-button').length === 1) {
      document.querySelector('.remove-fieldset-button').classList.add('hidden');
      document.querySelector('.up-down-arrow').classList.add('invisible');
    }
  });

  function setFieldsets(fieldsets) {
    if (!fieldsets) {
      return;
    }
    // Remove old fieldsets
    const oldFieldsets = listOfFieldsets.querySelectorAll('li');
    for (let i = 0; i < oldFieldsets.length; i++) {
      oldFieldsets[i].remove();
    }
    // Add new fieldsets
    for (let index in fieldsets) {
      let fieldset;
      if (fieldsets[index].name === '_separator_') {
        fieldset = separatorTemplate.content.cloneNode(true);
      } else {
        fieldset = fieldsetTemplate.content.cloneNode(true);
        fieldset.querySelector('.name').value = fieldsets[index].name;
        fieldset.querySelector('.url').value = fieldsets[index].url;
      }
      listOfFieldsets.appendChild(fieldset);
    }
  }

  Sortable.create(listOfFieldsets, {
    filter: '.name, .url, .remove-fieldset-button',
    preventOnFilter: false,
  });

  // Initialization - Examples

  (() => {
    for (const index in app.initialStorage.fieldsets) {
      const li = document.createElement('li');
      const fieldset = app.initialStorage.fieldsets[index];

      if (fieldset.name === '_separator_') {
        const spanSeparator = document.createElement('span');
        spanSeparator.className = 'separator';
        li.appendChild(spanSeparator);
      } else {
        const nameInput = document.createElement('input');
        nameInput.disabled = true;
        nameInput.className = 'name';
        nameInput.value = app.initialStorage.fieldsets[index].name;

        const urlInput = document.createElement('input');
        urlInput.disabled = true;
        urlInput.className = 'url';
        urlInput.value = app.initialStorage.fieldsets[index].url;

        li.appendChild(nameInput);
        li.appendChild(urlInput);
      }

      listOfExamples.appendChild(li);
    }
  })();

  // Events

  // Events - Add fieldset

  addButton.addEventListener('click', () => {
    listOfFieldsets.appendChild(fieldsetTemplate.content.cloneNode(true));
    document.querySelector('.remove-fieldset-button').classList.remove('hidden');
    document.querySelector('.up-down-arrow').classList.remove('invisible');
  });

  // Events - Add separator fieldset

  addSeparatorButton.addEventListener('click', () => {
    listOfFieldsets.appendChild(separatorTemplate.content.cloneNode(true));
    document.querySelector('.remove-fieldset-button').classList.remove('hidden');
    document.querySelector('.up-down-arrow').classList.remove('invisible');
  });

  // Events - Save fieldsets

  saveButton.addEventListener('click', () => {
    const data = {
      fieldsets: [],
    };
    const fieldsets = listOfFieldsets.querySelectorAll('li');
    for (let i = 0; i < fieldsets.length; i++) {
      const name = fieldsets[i].querySelector('.name');
      if (name) {
        data.fieldsets.push({
          name: name.value,
          url: fieldsets[i].querySelector('.url').value,
        });
      } else {
        data.fieldsets.push({name: '_separator_'});
      }
    }
    chrome.storage.sync.set(data, () => {
      savedNotification.classList.remove('hidden');
      setTimeout(() => savedNotification.classList.add('hidden'), 1000);
    });
  });

  // Events - Remove fieldset

  listOfFieldsets.addEventListener('click', (eventObject) => {
    const removeFieldSetButton = eventObject.target;
    if (removeFieldSetButton.classList.contains('remove-fieldset-button')) {
      removeFieldSetButton.parentElement.remove();
      const firstRemoveFieldsetButton = document.querySelector('.remove-fieldset-button');
      const firstUpDownArrow = document.querySelector('.up-down-arrow');
      if (document.querySelectorAll('.remove-fieldset-button').length === 1) {
        firstRemoveFieldsetButton.classList.add('hidden');
        firstUpDownArrow.classList.add('invisible');
      } else {
        firstRemoveFieldsetButton.classList.remove('hidden');
        firstUpDownArrow.classList.remove('invisible');
      }
    }
  });

  // Events - Sort alphabetically

  sortAlphabeticallyButton.addEventListener('click', () => {
    const fieldsets = listOfFieldsets.querySelectorAll('li');
    const unorderedFieldsets = {};
    for (let i = 0; i < fieldsets.length; i++) {
      let name = fieldsets[i].querySelector('.name');
      if (name) {
        unorderedFieldsets[name.value] = fieldsets[i];
      }
    }
    const orderedFieldsets = {};
    Object.keys(unorderedFieldsets).sort().forEach((key) => orderedFieldsets[key] = unorderedFieldsets[key]);
    listOfFieldsets.innerHTML = '';
    for (let name in orderedFieldsets) {
      listOfFieldsets.appendChild(orderedFieldsets[name]);
    }
  });

  // Events - Import

  /**
   * @see https://stackoverflow.com/a/36930012/4223982
   */
  document
    .getElementById('import-button')
    .addEventListener('click', () => {
      const fileChooser = document.createElement('input');
      fileChooser.type = 'file';
      fileChooser.addEventListener('change', () => {
        const file = fileChooser.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          const storage = JSON.parse('' + reader.result);
          setFieldsets(storage.fieldsets);
          saveButton.click();
        };
        reader.readAsText(file);
        form.reset();
      });
      const form = document.createElement('form');
      form.appendChild(fileChooser);
      fileChooser.click();
    });

  // Events - Load defaults

  document
    .getElementById('load-defaults-button')
    .addEventListener('click', () => setFieldsets(app.initialStorage.fieldsets));

  // Events - Export

  /**
   * @see https://stackoverflow.com/a/23167789/4223982
   */
  document
    .getElementById('export-button')
    .addEventListener('click', () => {
      chrome.storage.sync.get(null, (storage) => {
        const result = JSON.stringify(storage);
        const url = 'data:application/json;base64,' + btoa(result);
        chrome.downloads.download({
          url: url,
          filename: 'context-menu-search.json',
        });
      });
    });

  // Events - Close option window

  document
    .getElementById('close-button-wrapper')
    .querySelector('button')
    .addEventListener('click', () => close());

});
