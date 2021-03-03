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

  /**用来检测access_token是否有效的... */
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

  /**
   * 获取没有过期的access_token
   * @return {Promise<any>}
   */
  fetchAccessToken() {
    // 优化
    if (this.access_token && this.expires_in && this.fetchAccessToken(this)) {
      // 说明之前保存过access_token, 并且它是有效的，直接使用
      return Promise.resolve({
        access_token: this.access_token,
        expires_in: this.expires_in
      })
    }
    // fetchAccessToken 的返回值
    return this.readAccessToken()
      .then(async res => {
        // 本地有文件
        // 判断它是否过期
        if (this.isValidAccessToken(res)) {
          return Promise.resolve(res)
        } else {
          // 过期了
          // 发送请求获取access_token(getAccessToken)
          const res = await this.getAccessToken()
          // 保存下来(本地)(saveAccessToken)
          await this.saveAccessToken(res)
          // 将请求回来的access_token返回出去
          return Promise.resolve(res)
        }
      })
      .catch(async err => {
        // 本地没有文件
        // 发送请求获取access_token(getAccessToken)
        const res = await this.getAccessToken()
        // 保存下来(本地)(saveAccessToken)
        await this.saveAccessToken(res)
        // 将请求回来的access_token返回出去
        resolve(res)
      })
      .then(res => {
        // 将access_token挂载到this上
        this.access_token = res.access_token
        this.expires_in = res.expires_in
        // 返回res包装了一层promise对象(此对象为成功的状态)
        return Promise.resolve(res)
      })
  }




}

const w = new Wechat()


