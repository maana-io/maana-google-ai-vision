require('dotenv').config()

const { ImageAnnotatorClient } = require('@google-cloud/vision')
const imageAnnotator = new ImageAnnotatorClient({
  projectId: 'maana-df-test'
})

const DETECTED_FEATURES = [
  'FACE_DETECTION',
  'LANDMARK_DETECTION',
  'LOGO_DETECTION',
  'LABEL_DETECTION',
  'IMAGE_PROPERTIES',
  'WEB_DETECTION',
  'PRODUCT_SEARCH'
]

export const resolver = {
  Query: {
    // info: async () => {
    //   return {
    //     id: 'maana-google-ai-vision',
    //     name: 'maana-google-ai-vision',
    //     description: 'Maana Q Knowledge Service wrapper for Google Cloud vision'
    //   }
    // },
    annotateImage: async (_, { image }) => {
      try {
        const res = await imageAnnotator.annotateImage({
          image: {
            source: { imageUri: image.id }
          },
          features: DETECTED_FEATURES.map(type => ({
            type,
            maxResults: 50
          }))
        })
        console.log('Res', JSON.stringify(res, null, 2))
        return {
          id: image.id,
          imageDetectionLabel: res
        }
      } catch (e) {
        throw e
      }
    }
  }
}
