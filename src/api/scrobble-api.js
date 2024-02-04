/* eslint-env browser, amd */
;(function () { // eslint-disable-line no-extra-semi

  /**
   * Instantiable sound zone track scrobble API.
   *
   * @class
   * @param {string} zoneId - Zone id to fetch data for
   */
  function ScrobbleApi(zoneId) {
    if (typeof zoneId !== 'string' || !zoneId.length) {
      throw new Error('ScrobbleApi must be instantiated with a valid zoneId')
    }
    this.zoneId = zoneId
  }

  // API methods
  ScrobbleApi.mockScrobble = mockScrobble
  ScrobbleApi.prototype.fetchHistory = fetchHistory
  ScrobbleApi.prototype.subscribe = subscribe
  ScrobbleApi.prototype.unsubscribe = unsubscribe

  /**
   * Retrieves the latest scrobbles for the zone via the Radio API.
   *
   * @return {Promise} Resolves to array of scrobble objects.
   */
  function fetchHistory() {
    const url = 'https://radio.api.soundtrackyourbrand.com/sound_zones/'+this.zoneId+'/history_tracks/latest'
    return fetch(url, {
      headers: {
        'x-api-version': 10, // required header
      },
    }).then(res => res.json()).then(data => {
      // Scrobbles are returned in reverse order
      return data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    })
  }

  /**
   * Connect to the WebSocket API and subscribes to scrobble updates for the zone.
   * Includes a basic implmentation of the engine.io/socket.io protocols used
   * by the server, see the following pages for more details:
   * https://github.com/socketio/engine.io-protocol
   * https://github.com/socketio/socket.io-protocol
   *
   * @param {function} onScrobble - Function called whenever a track update is received
   * @return {object} WebSocket instance
   */
  function subscribe(onScrobble) {
    const self = this

    if (typeof onScrobble !== 'function') {
      throw new Error('ScrobbleApi must be instantiated with an onScrobble function')
    }

    self.socket = new WebSocket('wss://ws.soundtrackyourbrand.com/ws/?EIO=3&transport=websocket')

    function ping() {
      self.socket.send('2')
      self.pingTimeout = setTimeout(ping, 20e3)
    }

    this.socket.onopen = function onOpen() {
      console.info('[socket] connected')
    }
    this.socket.onclose = function onClose() {
      console.info('[socket] disconnected')
    }
    this.socket.onmessage = function onMessage(msg) {
      // Minimal socket.io protocol implmentation
      let i = 0, type, namespace, payload // eslint-disable-line no-unused-vars
      // Act on each possible packet type
      // eslint-disable-next-line default-case
      switch (parseInt(msg.data.charAt(i++), 10)) {
        case 0: // OPEN
          payload = JSON.parse(msg.data.substr(i))
          ping()
          // Subscribe to track scrobbles for the zone
          self.socket.send('40/sound_zone/'+self.zoneId+'/scrobbles')
          return
        case 4: // MESSAGE
          type = parseInt(msg.data.charAt(i++), 10)
          namespace = '/'
          if (msg.data.charAt(i) === '/') {
            const iNamespace = i
            while (i < msg.data.length && msg.data.charAt(++i) !== ',');
            namespace = msg.data.substring(iNamespace, i++)
          }
          if (i < msg.data.length) {
            // Message payloads have format [eventName, ...data]
            payload = JSON.parse(msg.data.substr(i))
            onScrobble(payload[1].data)
            console.info('[socket]', payload[1].data)
          }
          // console.info('[socket]', {type, namespace, payload })
      }
    }

    return self.socket
  }

  /**
   * Closes WebSocket scrobbles subscription if active.
   */
  function unsubscribe() {
    if (this.socket && this.socket.readyState < 2) {
      this.socket.close()
    }

    clearTimeout(this.pingTimeout)
  }

  /**
    Mocked track entities.
    Generated via:
    ```
    curl https://radio.api.soundtrackyourbrand.com/sound_zones/U291bmRab25lLCwxa21ubGNxZ3BvZy9Mb2NhdGlvbiwsMWp2bnk3aTdoMWMvQWNjb3VudCwsMW5kbWR6bmF5Z3cv/history_tracks/latest \
      -H 'x-api-version: 10' -H 'accept: application/json' | \
      jq '[.[] | { song_name, artists, colors, image_url, duration_ms, track_id, uri }]' | \
      sed -E "s/^([ \t]*)[\"']([^\"']+)[\"']:/\1\2:/" | \
      pbcopy
    ```
  */
  const MOCK_TRACKS = [
    {
      song_name: 'You Make My Dreams',
      artists: [
        {
          name: 'Daryl Hall & John Oates',
          uri: '4fHFnIMdNdCrxJwrmQ8pPj'
        }
      ],
      colors: {
        primary: '#e2e1df',
        accent: '#272321'
      },
      image_url: 'https://artwork-cdn.7static.com/static/img/sleeveart/00/002/938/0000293852_200.jpg',
      duration_ms: 190626,
      track_id: 'soundtrack:track:3pk0v8IzJuWrrcBvncVWyD',
      uri: 'spotify:track:4o6BgsqLIBViaGVbx5rbRk'
    },
    {
      song_name: 'Scars To Your Beautiful',
      artists: [
        {
          name: 'Alessia Cara',
          uri: '4cciI4QHkd1dvcCjs62uU5'
        }
      ],
      colors: {
        primary: '#b9c7ca',
        accent: '#a03942'
      },
      image_url: 'https://artwork-cdn.7static.com/static/img/sleeveart/00/051/826/0005182655_200.jpg',
      duration_ms: 230226,
      track_id: 'soundtrack:track:6tmsxyCEJr220A1i6qShVb',
      uri: 'spotify:track:42ydLwx4i5V49RXHOozJZq'
    },
    {
      song_name: 'Waka Waka (This Time for Africa) [The Official 2010 FIFA World Cup (TM) Song]',
      artists: [
        {
          name: 'Shakira',
          uri: '2yzHQzIGOeR2IvaMwY5aFI'
        },
        {
          name: 'Freshlyground',
          uri: '4FyOu0JTiIXNFgMLtEHHqa'
        }
      ],
      colors: {
        primary: '#ede9e1',
        accent: '#259957'
      },
      image_url: 'https://artwork-cdn.7static.com/static/img/sleeveart/00/008/226/0000822604_200.jpg',
      duration_ms: 202626,
      track_id: 'soundtrack:track:4kpEDB8T4WGkeIp6R8hfc9',
      uri: 'spotify:track:2Cd9iWfcOpGDHLz6tVA3G4'
    },
    {
      song_name: 'Sweet but Psycho',
      artists: [
        {
          name: 'Ava Max',
          uri: '2KPlbDoOrszHsoe0C9C8du'
        }
      ],
      colors: {
        primary: '#c8b1a1',
        accent: '#ba3d1a'
      },
      image_url: 'https://artwork-cdn.7static.com/static/img/sleeveart/00/138/013/0013801367_200.jpg',
      duration_ms: 187436,
      track_id: 'soundtrack:track:7t11dieIyGiyvvJytX1PHf',
      uri: 'spotify:track:7DnAm9FOTWE3cUvso43HhI'
    },
    {
      song_name: 'This Is What You Came For',
      artists: [
        {
          name: 'Calvin Harris',
          uri: '0kW6QDJPajgPy5APKtpZtX'
        },
        {
          name: 'Rihanna',
          uri: '4c2J7NUOmXPhEl3SRHimCS'
        }
      ],
      colors: {
        primary: '#bbc2d0',
        accent: '#0e2bbb'
      },
      image_url: 'https://artwork-cdn.7static.com/static/img/sleeveart/00/053/395/0005339516_200.jpg',
      duration_ms: 222160,
      track_id: 'soundtrack:track:0hIbwVdtM32opIWUS036MN',
      uri: 'spotify:track:0azC730Exh71aQlOt9Zj3y'
    },
    {
      song_name: 'I\'m Coming Out',
      artists: [
        {
          name: 'Diana Ross',
          uri: '623hr1m88CE7yVAPckmaSS'
        }
      ],
      colors: {
        primary: '#bababa',
        accent: '#121212'
      },
      image_url: 'https://artwork-cdn.7static.com/static/img/sleeveart/00/000/146/0000014687_200.jpg',
      duration_ms: 325266,
      track_id: 'soundtrack:track:3UerMrafbFmRDw0R1Uah2G',
      uri: 'spotify:track:0ew27xRdxSexrWbODuLfeE'
    },
    {
      song_name: 'Happy (From "Despicable Me 2")',
      artists: [
        {
          name: 'Pharrell Williams',
          uri: '7wEoGi9yFUb7mt542MmELn'
        }
      ],
      colors: {
        primary: '#9b7c66',
        accent: '#dbab29'
      },
      image_url: 'https://artwork-cdn.7static.com/static/img/sleeveart/00/097/375/0009737539_200.jpg',
      duration_ms: 232720,
      track_id: 'soundtrack:track:556IgpLbfzKioXbwUTzpAH',
      uri: 'spotify:track:60nZcImufyMA1MKQY3dcCH'
    },
    {
      song_name: 'Faded',
      artists: [
        {
          name: 'Alan Walker',
          uri: '72N6b4O54y3w4egF2ADNAh'
        }
      ],
      colors: {
        primary: '#e9dba3',
        accent: '#1b1c27'
      },
      image_url: 'https://artwork-cdn.7static.com/static/img/sleeveart/00/087/343/0008734377_200.jpg',
      duration_ms: 212106,
      track_id: 'soundtrack:track:5yRGNJh05HuxqeO8CfQ988',
      uri: 'spotify:track:698ItKASDavgwZ3WjaWjtz'
    },
    {
      song_name: 'New Rules',
      artists: [
        {
          name: 'Dua Lipa',
          uri: '0ajDEtqfMCjz2DiigWJWoo'
        }
      ],
      colors: {
        primary: '#ad959f',
        accent: '#130a11'
      },
      image_url: 'https://artwork-cdn.7static.com/static/img/sleeveart/00/064/764/0006476404_200.jpg',
      duration_ms: 209320,
      track_id: 'soundtrack:track:0WeDR3AbVeYtliL9YuqURB',
      uri: 'spotify:track:2ekn2ttSfGqwhhate0LSR0'
    },
    {
      song_name: 'Just the Two of Us (feat. Bill Withers)',
      artists: [
        {
          name: 'Jr.',
          uri: '4bZXRPQZRsB6YGYlp8ZaJ6'
        },
        {
          name: 'Grover Washington, Jr.',
          uri: '109dqwCGdSdyAopX2LOQj6'
        },
        {
          name: 'Bill Withers',
          uri: '1Lx59mIUqmJqYPt3ucM26F'
        }
      ],
      colors: {
        primary: '#463138',
        accent: '#b2485b'
      },
      image_url: 'https://artwork-cdn.7static.com/static/img/sleeveart/00/004/609/0000460982_200.jpg',
      duration_ms: 237106,
      track_id: 'soundtrack:track:0uiA0whoNYuGASF87Qio43',
      uri: 'spotify:track:1ko2lVN0vKGUl9zrU0qSlT'
    },
    {
      song_name: 'Higher Love',
      artists: [
        {
          name: 'Kygo',
          uri: '19YhJTULBl968CZF8FYT5f'
        },
        {
          name: 'Whitney Houston',
          uri: '3ISZIXYut3j32klI2eaBAP'
        }
      ],
      colors: {
        primary: '#b6b6b5',
        accent: '#d30453'
      },
      image_url: 'https://artwork-cdn.7static.com/static/img/sleeveart/00/097/376/0009737601_200.jpg',
      duration_ms: 228267,
      track_id: 'soundtrack:track:0hfHDGybnQu6QlGJnbgfYw',
      uri: 'spotify:track:6oJ6le65B3SEqPwMRNXWjY'
    },
    {
      song_name: 'Starving',
      artists: [
        {
          name: 'Hailee Steinfeld',
          uri: '4mVrsMDEJRmLMbEPJjhjet'
        },
        {
          name: 'Grey',
          uri: '3jK5Euaa0MMLtvXxf19LFB'
        },
        {
          name: 'Zedd',
          uri: '0PXi20NlXzc53jUHAC4HXJ'
        }
      ],
      colors: {
        primary: '#c1a49e',
        accent: '#97112c'
      },
      image_url: 'https://artwork-cdn.7static.com/static/img/sleeveart/00/055/817/0005581785_200.jpg',
      duration_ms: 181880,
      track_id: 'soundtrack:track:44Lu1GecivaqQgvWDXkh7g',
      uri: 'spotify:track:4Ce37cRWvM1vIGGynKcs22'
    },
    {
      song_name: 'Harder, Better, Faster, Stronger',
      artists: [
        {
          name: 'Daft Punk',
          uri: '1PQsyKzCPVuxXSrbDaGtZe'
        }
      ],
      colors: {
        primary: '#cac9cc',
        accent: '#a4411b'
      },
      image_url: 'https://artwork-cdn.7static.com/static/img/sleeveart/00/000/454/0000045472_200.jpg',
      duration_ms: 224693,
      track_id: 'soundtrack:track:4iFiuP9PNlAOIToTr1Rf6X',
      uri: 'spotify:track:5W3cjX2J3tjhG8zb6u0qHn'
    },
  ]

  /**
   * Returns a mocked scrobble object.
   *
   * @return {Object} Mocked scrobble object
   */
  function mockScrobble() {
    const mock = MOCK_TRACKS[Math.floor(Math.random() * MOCK_TRACKS.length)]
    return Object.assign({}, mock, {
      channel_name: 'Mock Soundtrack',
      created_at: new Date().toJSON(),
      id: Math.random().toString(36).substr(2),
    })
  }

  // Export as AMD/CommonJS module or global variable
  if (typeof module !== 'undefined' && module.exports) {
    ScrobbleApi.default = ScrobbleApi
    module.exports = ScrobbleApi
  } else if (typeof define === 'function' && typeof define.amd === 'object') {
    define('api', [], function() { return ScrobbleApi })
  } else {
    window.ScrobbleApi = ScrobbleApi
  }
}()); // eslint-disable-line semi
