/*
  自定义菜单
 */
const {url} = require('../config');

module.exports = {
  "button":[
    {
      "type": "click",
      "name": "kv万岁🙏",
      "key": "help4"
    },
    {
      "type": "click",
      "name": "帮助3🙏",
      "key": "help3"
    },
    {
      "name": "戳我💋",
      "sub_button": [
        {
          "type": "click",
          "name": "帮助1🙏",
          "key": "help1"
        },
        {
          "type": "click",
          "name": "帮助🙏",
          "key": "help"
        }
      ]
    }
  ]
}