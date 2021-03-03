
const sha1 = require('sha1')

const config = require('../config')

module.exports = () => {
  return (req, res, next) => {
    console.log('query: ', req.query)
    const { signature, echostr, timestamp, nonce } = req.query
    const { token } = config
    const arr = [timestamp, nonce, token]
    const arrSort = arr.sort()
    console.log('arrSort: ', arrSort)
    const str = arr.join('')
    console.log('str: ', str)
    const sha1Str = sha1(str)
    console.log('sha1Str: ', sha1Str)
    if (sha1Str === signature) {
      res.send(echostr)
    } else {
      res.end('error')
    }
    /**
     * {
    signature: 'babf6c36233dbf186441a17557f42e29b80140d1',
    echostr: '2192186420955701113',
    timestamp: '1614667121',
    nonce: '955998580'
  }
     */
  }
}