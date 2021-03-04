
const sha1 = require('sha1')

const config = require('../config')

// 引入tool模块
const { getUserDataAsync, parseXMLAsync, formatMessage } = require('../utils/tool')

module.exports = () => {
  return async (req, res, next) => {
    console.log('query: ', req.query)
    const { signature, echostr, timestamp, nonce } = req.query
    const { token } = config
    /**
     * 1. 将参与微信加密签名的三个参数(timestamp, nonce, token)按照字典顺序并组合在一起形成一个数组
     * 2. 将数组里所有参数拼接成一个字符串，进行sha1加密
     * 3. 加密完成就生成了一个signatrue, 和微信发送过来的进行对比
     */
    const sha1Str = sha1([timestamp, nonce, token].sort().join(''))

    /*
      微信服务器会发送两种类型的消息给开发者服务器
        1. GET请求
          - 验证服务器的有效性
        2. POST请求
          - 微信服务器会将用户发送的数据以POST请求的方式转发到开发者服务器上
     */
    if (req.method === 'GET') {
      if (sha1Str === signature) {
        // 如果一样，说明消息来自于微信服务器，返回echostr给微信服务器
        res.send(echostr);
      } else {
        // 如果不一样，说明不是微信服务器发送的消息，返回error
        res.end('error');
      }
    } else if (req.method === 'POST') {
      // - 微信服务器会将用户发送的数据以POST请求的方式转发到开发者服务器上
      // - 验证消息来自于微信服务器
      if (sha1Str !== signature) {
        // 说明消息不是来自于微信服务器
        res.end('error')
      }

      // console.log('req.query: ', req.query)

      /**
       * {
            signature: '67fc215cacaf98ae6a70f2ebf13526616c43c3a6',
            timestamp: '1614759498',
            nonce: '741654051',
            openid: 'oDvg-6T2rSr-IXuthO0ZdqZJzE-8'
          }

          <xml>
          <ToUserName><![CDATA[gh_4eac25fd046e]]></ToUserName>
          <FromUserName><![CDATA[oDvg-6T2rSr-IXuthO0ZdqZJzE-8]]></FromUserName>
          <CreateTime>1614765812</CreateTime>
          <MsgType><![CDATA[text]]></MsgType>
          <Content><![CDATA[1]]></Content>
          <MsgId>23117887978129505</MsgId>
          </xml>
       */

      // 接受请求体中的数据，流式数据
      const xmlData = await getUserDataAsync(req)
      console.log(xmlData)

      // 将xml数据解析为js对象
      const jsData = await parseXMLAsync(xmlData)
      console.log('jsData: ', jsData)

      // 格式化数据
      const message = formatMessage(jsData)
      console.log('message: ', message)

      let content = '您说什么，我听不懂'
      // 判断用户发送的消息是否是文本消息
      if (message.MsgType === 'text') {
        // 判断用户发送的消息内容是什么
        if (message.Content === '1') {
          content = '柯子衿520'
        } else if (message.Content === '3') {
          content = '蔡曼曼520'
        } else if (message.Content.match('爱')) {
          content = '想爱爱吗'
        }
      }

      // 最终回复用户的消息
      let replyMessage = `<xml>
        <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
        <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
        <CreateTime>${Date.now()}</CreateTime>
        <MsgType><![CDATA[text]]></MsgType>
        <Content><![CDATA[${content}]]></Content>
      </xml>`

      // 返回响应给微信服务器
      res.send(replyMessage)



      // 如果开发者服务器没有返回响应给微信服务器，微信服务器会发送三次请求过来

      // res.end('')

    } else {
      res.end('error');
    }
  }
}