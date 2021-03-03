/**
 * 获取 access_token
 */
// 引入request-promise-native
const rp = require('request-promise-native')
const { writeFile, readFile } = require('fs')

// 引入config模块
const { appID, appsecret } = require('../config')
// console.log('kv')


// 定义类，获取access_token
class Wechat {
  constructor() { }
  /**
   * 用来获取access_token
   */
  getAccessToken() {
    // 定义请求的地址
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`
    // 发送请求
    return new Promise((resolve, reject) => {
      rp({ method: 'GET', url, json: true })
        .then(res => {
          console.log(res)
          // 设置access_token的过期时间
          res.expires_in = Date.now() + (res.expires_in - 300) * 1000
          resolve(res)
        })
        .catch(err => {
          reject('getAccessToken方法出了问题: ', err)
        })

    })
  }

  /**
   * 用来保存access_token
   * @param {*} accessToken 
   */
  saveAccessToken(accessToken) {
    accessToken = JSON.stringify(accessToken)
    return new Promise((res, rej) => {
      writeFile('./accessToken.txt', accessToken, err => {
        if (!err) {
          res()
        } else {
          rej('saveAccessToken方法出了问题：' + err)
        }
      })
    })
  }



  /**
   * 用来读取access_token
   */
  readAccessToken() {
    return new Promise((res, rej) => {
      readFile('./accessToken.txt', (err, data) => {
        if (!err) {
          data = JSON.parse(data)
          res(data)
        } else {
          rej('saveAccessToken方法出了问题：' + err)
        }
      })
    })
  }

  isValidAccessToken(data) {
    if (!data && !data.access_token && !data.expires_in) {
      //代表access_token无效的
      return false;
    }

    //检测access_token是否在有效期内
    /*if (data.expires_in < Date.now()) {
      //过期了
      return false;
    } else {
      //没有过期
      return true;
    }*/

    return data.expires_in > Date.now();
  }




}

const w = new Wechat()

new Promise((resolve, reject) => {
  w.readAccessToken()
    .then(res => {
      // 本地有文件
      if (w.isValidAccessToken(res)) {
        resolve(res)
      } else {
        w.getAccessToken()
          .then(res => {
            w.saveAccessToken(res)
              .then(() => {
                resolve(res)
              })
          })
      }
    })
    .catch(err => {
      w.getAccessToken()
        .then(res => {
          w.saveAccessToken(res)
            .then(() => {
              resolve(res)
            })
        })
    })
}).then(res => {
  console.log('res:', res)
})
