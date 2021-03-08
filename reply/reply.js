/*
  处理用户发送的消息类型和内容，决定返回不同的内容给用户
 */
//引入rp
module.exports = message => {
  let options = {
    toUserName: message.FromUserName,
    fromUserName: message.ToUserName,
    createTime: Date.now(),
    msgType: 'text'
  }

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
  } else if (message.MsgType === 'image') {
    // 用户发送图片消息
    options.msgType = 'image'
    options.mediaId = message.MediaId
    console.log('picurl: ', message.PicUrl)
  } else if (message.MsgType === 'voice') {
    // options.msgType = 'voice'
    // options.mediaId = message.MediaId
    content = message.Recognition
    console.log(message.Recognition)    
  } else if (message.MsgType === 'location') {
    content = `维度:${message.Location_X}-经度: ${message.Location_Y}-缩放大小: ${message.Scale}-位置信息: ${message.Label}`
  }  else if (message.MsgType === 'event') {
    if (message.Event === 'subscribe') {
      //用户订阅事件
      content = '欢迎您的订阅纪元链公众号~\n' + 
      '回复 首页 查看硅谷电影预告片 \n' +
      '回复 热门 查看最热门的电影 \n' +
      '回复 文本 搜索电影信息 \n' +
      '回复 语音 搜索电影信息 \n' +
      '也可以点击下面菜单按钮，来了解纪元链电影公众号';
      if (message.EventKey) {
        //扫描带参数的二维码的订阅事件
        content = '欢迎您扫二维码的关注';
      }
    } else if (message.Event === 'SCAN') {
      //已经关注了公众号，在扫描带参数二维码进入公众号
      content = '已经关注了公众号，在扫描带参数二维码进入公众号';
    } else if (message.Event === 'unsubscribe') {
      //用户取消关注
      console.log('无情取关~');
    } else if (message.Event === 'LOCATION') {
      //用户进行会话时，上报一次地理位置消息
      content = '纬度：' + message.Latitude + ' 经度：' + message.Longitude + ' 精度：' + message.Precision;
    } else if (message.Event === 'CLICK') {
      content = '您可以按照以下提示来进行操作~ \n' + 
      '回复 首页 查看硅谷电影预告片 \n' +
      '回复 热门 查看最热门的电影 \n' +
      '回复 文本 搜索电影信息 \n' +
      '回复 语音 搜索电影信息 \n' +
      '也可以点击下面菜单按钮，来了解纪元链电影公众号';
    } else if (message.Event === 'VIEW') {
      //用户点击菜单，跳转到其他链接
      console.log('用户点击菜单，跳转到其他链接');
    }
  }


  options.content = content
  console.log('options: ', options)

  return options
}