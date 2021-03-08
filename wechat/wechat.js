/**
 * 获取 access_token
 */
// 引入request-promise-native
const rp = require('request-promise-native')
const { writeFile, readFile } = require('fs')

// 引入config模块
const { appID, appsecret } = require('../config')
// console.log('kv')
//引入menu模块
const menu = require('./menu');
//引入api模块
const api = require('../utils/api');
//引入工具函数
const {writeFileAsync, readFileAsync} = require('../utils/tool');


// 定义类，获取access_token
class Wechat {
  constructor() { }
  /**
   * 用来获取access_token
   */
  getAccessToken() {
    // 定义请求的地址
    const url = `${api.accessToken}&appid=${appID}&secret=${appsecret}`;
    // 发送请求
    return new Promise((resolve, reject) => {
      rp({ method: 'GET', url, json: true })
        .then(res => {
          console.log('getAccessToken-res: ', res)
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
    return writeFileAsync(accessToken, 'access_token.txt')
  }



  /**
   * 用来读取access_token
   */
  readAccessToken() {
    return readFileAsync('access_token.txt');
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
  // fetchAccessToken() {
  //   // 优化
  //   if (this.access_token && this.expires_in && this.fetchAccessToken(this)) {
  //     // 说明之前保存过access_token, 并且它是有效的，直接使用
  //     return Promise.resolve({
  //       access_token: this.access_token,
  //       expires_in: this.expires_in
  //     })
  //   }
  //   // fetchAccessToken 的返回值
  //   return this.readAccessToken()
  //     .then(async res => {
  //       // 本地有文件
  //       // 判断它是否过期
  //       if (this.isValidAccessToken(res)) {
  //         return Promise.resolve(res)
  //       } else {
  //         // 过期了
  //         // 发送请求获取access_token(getAccessToken)
  //         const res = await this.getAccessToken()
  //         // 保存下来(本地)(saveAccessToken)
  //         await this.saveAccessToken(res)
  //         // 将请求回来的access_token返回出去
  //         return Promise.resolve(res)
  //       }
  //     })
  //     .catch(async err => {
  //       // 本地没有文件
  //       // 发送请求获取access_token(getAccessToken)
  //       const res = await this.getAccessToken()
  //       // 保存下来(本地)(saveAccessToken)
  //       await this.saveAccessToken(res)
  //       // 将请求回来的access_token返回出去
  //       resolve(res)
  //     })
  //     .then(res => {
  //       // 将access_token挂载到this上
  //       this.access_token = res.access_token
  //       this.expires_in = res.expires_in
  //       // 返回res包装了一层promise对象(此对象为成功的状态)
  //       return Promise.resolve(res)
  //     })
  // }

  /**
   * 用来获取没有过期的access_token
   * @return {Promise<any>} access_token
   */
  fetchAccessToken () {
    //优化
    if (this.access_token && this.expires_in && this.isValidAccessToken(this)) {
      //说明之前保存过access_token，并且它是有效的, 直接使用
      return Promise.resolve({
        access_token: this.access_token,
        expires_in: this.expires_in
      })
    }
    //是fetchAccessToken函数的返回值
    return this.readAccessToken()
      .then(async res => {
        //本地有文件
        //判断它是否过期
        if (this.isValidAccessToken(res)) {
          //有效的
          return Promise.resolve(res);
          // resolve(res);
        } else {
          //过期了
          //发送请求获取access_token(getAccessToken)，
          const res = await this.getAccessToken();
          //保存下来（本地文件）(saveAccessToken)
          await this.saveAccessToken(res);
          //将请求回来的access_token返回出去
          return Promise.resolve(res);
          // resolve(res);
        }
      })
      .catch(async err => {
        //本地没有文件
        //发送请求获取access_token(getAccessToken)，
        const res = await this.getAccessToken();
        //保存下来（本地文件）(saveAccessToken)
        await this.saveAccessToken(res);
        //将请求回来的access_token返回出去
        return Promise.resolve(res);
        // resolve(res);
      })
      .then(res => {
        //将access_token挂载到this上
        this.access_token = res.access_token;
        this.expires_in = res.expires_in;
        //返回res包装了一层promise对象（此对象为成功的状态）
        //是this.readAccessToken()最终的返回值
        return Promise.resolve(res);
      })
  }

  /**
   * 用来获取jsapi_ticket
   */
  getTicket() {
    // 发送请求
    return new Promise(async (resolve, reject) => {
      //获取access_token
      const data = await this.fetchAccessToken()
      // 定义请求的地址
      const url = `${api.ticket}&access_token=${data.access_token}`;
      rp({ method: 'GET', url, json: true })
        .then(res => {          
          //将promise对象状态改成成功的状态
          resolve({
            ticket: res.ticket,
            expires_in: Date.now() + (res.expires_in - 300) * 1000
          });
        })
        .catch(err => {
          reject('getTicket方法出了问题: ', err)
        })

    })
  }

  /**
   * 用来保存jsapi_ticket
   * @param {*} ticket 要保持的票据
   */
  saveTicket(ticket) {
    return writeFileAsync(ticket, 'ticket.txt')
  }

  /**
   * 用来读取ticket
   */
  readTicket() {
    return readFileAsync('ticket.txt');
  }

  /**用来检测ticket是否有效的... */
  isValidTicket(data) {
    if (!data && !data.ticket && !data.expires_in) {
      //代表ticket无效的
      return false;
    }
    return data.expires_in > Date.now();
  }

  /**
   * 用来获取没有过期的ticket
   * @return {Promise<any>} ticket
   */
  fetchTicket () {
    //优化
    if (this.ticket && this.ticket_expires_in && this.isValidTicket(this)) {
      //说明之前保存过ticket，并且它是有效的, 直接使用
      return Promise.resolve({
        ticket: this.ticket,
        expires_in: this.expires_in
      })
    }
    //是fetchTicket函数的返回值
    return this.readTicket()
      .then(async res => {
        //本地有文件
        //判断它是否过期
        if (this.isValidTicket(res)) {
          //有效的
          return Promise.resolve(res);
          // resolve(res);
        } else {
          //过期了
          //发送请求获取access_token(getTicket)，
          const res = await this.getTicket();
          //保存下来（本地文件）(saveTicket)
          await this.saveTicket(res);
          //将请求回来的access_token返回出去
          return Promise.resolve(res);
          // resolve(res);
        }
      })
      .catch(async err => {
        //本地没有文件
        //发送请求获取access_token(getTicket)，
        const res = await this.getTicket();
        //保存下来（本地文件）(saveTicket)
        await this.saveTicket(res);
        //将请求回来的access_token返回出去
        return Promise.resolve(res);
        // resolve(res);
      })
      .then(res => {
        //将ticket挂载到this上
        this.ticket = res.ticket;
        this.ticket_expires_in = res.expires_in;
        //返回res包装了一层promise对象（此对象为成功的状态）
        //是this.readTicket()最终的返回值
        return Promise.resolve(res);
      })
  }


  
  /**
   * 用来创建自定义菜单
   * @param menu 菜单配置对象
   * @return {Promise<any>}
   */
  async createMenu (menu) {
    
    return new Promise(async (resolve, reject) => {
      try {
        //获取access_token
        const data = await this.fetchAccessToken();
        //定义请求地址
        const url = `${api.menu.create}access_token=${data.access_token}`;
        //发送请求
        const result = await rp({method: 'POST', url, json: true, body: menu});
        resolve(result);
      } catch (e) {
        reject('createMenu方法出了问题：' + e);
      }
    })
  }
  
  /**
   * 用来删除自定义菜单的
   * @return {Promise<any>}
   */
  deleteMenu () {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await this.fetchAccessToken();
        //定义请求地址
        const url = `${api.menu.delete}access_token=${data.access_token}`;
        //发送请求
        const result = await rp({method: 'GET', url, json: true});
        resolve(result);
      } catch (e) {
        reject('deleteMenu方法出了问题：' + e);
      }
    })
  }




}


/*
(async () => {
  //模拟测试
  const w = new Wechat();
  // //删除之前定义的菜单
  // let result = await w.deleteMenu();
  // console.log(result);
  // //创建新的菜单
  // result = await w.createMenu(menu);
  // console.log(result);
  /*
  

 / *
  const data = await w.fetchTicket();
  console.log(data);
  // let data = await w.uploadTemporaryMaterial('image', '1.jpg');
  // console.log(data);
  // let data = await w.getTemporaryMaterial('image', 'JMXXcDqVgbI4UBdhEFi_qi_gM-g6Mo0Ib6hlIirP_79o86xjUlKFFmjCTzT5zoln', '2.jpg');
  
  // //上传图文素材中的图片
  // let picUrl = await w.uploadPermanentMaterial('pic', '1.jpg');
  // console.log(picUrl);
  // // { url: 'http://mmbiz.qpic.cn/mmbiz_jpg/l6hEPf9t1fHG4DnabkDbTePmDZUGJlrb7Ughow3DXO4ALpNy9C5AE4BPCvqbbHibgcicZLqko2l7ib2POqc8wpzaA/0' }
  // //上传图片获取mediaId
  // let image = await w.uploadPermanentMaterial('image', '1.jpg');
  // console.log(image);
  // /*
  // { media_id: '1_821D3VHxMTbMuZ5-DSoNzUaclsMflOOoDR-L0OHmA',
  // url: 'http://mmbiz.qpic.cn/mmbiz_jpg/l6hEPf9t1fHG4DnabkDbTePmDZUGJlrb7Ughow3DXO4ALpNy9C5AE4BPCvqbbHibgcicZLqko2l7ib2POqc8wpzaA/0?wx_fmt=jpeg' }
  //  */
  // //上传图文素材
  // const body = {
  //   "articles": [
  //     {
  //       "title": '微信公众号开发',
  //       "thumb_media_id": image.media_id,
  //       "author": '佚名',
  //       "digest": '这是微信公众号开发',
  //       "show_cover_pic": 0,
  //       "content": '<!DOCTYPE html>\n' +
  //       '<html lang="en">\n' +
  //       '<head>\n' +
  //       '  <meta charset="UTF-8">\n' +
  //       '  <meta name="viewport"\n' +
  //       '        content="width =device-width, initial-scale = 1.0, maximum-scale = 1.0, user-scalable = 0" />\n' +
  //       '  <title>猜电影</title>\n' +
  //       '</head>\n' +
  //       '<body>\n' +
  //       '  <div class="cover">\n' +
  //       '    <button id="btn">点击开始录音</button>\n' +
  //       '  </div>\n' +
  // '        <div class="cover">\n' +
  // '          <img src="' + picUrl.url + '" alt="肖申克的救赎" data-x="2000" data-y="2963" class="img-show" style="width: 100%;">\n' +
  // '        </div>\n' +
  //       '</body>\n' +
  //       '</html>',
  //       "content_source_url": 'http://www.atguigu.com'
  //     },
  //     {
  //       "title": 'nodejs开发',
  //       "thumb_media_id": image.media_id,
  //       "author": '佚名',
  //       "digest": '这是nodejs开发',
  //       "show_cover_pic": 1,
  //       "content": '<!DOCTYPE html>\n' +
  //       '<html lang="en">\n' +
  //       '<head>\n' +
  //       '  <meta charset="UTF-8">\n' +
  //       '  <meta name="viewport"\n' +
  //       '        content="width =device-width, initial-scale = 1.0, maximum-scale = 1.0, user-scalable = 0" />\n' +
  //       '  <title>猜电影</title>\n' +
  //       '</head>\n' +
  //       '<body>\n' +
  //       '  <div class="cover">\n' +
  //       '    <button id="btn">点击开始录音</button>\n' +
  //       '  </div>\n' +
  //       '        <div class="cover">\n' +
  //       '          <img src="' + picUrl.url + '" alt="肖申克的救赎" data-x="2000" data-y="2963" class="img-show" style="width: 100%;">\n' +
  //       '        </div>\n' +
  //       '</body>\n' +
  //       '</html>',
  //       "content_source_url": 'http://www.baidu.com'
  //     }
  //   ]
  // }
  // let data = await w.uploadPermanentMaterial('news', body);
  // console.log(data);
  /*
  { media_id: '1_821D3VHxMTbMuZ5-DSoOy10ltRpTmm-WQdidLbyGI' }
   */
  /*
})()
*/


module.exports = Wechat


