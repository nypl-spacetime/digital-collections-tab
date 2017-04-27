var API_URL = 'http://brick-by-brick.dev/'
var APP_URL = 'http://localhost:3224/#/'
var ORGANIZATION = 'nypl'

// var APP_URL = 'http://spacetime.nypl.org/surveyor/#/'

// TODO: add 'click here to geotag/open in surveyor button'

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

function setImage (item) {
  var image = document.getElementById('image')
  var imageLink = document.getElementById('image-link')

  var imageUrls = item.data.image_urls

  // TODO: imageUrls[0] is always 760px wide,
  //   but if bigger sizes are available, they sometimes
  //   are rotated and include ruler and color strip
  image.src = imageUrls[0].url
  image.className = ''
  image.alt = item.data.title

  imageLink.href = APP_URL + item.id

  return item
}

function setHeader (item) {
  var headerTitle = document.getElementById('header-title')
  var headerCollection = document.getElementById('header-collection')
  var headerLink = document.getElementById('header-link')
  var footerLink = document.getElementById('footer-link')

  headerTitle.innerHTML = item.data.title
  headerCollection.href = 'http://digitalcollections.nypl.org/items/' + item.collection.id
  headerCollection.innerHTML = item.collection.title

  headerLink.href = 'http://digitalcollections.nypl.org/items/' + item.id
  footerLink.href = APP_URL + item.id

  document.getElementsByTagName('header')[0].className = ''
  document.getElementsByTagName('footer')[0].className = ''
}

callAPI('tasks/geotag-photo/items/random?organization=' + ORGANIZATION)
  .then(setImage)
  .then(setHeader)
  .catch((err) => {
    var message = document.getElementById('message')
    message.innerHTML = 'Failed to load image'
  })
