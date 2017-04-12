// Source: http://waverleysoftware.com/blog/building-progressive-web-apps/

// Cache names
var dataCacheName = 'COFFEEData-v1.1.4'
var cacheName = 'coffeePWA-1.5'

// Application shell files to be cached
var filesToCache = [
       '/Coffee_Dex/main_page.html', 
       '/Coffee_Dex/coffee_favorites.html',       
       '/Coffee_Dex/coffee_hunter.html',       
       '/Coffee_Dex/CoffeeStorage.html',       
       '/Coffee_Dex/EnterPhoneNumber.html',       
       '/Coffee_Dex/login.html',             
       '/Coffee_Dex/QuickCompare.html',       
       '/Coffee_Dex/reset_password.html',       
       '/Coffee_Dex/SearchForCoffee.html',
       '/Coffee_Dex/ShareWithFriends.html',
       
       '/Coffee_Dex/js/app.min.js',
       
       '/Coffee_Dex/css/coffee.css',
       
       '/Coffee_Dex/Dummy/login_coffee.png',
       '/Coffee_Dex/Dummy/americano.jpg',
       '/Coffee_Dex/Dummy/cappuccino.png',
       '/Coffee_Dex/Dummy/caramel macchiato.jpg',
       '/Coffee_Dex/Dummy/coffee_cup.jpg',
       '/Coffee_Dex/Dummy/coffeeBean.png',
       '/Coffee_Dex/Dummy/espresso.jpg',
       '/Coffee_Dex/Dummy/maps.png',
       '/Coffee_Dex/Dummy/phone.png',
       '/Coffee_Dex/Dummy/vanilla latte.jpg',
       '/Coffee_Dex/Dummy/white mocha.jpg',
]

self.addEventListener('install', function (e) {
      // Debug message
      console.log('[ServiceWorker] Install')

      e.waitUntil(
             caches.open(cacheName).then(function (cache) {
                     console.log('[ServiceWorker] Caching app shell')
                     return cache.addAll(filesToCache)
              })
      )
})

self.addEventListener('activate', function (e) {
      // Debug message
      console.log('[ServiceWorker] Activate')

      e.waitUntil(
              caches.keys().then(function (keyList) {
                       return Promise.all(keyList.map(function (key) {
                               if (key !== cacheName && key !== dataCacheName) {
                                    console.log('[ServiceWorker] Removing old cache', key)
                                    return caches.delete(key)
                               }
                        }))
              })
      )

      return self.clients.claim()
})

self.addEventListener('fetch', function (e) {
      // Debug message
      console.log('[ServiceWorker] Fetch', e.request.url)

      e.respondWith(
             caches.match(e.request).then(function (response) {
                     return response || fetch(e.request)
             })
       )
})