import isLoadSSR from '../utils/isClientLoadSSR'
import isServer from '../utils/isServer'

const noop = function() {}
const isFalse = (a, b) => a === false || b === false

export default (name, config = {}) => async (req, next = noop) => {
  const shouldCall = req.options.shouldCall || defaultShouldCall
  if (!shouldCall(req, name, config)) return next()

  const { prev } = config
  const route = prev ? req.prevRoute : req.route
  const routeCb = route[name] || noop
  const globalCb = req.options[name] || noop

  const [a, b] = await Promise.all([routeCb(req), globalCb(req)])

  if (isFalse(a, b)) return false

  await next()

  return a || b
}

const defaultShouldCall = (req, name, config) => {
  const state = req.getLocationState()

  if (isLoadSSR(state, 'init') && /beforeLeave|beforeEnter/.test(name)) return false
  if (isServer() && /onLeave|onEnter/.test(name)) return false
  if (isLoadSSR(state) && name === 'thunk') return false
  if (name === 'beforeLeave' && state.kind === 'init') return false
  if (name === 'onLeave' && state.kind === 'load') return false

  return true
}
