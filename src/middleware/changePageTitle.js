import isServer from '../utils/isServer'

export default async (req, next) => {
  const title = req.getTitle()

  if (!isServer() && typeof title === 'string') {
    window.document.title = title
  }

  return next()
}