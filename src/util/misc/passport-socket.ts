import xtend from 'xtend'

export function parseCookie(auth: any, cookieHeader: any) {
  const cookieParser = auth.cookieParser(auth.secret)

  const req: any = {
    headers: {
      cookie: cookieHeader,
    },
  }

  let result

  cookieParser(req, {}, (err: Error) => {
    if (err) throw err

    result = req.signedCookies || req.cookies
  })

  return result
}

export function authorizeSocket(options: any) {
  const defaults = {
    passport: require('passport'),
    key: 'connect.sid',
    secret: null,
    store: null,
    success(data: any, accept: any) {
      accept()
    },
    fail(data: any, message: any, critical: any, accept: any) {
      accept(new Error(message))
    },
  }

  const auth = xtend(defaults, options)
  auth.userProperty = auth.passport._userProperty || 'user'

  if (!auth.cookieParser) {
    throw new Error('cookieParser is required use connect.cookieParser or express.cookieParser')
  }

  return (data: any, accept: any) => {
    // Check if session store is based on Redis
    if (!data.request) return auth.fail(data, 'socket.io 1.x is required')

    if (typeof auth.store === 'object') {
      data = data.request
      data.cookie = parseCookie(auth, data.headers.cookie || '')

      data.sessionID = data.cookie[auth.key] || ''
      data[auth.userProperty] = {
        // eslint-disable-next-line @typescript-eslint/camelcase
        logged_in: false,
      }

      if (data.xdomain && !data.sessionID)
        return auth.fail(
          data,
          'Can not read cookies from CORS-Requests. See CORS-Workaround in the readme.',
          false,
          accept
        )

      auth.store.get(data.sessionID, (err: any, session: any) => {
        if (err) return auth.fail(data, 'Error in session store:\n' + err.message, true, accept)
        if (!session) return auth.fail(data, 'No session found', false, accept)
        if (!session[auth.passport._key])
          return auth.fail(data, 'Passport was not initialized', true, accept)

        const userKey = session[auth.passport._key][auth.userProperty]

        if (!userKey)
          return auth.fail(
            data,
            'User not authorized through passport. (User Property not found)',
            false,
            accept
          )

        auth.passport.deserializeUser(userKey, (_err: any, user: any) => {
          if (_err) return auth.fail(data, _err, true, accept)
          if (!user) return auth.fail(data, 'User not found', false, accept)
          data[auth.userProperty] = user
          // eslint-disable-next-line @typescript-eslint/camelcase
          data[auth.userProperty].logged_in = true
          auth.success(data, accept)
        })
      })
    } else {
      return auth.fail(data, 'You have to use RedisStore as SessionStore', false, accept)
    }
  }
}

export function filterSocketsByUser(socketIo: any, filter: any) {
  const handshaken = socketIo.sockets.manager.handshaken
  return Object.keys(handshaken || {})
    .filter(skey => {
      return filter(handshaken[skey].user)
    })
    .map(skey => {
      return socketIo.sockets.manager.sockets.sockets[skey]
    })
}
