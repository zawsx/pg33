(global => { 'use strict';
  importScripts('./bower_components/sw-toolbox/sw-toolbox.js');// Load the sw-toolbox library.
  importScripts('./js/offline-google-analytics-import.js'); goog.offlineGoogleAnalytics.initialize();// Load the Offline Google Analytics library
  global.toolbox.options.debug = true;// Turn on debug logging, visible in the Developer Tools' console.
  toolbox.precache([ './index.html', './about.html', './style.html', './beer.html']);// We want to precache these items

  // The route for any requests from the googleapis origin
  toolbox.router.get('/(.*)', global.toolbox.cacheFirst, { cache: { name: 'googleapis',  maxEntries: 30,  maxAgeSeconds: 604800 },
    origin: /\.googleapis\.com$/, networkTimeoutSeconds: 4 }); // Set a timeout threshold of 2 seconds

  toolbox.router.get('/(.*)', global.toolbox.cacheFirst, { cache: { name: 'fonts', maxEntries: 30,  maxAgeSeconds: 604800},
    origin: /\.gstatic\.com$/,  networkTimeoutSeconds: 4}); // Set a timeout threshold of 2 seconds

  toolbox.router.get('/beer/css/(.*)', global.toolbox.cacheFirst, {cache: {name: 'beer-stylesheets', maxEntries: 10, maxAgeSeconds: 604800 },
    networkTimeoutSeconds: 4 }); // Set a timeout threshold of 2 seconds

  toolbox.router.get('/beer/images/(.*)', global.toolbox.cacheFirst, {cache: { name: 'beer-images',  maxEntries: 300, maxAgeSeconds: 604800 },
    networkTimeoutSeconds: 4 });// Set a timeout threshold of 2 seconds

  toolbox.router.get('/beer/js/(.*)', global.toolbox.cacheFirst, {cache: { name: 'beer-javascript',  maxEntries: 10,  maxAgeSeconds: 604800 },
    networkTimeoutSeconds: 4 });// Set a timeout threshold of 2 seconds

  toolbox.router.get('/(.*)', global.toolbox.cacheFirst, {cache: { name: 'beer-images-amazon',  maxEntries: 200,  maxAgeSeconds: 604800 },
    origin: /\.amazonaws\.com$/,  networkTimeoutSeconds: 4 });// Set a timeout threshold of 2 seconds

  toolbox.router.get('/beer/data/(.*)', global.toolbox.cacheFirst, {cache: {name: 'beer-data',  maxEntries: 200, maxAgeSeconds: 604800 },
    networkTimeoutSeconds: 4 });// Set a timeout threshold of 2 seconds
  // Ensure that our service worker takes control of the page as soon as possible.
  global.addEventListener('install', event => event.waitUntil(global.skipWaiting()));
  global.addEventListener('activate', event => event.waitUntil(global.clients.claim()));
})(self);

function getFilenameFromUrl(path){path = path.substring(path.lastIndexOf("/")+ 1); return (path.match(/[^.]+(\.[^?#]+)?/) || [])[0];}

// Add in some offline functionality
this.addEventListener('fetch', event => {
  // request.mode = navigate isn't supported in all browsers so include a check for Accept: text/html header.
  if (event.request.mode === 'navigate' || (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {
        event.respondWith(fetch(event.request.url).catch(error => {
              var cachedFile = getFilenameFromUrl(event.request.url); return caches.match(cachedFile); }) );  } // Return the offline page

  // Check for WebP support
  if (/\.jpg$|.gif$|.png$/.test(event.request.url)) {let supportsWebp = false; // Inspect the accept header for WebP support
    if (event.request.headers.has('accept')){supportsWebp = event.request.headers.get('accept').includes('webp');}
    if (supportsWebp) {let returnUrl = event.request.url.substr(0, event.request.url.lastIndexOf(".")) + ".webp"; // // If supported, build the return URL
        event.respondWith( fetch(returnUrl, { mode: 'no-cors' }) );  } }});