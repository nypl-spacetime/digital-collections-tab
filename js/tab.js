var apiUrl = 'http://where-api.dev/'
var appUrl = 'http://localhost:3000/#/'

// TODO: show loading text + lion?
// TODO: add 'click here to geotag/open in surveyor button'
// TODO: load MODS, add title + metadata

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

function loadItem (callback) {
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

loadItem((err, item) => {
  if (err) {
    console.error(err.message)
    return
  }

  var image = document.getElementById('image')
  image.style.backgroundImage = `url(${item.image_link})`
  image.href = `${appUrl}${item.uuid}`
})
