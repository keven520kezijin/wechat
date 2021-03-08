// 引入express模块
const express = require('express')

// 获取Router
const Router = express.Router

// 创建路由器对象
const router = new Router()

//引入sha1模块
const sha1 = require('sha1');
//创建reply模块
const reply = require('../reply');
// 引入wechat模块
const Wechat = require('../wechat/wechat');
// 引入config文件
const { url } = require('../config')

// 创建实例对象
const wechatApi = new Wechat()

// 页面路由
router.get('/search', async (req, res) => {
  /*
    生成js-sdk使用的签名：
      1. 组合参与签名的四个参数：jsapi_ticket（临时票据）、noncestr（随机字符串）、timestamp（时间戳）、url（当前服务器地址）
      2. 将其进行字典序排序，以'&'拼接在一起
      3. 进行sha1加密，最终生成signature
   */
  //获取随机字符串
  const noncestr = Math.random().toString().split('.')[1];
  //获取时间戳
  const timestamp = Date.now();
  //获取票据
  const {ticket} = await wechatApi.fetchTicket();
  
  // 1. 组合参与签名的四个参数：jsapi_ticket（临时票据）、noncestr（随机字符串）、timestamp（时间戳）、url（当前服务器地址）
  const arr = [
    `jsapi_ticket=${ticket}`,
    `noncestr=${noncestr}`,
    `timestamp=${timestamp}`,
    `url=${url}/search`
  ]
  
  // 2. 将其进行字典序排序，以'&'拼接在一起
  const str = arr.sort().join('&');
  console.log('str: ', str) //xxx=xxx&xxx=xxx&xxx=xxx
  
  // 3. 进行sha1加密，最终生成signature
  const signature = sha1(str);

  // 渲染页面，将渲染好的页面返回给用户
  res.render('search', {
    signature,
    noncestr,
    timestamp
  });
})

// 接收处理所有消息
router.use(reply())


// 暴露出去
module.exports = router