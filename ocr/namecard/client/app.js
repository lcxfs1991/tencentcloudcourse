//app.js
App({
  onLaunch: function () {
    wx.cloud.init({
      env: '请填入云开发的环境ID',
      traceUser: true
    });
  },
  globalData: {
    namecard: {}
  }
});
