var apiUrl = 'http://spacetimesurveyor.heroku.com'
var appUrl = 'http://spacetime.nypl.org/surveyor/'

// TODO: show loading text + lion?
// TODO: add 'click here to geotag/open in surveyor button'
// TODO: load MODS?

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

const setImage = (item) => {
  var image = document.getElementById('image')
  image.style.backgroundImage = `url(${item.image_link})`
  image.href = `${appUrl}${item.uuid}`

  return item
}

const setHeader = (item, collections, mods) => {
  var headerTitle = document.getElementById('header-title')
  var headerCollection = document.getElementById('header-collection')
  var headerLink = document.getElementById('header-link')
  var footerLink = document.getElementById('footer-link')

  headerTitle.innerHTML = item.title

  var collection = collections.filter((collection) => collection.uuid === item.collection)[0]
  headerCollection.href = `http://digitalcollections.nypl.org/items/${item.collection}`
  headerCollection.innerHTML = collection ? collection.title : ''

  headerLink.href = `http://digitalcollections.nypl.org/items/${item.uuid}`
  footerLink.href = `${appUrl}${item.uuid}`

  document.getElementById('header').className = ''
  document.getElementById('footer').className = ''
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
