// Production:
var API_URL = 'http://brick-by-brick.herokuapp.com/'
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

function showError (err) {
  console.error(err)
  setMessage('Failed to load image')
}

function imageLoaded () {
  setMessage('')
  document.getElementsByTagName('header')[0].classList.remove('hidden')
  document.getElementsByTagName('footer')[0].classList.remove('hidden')
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

document.getElementById('back-button').addEventListener('click', hideModal)
document.getElementById('modal').addEventListener('click', function (event) {
  if (event.target === this) {
    hideModal()
  }
})

function setImage (item) {
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
    imageLoaded()
  } else {
    image.addEventListener('load', imageLoaded)
    image.addEventListener('error', showError)
  }

  return item
}

function setMetadata (item) {
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

  var digitalCollectionsHref = 'http://digitalcollections.nypl.org/items/' + item.id
  var collectionHref = 'http://digitalcollections.nypl.org/items/' + item.collection.id
  var surveyorHref = APP_URL + item.id

  headerTitle.innerHTML = title
  headerLink.href = digitalCollectionsHref
  surveyorLink.href = surveyorHref

  modalTitle.innerHTML = item.data.title
  modalCollection.href = collectionHref
  modalCollection.innerHTML = item.collection.title

  if (item.data.date) {
    modalDate.innerHTML = item.data.date
    modalDate.parentElement.classList.remove('hidden')
  } else {
    modalDate.innerHTML = ''
    modalDate.parentElement.classList.add('hidden')
  }

  if (item.data.location) {
    modalLocation.innerHTML = item.data.location
    modalLocation.parentElement.classList.remove('hidden')
  } else {
    modalLocation.innerHTML = ''
    modalLocation.parentElement.classList.add('hidden')
  }

  modalDigitalCollectionsLink.href = digitalCollectionsHref
  modalSurveyorLink.href = surveyorHref
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
    .then(setMetadata)
    .catch(showError)
}

getItem()
