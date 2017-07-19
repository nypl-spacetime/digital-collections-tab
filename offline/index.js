const fs = require('fs')
const path = require('path')
const got = require('got')
const R = require('ramda')
const H = require('highland')
const JSONStream = require('JSONStream')

if (!process.argv[2]) {
  console.error('Please supply the location of dc-to-brick\'s data directory as a command line argument!')
  process.exit(1)
}

const dataDir = process.argv[2]
const itemsPath = path.join(dataDir, 'items.ndjson')
const allCollections = require(path.join(dataDir, 'collections.json'))
const includeCollections = require('./collections.json')
const offlinePhotos = require('./offline-photos.json')

const collectionsById = {}
allCollections.forEach((collection) => {
  collectionsById[collection.uuid] = R.omit(['include'], collection)
})

H(fs.createReadStream(itemsPath))
  .split()
  .compact()
  .map(JSON.parse)
  .filter((item) => includeCollections.includes(item.collection_id))
  .map((item) => {
    if (offlinePhotos.includes(item.id)) {
      const imageId = item.data.image_id
      const imageUrl = item.data.image_urls[0]
      const jpgPath = path.join(__dirname, 'photos', `${imageId}.jpg`)

      if (!fs.existsSync(jpgPath)) {
        got.stream(imageUrl.url)
          .pipe(fs.createWriteStream(jpgPath))
      }

      item.data.offline_url = `offline/photos/${imageId}.jpg`
    }

    return {
      id: item.id,
      organization:  {
        id: 'nypl'
      },
      collection: collectionsById[item.collection_id],
      data: item.data
    }
  })
  .pipe(JSONStream.stringify())
  .pipe(fs.createWriteStream(path.join(__dirname, 'offline-items.json')))
