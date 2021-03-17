// const theatersCrawler = require('./crawler/theatersCrawler')
const db = require('../db');
const theatersCrawler = require('./crawler/theatersCrawler');
const saveTheaters = require('./save/saveTheaters');

// 这种只执行函数前面不带分号会出错的
(async () => {
  // 连接数据库
  await db;
  // 爬取数据
  const data = await theatersCrawler();
  //爬取的数据保存在数据库中
  await saveTheaters(data);
})()
