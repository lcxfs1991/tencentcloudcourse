//获取应用实例
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 获取文章列表数据
   */
  getData() {
    // 补充获取列表数据的逻辑
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getData();
  },

  /**
   * 跳转至名片详情
   */
  getDetail(e) {
    let _id = e.currentTarget.dataset.namecardid;
    app.globalData.namecard.id = _id;

    wx.navigateTo({
      url: '../detail/index'
    });
  }
});
