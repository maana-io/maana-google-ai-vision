require('dotenv').config()
const hash = require('object-hash')
const { ImageAnnotatorClient } = require('@google-cloud/vision')
const imageAnnotator = new ImageAnnotatorClient({
  projectId: 'maana-df-test'
})

const DETECTED_FEATURES = [
  'TYPE_UNSPECIFIED',
  'FACE_DETECTION',
  'TEXT_DETECTION',
  'LANDMARK_DETECTION',
  'LOGO_DETECTION',
  'LABEL_DETECTION',
  'OBJECT_LOCALIZATION',
  // 'IMAGE_PROPERTIES',
  'WEB_DETECTION',
  'PRODUCT_SEARCH'
]

const annotateImage = async ({ image }) => {
  try {
    const res = await imageAnnotator.annotateImage({
      image: {
        source: { imageUri: image.id }
      },
      features: DETECTED_FEATURES.map(type => ({
        type,
        maxResults: 5
      }))
    })
    return res
  } catch (e) {
    throw e
  }
}

const analyzeImage = async ({ image }) => {
  try {
    // Get the raw results
    const raw = (await annotateImage({ image }))[0]
    // console.log(raw)

    // Conform to return requirements
    // ---
    const webDetection = raw.webDetection
    const webEntities = webDetection.webEntities.map(x => ({
      id: x.entityId,
      ...x
    }))
    const bestGuessLabels = webDetection.bestGuessLabels.map(x => ({
      id: x.label,
      languageCode: { id: x.languageCode }
    }))

    const localizedObjectAnnotations = raw.localizedObjectAnnotations.map(
      x => ({
        id: x.mid,
        name: x.name,
        score: x.score,
        boundingPoly: {
          id: hash(x.boundingPoly),
          vertices: x.boundingPoly.vertices,
          normalizedVertices: x.boundingPoly.normalizedVertices.map(v => ({
            id: `(${v.x}, ${v.y})`,
            ...v
          }))
        }
      })
    )

    const labelAnnotations = raw.labelAnnotations.map(x => ({
      id: x.mid,
      score: x.score,
      description: x.description
    }))

    return {
      id: image.id,
      labelAnnotations,
      localizedObjectAnnotations,
      webDetection: { id: image.id, webEntities, bestGuessLabels }
    }
  } catch (e) {
    throw e
  }
}

export const resolver = {
  Query: {
    info: async () => {
      return {
        id: 'maana-google-ai-vision',
        name: 'maana-google-ai-vision',
        description: 'Maana Q Knowledge Service wrapper for Google Cloud vision'
      }
    },
    analyzeImage: async (_, args) => analyzeImage(args)
    // analyzeImageJson: async (_, args) => {
    //   const res = await analyzeImage(args)
    //   return JSON.stringify(res)
    // }
  }
}
