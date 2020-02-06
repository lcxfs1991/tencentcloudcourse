'use strict';
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const render = require('./render');

exports.main_handler = async (event, context, callback) => {
  // 1. 接受链接上的query参数api，用于判断是输出html，还是输出数数
  // 2. 请求疫情数据
  // 3. 中国地图数据
  // 4. 解析并渲染 html 页面
  // 5. 输出疫情数据
};
