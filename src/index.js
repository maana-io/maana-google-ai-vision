const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')
const faker = require('faker')

const vision = require('@google-cloud/vision')
const client = new vision.ImageAnnotatorClient()

const DETECTED_FEATURES = [
  'FACE_DETECTION',
  'LANDMARK_DETECTION',
  'LOGO_DETECTION',
  'LABEL_DETECTION',
  'IMAGE_PROPERTIES',
  'WEB_DETECTION',
  'PRODUCT_SEARCH'
]

const resolvers = {
  Query: {
    async getLabelsFromImage(parent, { videoFrame }) {
      let { url } = videoFrame

      let res = await client.annotateImage({
        image: {
          source: { imageUri: url }
        },
        features: DETECTED_FEATURES.map(type => ({
          type,
          maxResults: 50
        }))
      })

      videoFrame.id = '0'

      return {
        id: '0',
        videoFrame,
        imageDetectionLabel: res
      }
    }
  }
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => ({
    ...req
  })
})

server.start(() => console.log('Server is running on http://localhost:4000'))
