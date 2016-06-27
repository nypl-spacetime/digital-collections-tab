var apiUrl = 'http://where-api.dev/'
var appUrl = 'http://localhost:3000/#/'

// TODO: show loading text + lion?
// TODO: add 'click here to geotag/open in surveyor button'
// TODO: load MODS, add title + metadata

const checkStatus = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

const parseJSON = (response) => response.json()

const callAPI = (path) => fetch(`${apiUrl}${path}`, {
    credentials: 'include'
  })
  .then(checkStatus)
  .then(parseJSON)

const loadItem = (callback) => {
  fetch(`${apiUrl}items/random`, {
    credentials: 'include'
  })
  .then(checkStatus)
  .then(parseJSON)
  .then(function(json) {
    callback(null, json)
  }).catch(function(error) {
    callback(error)
  })
}

const setImage = (item) => {
  var image = document.getElementById('image')
  image.style.backgroundImage = `url(${item.image_link})`
  image.href = `${appUrl}${item.uuid}`

  return item
}

const setHeader = (item, collections, mods) => {
  var titleElement = document.getElementById('header-title')
  var collectionElement = document.getElementById('header-collection')
  var linkElement = document.getElementById('header-link')

  titleElement.innerHTML = item.title

  var collection = collections.filter((collection) => collection.uuid === item.collection)[0]
  collectionElement.href = `http://digitalcollections.nypl.org/items/${item.collection}`
  collectionElement.innerHTML = collection ? collection.title : ''

  linkElement.href = `http://digitalcollections.nypl.org/items/${item.uuid}`
}

callAPI('items/random')
  .then(setImage)
  .then((item) => Promise.all([
      item,
      callAPI('collections'),
      // callAPI(`items/${item.uuid}/mods`)
  ]))
  .then((results) => setHeader.apply(null, results))
  .catch((err) => console.error(err.message))
