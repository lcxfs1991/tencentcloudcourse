//获取应用实例
const app = getApp();
const mapping = require('../common/mapping.js');

Page({
  data: {
    hasUserInfo: false,
    fileID: null,
    coverImage: '',
    formData: []
  },

  /**
   * 上传文件
   */
  uploadFile: function () {
    // 补充上传文件的逻辑
  },

  /**
   * 获取图片链接
   */
  getTempFileURL: function () {
    // 补充获取图片临时链接的逻辑
  },

  /**
   * 调用接口解析名片
   */
  parseNameCard() {
    // 补充调用接口解析名片的逻辑
  },

  transformMapping(data) {
    let record = {};
    let returnData = [];

    data = data.map((item) => {
      let name = null;
      if (mapping.hasOwnProperty(item.Name)) {
        name = mapping[item.Name];
        item.name = name;
      }

      return item;
    });

    data.forEach((item) => {
      if (!record.hasOwnProperty(item.Name)) {
        returnData.push(item);
        record[item.Name] = true;
      }
    });

    console.log(returnData);
    console.log(record);

    return returnData;
  },

  /**
   * 保存名片
   */
  addNameCard: function (e) {
    // 补充保存名片的逻辑
  }
})
