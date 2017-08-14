// Production:
var API_URL = 'https://brick-by-brick.herokuapp.com/'
var APP_URL = 'http://spacetime.nypl.org/surveyor/#/'

// Development:
// API_URL = 'http://brick-by-brick.dev/'
// APP_URL = 'http://localhost:3224/#/'

var ORGANIZATION = 'nypl'
var MAX_TITLE_LENGTH = 150

function checkStatus (response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

function parseJSON (response) {
  return response.json()
}

function callAPI (path) {
  return fetch(API_URL + path, {
    credentials: 'include'
  })
  .then(checkStatus)
  .then(parseJSON)
}

function setMessage (message) {
  var element = document.getElementById('message')
  element.innerHTML = message
}

function getOfflineItems () {
  return fetch('offline/offline-items.json')
    .then(checkStatus)
    .then(parseJSON)
}

function getOfflineItem () {
  getOfflineItems()
    .then(function (items) {
      var item = items[Math.floor(Math.random() * items.length)]
      setImage(item, true)
    })
}

function getOfflineImage () {
  getOfflineItems()
    .then(function (items) {
      var offlinePhotos = items.filter(function (item) {
        return item.data.offline_url
      })

      var item = offlinePhotos[Math.floor(Math.random() * offlinePhotos.length)]

      item.data.image_urls = [{
        size: 760,
        url: item.data.offline_url
      }]

      setImage(item, true, true)
    })
}

function brickByBrickError (err) {
  getOfflineItem()
}

function imageError (err, offlineImage) {
  if (offlineImage) {
    setMessage('Failed to load image')
  } else {
    getOfflineImage()
  }
}

function imageLoaded (item, offline) {
  setMessage('')
  window.setTimeout(function () {
    setMetadata(item, offline)
  }, 250)
  document.getElementById('image').classList.add('fade-in')
}

function showModal () {
  document.getElementById('modal').classList.remove('hidden')
  setTimeout(function () {
    document.getElementById('modal').classList.add('fade-in')
  }, 10)

  document.querySelector('#modal article').scrollTop = 0
}

function hideModal () {
  document.getElementById('modal').classList.remove('fade-in')

  setTimeout(function () {
    document.getElementById('modal').classList.add('hidden')
  }, 250)
}

window.addEventListener('keydown', function (event) {
  if (event.keyCode === 27) {
    hideModal()
  }
})

document.querySelectorAll('.back-button')
  .forEach(function (element) {
    element.addEventListener('click', hideModal)
  })
document.getElementById('modal').addEventListener('click', function (event) {
  if (event.target === this) {
    hideModal()
  }
})

function setImage (item, offlineItem, offlineImage) {
  var image = document.getElementById('image')
  var modalImage = document.getElementById('modal-image')

  var title = item.data.title
  var imageUrls = item.data.image_urls

  // TODO: imageUrls[0] is always 760px wide,
  //   but if bigger sizes are available, they sometimes
  //   are rotated and include ruler and color strip
  var imageUrl = imageUrls[0].url

  image.src = imageUrl
  modalImage.src = imageUrl
  image.classList.remove('hidden')

  image.alt = item.data.title
  modalImage.alt = title

  if (image.complete) {
    imageLoaded(item, offlineItem)
  } else {
    image.addEventListener('load', function () {
      imageLoaded(item, offlineItem)
    })
    image.addEventListener('error', function () {
      imageError(item, offlineImage)
    })
  }

  return item
}

function querySelectorAllHide (selectors) {
  document.querySelectorAll(selectors)
    .forEach(function (element) {
      element.classList.add('hidden')
    })
}

function querySelectorAllShow (selectors) {
  document.querySelectorAll(selectors)
    .forEach(function (element) {
      element.classList.remove('hidden')
    })
}

function setMetadata (item, offline) {
  var headerTitle = document.getElementById('header-title')
  var headerLink = document.getElementById('header-link')
  var surveyorLink = document.getElementById('surveyor-link')
  var moreInformationLink = document.getElementById('more-information')

  var modalTitle = document.getElementById('modal-title')
  var modalCollection = document.getElementById('modal-collection')
  var modalLocation = document.getElementById('modal-location')
  var modalDate = document.getElementById('modal-date')
  var modalDigitalCollectionsLink = document.getElementById('modal-digital-collections-link')
  var modalSurveyorLink = document.getElementById('modal-surveyor-link')

  moreInformationLink.addEventListener('click', showModal)

  // Break long titles on first space before MAX_TITLE_LENGTH
  var title = item.data.title
  if (title.length > MAX_TITLE_LENGTH) {
    for (var i = MAX_TITLE_LENGTH; i > 0; i--) {
      if (title[i] === ' ') {
        title = title.slice(0, i) + ' …'
        break
      }
    }
  }

  var digitalCollectionsHref = 'https://digitalcollections.nypl.org/items/' + item.id
  var collectionHref = 'https://digitalcollections.nypl.org/items/' + item.collection.id
  var surveyorHref = APP_URL + item.id

  headerTitle.innerHTML = title
  headerLink.href = digitalCollectionsHref
  surveyorLink.href = surveyorHref

  modalTitle.innerHTML = item.data.title
  modalCollection.href = collectionHref
  modalCollection.innerHTML = item.collection.title

  if (item.data.date) {
    modalDate.innerHTML = item.data.date
    querySelectorAllShow('.modal-date-dl')
  } else {
    modalDate.innerHTML = ''
    querySelectorAllHide('.modal-date-dl')
  }

  if (item.data.location) {
    modalLocation.innerHTML = item.data.location
    querySelectorAllShow('.modal-location-dl')
  } else {
    modalLocation.innerHTML = ''
    querySelectorAllHide('.modal-location-dl')
  }

  modalDigitalCollectionsLink.href = digitalCollectionsHref
  modalSurveyorLink.href = surveyorHref

  if (!offline) {
    document.getElementsByTagName('footer')[0].classList.remove('hidden')
    querySelectorAllShow('.hide-offline')
  }

  document.getElementsByTagName('header')[0].classList.remove('hidden')
}

function setLoading () {
  setMessage('Loading…')

  document.getElementsByTagName('header')[0].classList.add('hidden')
  document.getElementsByTagName('footer')[0].classList.add('hidden')
  document.getElementById('image').classList.remove('fade-in')
}

function getItem (uuid) {
  setLoading()

  var url = 'tasks/geotag-photo/items/random'
  var params = {
    organization: ORGANIZATION,
    source: 'chrome-tab'
  }

  if (uuid) {
    url = 'organizations/' + ORGANIZATION + '/items/' + uuid
    delete params.organization
  }

  if (Object.keys(params).length) {
    url += '?' + Object.keys(params).map(function (param) {
      return param + '=' + params[param]
    }).join('&')
  }

  callAPI(url)
    .then(setImage)
    .catch(brickByBrickError)
}

getItem()
