'use strict';

let host = document.querySelector('#host');
let message = document.querySelector('#message');

chrome.storage.local.get('host', items => host.value = items.host);

document.querySelector('#save').addEventListener('click', () => {
  chrome.storage.local.set({ host: host.value }, () => {
    message.innerHTML = 'Saved';
    setTimeout(() => status.innerHTML = '', 2500);
  });
});
