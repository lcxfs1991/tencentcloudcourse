# 制作名片识别小程序

## 准备工作

1. 进入腾讯云控制台，在左上角云产品菜单里，选择【文字识别】-> 【卡证文字识别】，进入后在左边菜单栏中选择【名片识别】控制面板，进入后开通服务。

![名片识别](https://user-images.githubusercontent.com/3348398/69010980-732d7e00-09a0-11ea-9a89-23fb90dbda6a.png)

2. 在左上角云产品菜单里，选择【管理与审计】-> 【访问管理】，进入后在左边菜单栏中选择【访问密钥】->【API 密钥管理】，生成并获取一对 API 密钥。

![获取腾讯云API密钥](https://camo.githubusercontent.com/89a1dd621bc76992d556458a4556ae5ad2fdd5f2/68747470733a2f2f61736b2e71636c6f7564696d672e636f6d2f64726166742f313031313631382f676570653077626163332e706e67)

3. 申请一个微信小程序，然后获取小程序的 `AppID`。

![获取小程序 AppID](https://user-images.githubusercontent.com/3348398/71306404-9d98ae00-241a-11ea-99f6-b67d8521cc81.png)

4. 在[https://github.com/lcxfs1991/tencentcloudcourse](https://github.com/lcxfs1991/tencentcloudcourse)下载本课程的代码包，目录是 `ocr/namecard`。

5. 用微信开发者工具导入该项目，并在 `project.config.json` 中填入你自己的 `AppID`。成功导入后，请点击菜单左上角的“云开发”按钮进入云开发面板，开通云开发服务。

![进入云开发](https://user-images.githubusercontent.com/3348398/71306436-5c54ce00-241b-11ea-8cdd-253ee9f4f022.png)

## 效果预览

![识别名片](https://user-images.githubusercontent.com/3348398/71306461-9625d480-241b-11ea-9b32-844e612c5db4.png)

## 知识点

1. 能够根据场景选择合适的文字识别能力及接口
2. 能够正确地使用腾讯云提供的 SDK 进行服务调用
3. 能够使用云开发调用腾讯云服务

### 任务一：根据场景选择合适的文字识别能力

由于需要识别的是在图片的名片，因此最合适的便是卡证识别里的名片识别服务。

### 任务二：在 API Explorer 上调试接口

进入 API Explorer 的名片识别的调试面板，输入腾讯云 API 密钥，以及需要识别的图片链接，然后进行调试。调试成功后，将生成的`Node.js`代码记录下来，为后续任务四做准备。

![API Explorer调试](https://user-images.githubusercontent.com/3348398/69011024-f64ed400-09a0-11ea-83be-19bfac7c1eec.png)

### 任务三：上传图片

首先，在`app.js`中的初始化方法`wx.cloud.init`中，填入你所使用的云开发环境的环境 ID。该环境 ID，请在云开发控制台的【设置】-> 【环境设置】中获取。

在分析名片前，首先需要将名片上传到云开发的存储服务中。可以将以下代码补充到`client/index/index.js`文件中的`uploadFile`方法里：

```js
wx.chooseImage({
  success: dRes => {
    wx.showLoading({
      title: '上传文件'
    });

    let cloudPath = `${Date.now()}-${Math.floor(Math.random(0, 1) * 1000)}.png`;
    const uploadTask = wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: dRes.tempFilePaths[0],
      success: res => {
        if (res.statusCode < 300) {
          this.setData(
            {
              fileID: res.fileID
            },
            () => {
              this.getTempFileURL();
            }
          );
        }
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        });
      }
    });
  },
  fail: console.error
});
```

上传完后，我们需要获取图片的临时链接，则需要在相同文件中的`getTempFileURL`方法中，补全以下逻辑：

```js
wx.cloud
  .getTempFileURL({
    fileList: [
      {
        fileID: this.data.fileID
      }
    ]
  })
  .then(res => {
    console.log('获取成功', res);
    let files = res.fileList;

    if (files.length) {
      this.setData(
        {
          coverImage: files[0].tempFileURL
        },
        () => {
          this.parseNameCard();
        }
      );
    } else {
      wx.showToast({
        title: '获取图片链接失败',
        icon: 'none'
      });
    }
  })
  .catch(err => {
    console.error('获取失败', err);
    wx.showToast({
      title: '获取图片链接失败',
      icon: 'none'
    });
    wx.hideLoading();
  });
```

获取链接后，才进入到下一个环节——调用云函数，解析该名片图片的文字内容，需要补齐`parseNameCard` 方法的逻辑：

```js
wx.showLoading({
  title: '解析名片'
});
wx.cloud
  .callFunction({
    name: 'parseNameCard',
    data: {
      url: this.data.coverImage
    }
  })
  .then(res => {
    // console.log(res);
    if (res.code || !res.result || !res.result.data) {
      wx.showToast({
        title: '解析失败，请重试',
        icon: 'none'
      });
      wx.hideLoading();
      return;
    }

    console.log(res.result.data);
    let data = this.transformMapping(res.result.data);
    console.log(data);

    this.setData({
      formData: data
    });

    wx.hideLoading();
  })
  .catch(err => {
    console.error('解析失败，请重试。', err);
    wx.showToast({
      title: '解析失败，请重试',
      icon: 'none'
    });
    wx.hideLoading();
  });
```

### 任务四：完成解析名片的云函数逻辑：

在`cloud/functions/parseNameCard/config/index.js`中，填入在准备工作做获取的腾讯云`SecretID`和`SecretKey`。

然后将任务二中调试好后成生的`Node.js`代码，改造成以下的`BusinessCardOCR`方法，放到云函数`cloud/parseNameCard/functions/index.js`文件顶部：

```js
const tencentcloud = require('tencentcloud-sdk-nodejs');
const { SecretId, SecretKey } = require('./config/index.js');

const OcrClient = tencentcloud.ocr.v20181119.Client;
const models = tencentcloud.ocr.v20181119.Models;

const Credential = tencentcloud.common.Credential;
const ClientProfile = tencentcloud.common.ClientProfile;
const HttpProfile = tencentcloud.common.HttpProfile;

let cred = new Credential(SecretId, SecretKey);
let httpProfile = new HttpProfile();
httpProfile.endpoint = 'ocr.tencentcloudapi.com';
let clientProfile = new ClientProfile();
clientProfile.httpProfile = httpProfile;
let client = new OcrClient(cred, 'ap-guangzhou', clientProfile);

let req = new models.BusinessCardOCRRequest();

const BusinessCardOCR = async url => {
  let params = `{"ImageUrl":"${url}"}`;
  req.from_json_string(params);
  return new Promise((resolve, reject) => {
    client.BusinessCardOCR(req, function(errMsg, response) {
      if (errMsg) {
        reject(errMsg);
        return;
      }

      resolve(response.to_json_string());
    });
  });
};
```

补充完毕后，先右键点击`cloud/functions`选择好要上传的云开发环境，然后再右键点击`cloud/functions/parseNameCard`目录，选择“上传并部署：云端安装依赖（不上传 node_modules）”，就这样，云函数就能上传成功并支持后续的名片解析。

![上传云函数](https://user-images.githubusercontent.com/3348398/71309698-05b0b980-2446-11ea-8375-373cc623ce62.png)。

### 任务五：保存名片信息以及获取

名片解析完毕获取数据后，如果想存下来，怎么办呢？首先，我们可以在云开发中的数据库里创建一个集合，名为`namecard`。

![创建namecard集合](https://user-images.githubusercontent.com/3348398/71309745-9b4c4900-2446-11ea-8ba9-a2ced585d5a5.png)

然后将以下代码，补充到`client/pages/index/index.js`文件中的`addNameCard`方法：

```js
const data = this.data;
const formData = e.detail.value;
console.log(formData);

wx.showLoading({
  title: '添加中'
});

formData.cover = this.data.fileID;

const db = wx.cloud.database();
db.collection('namecard')
  .add({
    data: formData
  })
  .then(res => {
    console.log(res);
    wx.hideLoading();

    app.globalData.namecard.id = res._id;

    wx.navigateTo({
      url: '../detail/index'
    });

    // 重置数据
    this.setData({
      coverImage: null,
      fileID: null,
      formData: []
    });
  })
  .catch(e => {
    wx.hideLoading();
    wx.showToast({
      title: '添加失败，请重试',
      icon: 'none'
    });
  });
```

于是，每当解析完毕后想要提交数据的时候，就会调用该方法对数据进行保存。

我们的名片小程序还设计了列表页和详情页，那如果需要获取列表数据和详情数据怎么办呢？

对于列表数据，我们可以将下面逻辑补充到`client/pages/list/index.js`中的`getData`方法中：

```js
const db = wx.cloud.database({});
db.collection('namecard')
  .get()
  .then(res => {
    console.log(res);
    let data = res.data;
    this.setData({
      list: data
    });
  })
  .catch(e => {
    wx.showToast({
      title: 'db读取失败',
      icon: 'none'
    });
  });
```

而详情数据，可以将下面逻辑补充到`client/pages/detail/index.js`中的`getNameCardDetail`方法中：

```js
// 初始化db
const db = wx.cloud.database({});
let ncId = app.globalData.namecard.id;
db.collection('namecard')
  .doc(ncId)
  .get()
  .then(res => {
    console.log('db读取成功', res.data);
    let data = res.data;

    let namecard = [];
    Object.keys(data).forEach(item => {
      if (item === 'cover' || item === '_id' || item === '_openid') {
        return;
      }
      namecard.push({
        name: mapping[item],
        value: data[item]
      });
    });

    this.setData({
      cover: data.cover,
      namecard: namecard
    });
  })
  .catch(e => {
    wx.showToast({
      title: 'db读取失败',
      icon: 'none'
    });
  });
```

最后，重新编译一下小程序，就可以体验整个名片识别的流程了。
