// 引入mongoose
const mongoose = require('mongoose')

// 获取Schama
const Schama = mongoose.Schema

// 创建约束对象
const theatersSchema = new Schama({
  title: String,
  rating: Number,
  runtime: String,
  directors: String,
  casts: String,
  image: String,
  doubanId: {
    type: Number,
    unique: true
  },
  genre: [ String ],
  summary: String,
  releaseDate: String,
  posterKey: String,  // 图片上传到七牛中，返回的key值
  createTime: {
    type: Date,
    default: Date.now()
  }
})

// 创建模型对象
module.exports = mongoose.model('Theaters', theatersSchema)