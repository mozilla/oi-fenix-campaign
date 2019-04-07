'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const fenixVersionInput = document.querySelector('#fenix');
  fenixVersionInput.value = navigator.userAgent;

  const androidVersionInput = document.querySelector('#android');
  const androidVersion = getAndroidVersion();
  if (androidVersion) {
    androidVersionInput.value = androidVersion;
  }

  const deviceInput = document.querySelector('#device');
  deviceInput.addEventListener('change', (evt) => {
    const value = evt.target.value;
    localStorage.setItem('FENIX_BUG_DEVICE', value);
  });
  const savedDevice = localStorage.getItem('FENIX_BUG_DEVICE');
  if (savedDevice) {
    deviceInput.value = savedDevice;
  }
});

function getAndroidVersion(ua = navigator.userAgent) {
  const userAgent = ua.toLowerCase();
  const match = userAgent.match(/Android\s(([0-9]+\.*)*)/i);
  return match ? match[1] : undefined;
};