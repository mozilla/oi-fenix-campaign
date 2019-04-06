'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const fenixVersionInput = document.querySelector('#fenix');
  fenixVersionInput.value = navigator.userAgent;

  const androidVersionInput = document.querySelector('#android');
  const androidVersion = getAndroidVersion();
  if (androidVersion) {
    androidVersionInput.value = androidVersion;
  }
});

function getAndroidVersion(ua = navigator.userAgent) {
  const userAgent = ua.toLowerCase();
  const match = userAgent.match(/android\s([0-9]+\.*)*/i);
  return match ? match[1] : undefined;
};