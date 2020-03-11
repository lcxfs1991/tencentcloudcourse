# 实现出租车发票报销 Web 应用

## 准备工作

1. 进入腾讯云控制台，在左上角云产品菜单里，选择【文字识别】-> 【票据单据识别】，进入后在左边菜单栏中选择【出租车发票识别】控制面板，进入后开通服务。

![出租车发票识别](https://user-images.githubusercontent.com/3348398/71316904-59a5b780-24b3-11ea-9ef1-d036ec769b2c.png)

2. 在左上角云产品菜单里，选择【管理与审计】-> 【访问管理】，进入后在左边菜单栏中选择【访问密钥】->【API 密钥管理】，生成并获取一对 API 密钥。

![获取腾讯云API密钥](https://camo.githubusercontent.com/89a1dd621bc76992d556458a4556ae5ad2fdd5f2/68747470733a2f2f61736b2e71636c6f7564696d672e636f6d2f64726166742f313031313631382f676570653077626163332e706e67)

3. 在电脑安装 `Node.js` 语言运行环境。

4. 在[https://github.com/lcxfs1991/tencentcloudcourse](https://github.com/lcxfs1991/tencentcloudcourse)下载本课程的代码包，目录是 `ocr/invoice`。

5. 在目录中运行命令 `npm install` 安装项目依赖。

## 效果预览

![识别出租车发票识别](https://user-images.githubusercontent.com/3348398/71316929-05e79e00-24b4-11ea-95bd-ffd8720e029c.png)

## 知识点

1. 能够根据场景选择合适的文字识别能力及接口
2. 能够正确地使用腾讯云提供的 SDK 进行服务调用
3. JavaScript 上传文件及 Node.js 处理文件上传的知识

### 任务一：根据场景选择合适的文字识别能力

由于需要识别的是员工报销的出租车发票，因此选择票据单据识别里的出租车发票识别是最合适的。

### 任务二：在 API Explorer 上调试接口

这次，我们尝试使用图片的 `base64` 编码进行识别。首先人们可以上网找在线工具，将图片上传后，转成 `base64`。比如可以使用站长工具的这个在线工具：https://tool.chinaz.com/tools/imgtobase。

然后进入 API Explorer 的名片识别的调试面板，输入腾讯云 API 密钥，以及需要识别的图片的 `base64` 编码，然后进行调试。调试成功后，将生成的`Node.js`代码记录下来，为后续任务四做准备。

![API Explorer调试](https://user-images.githubusercontent.com/3348398/71316943-670f7180-24b4-11ea-9043-1d058598c701.png)

### 任务三：Web 页面上传图片

在项目目录中的`/view/index.html`给`submitButton`绑定的`click`事件中，补齐以下逻辑，用于解析文件内容并上传给服务器。

```js
let req = new XMLHttpRequest();
let invoice = document.forms['form']['file'].files[0];
let formData = new FormData();
formData.append('invoice', invoice);
req.open('POST', '/');
req.send(formData);
```

### 任务四：识别出租车发票服务端逻辑

将在任务二中记录下来的调试好的代码取出来，改造成如下的`TaxiInvoiceOCRPromise`方法，用于识别出租车发票，并放到项目目录中的`TaxiInvoiceOCR.js`文件中。

```js
const tencentcloud = require('tencentcloud-sdk-nodejs');

exports.TaxiInvoiceOCRPromise = async content => {
  const OcrClient = tencentcloud.ocr.v20181119.Client;
  const models = tencentcloud.ocr.v20181119.Models;

  const Credential = tencentcloud.common.Credential;
  const ClientProfile = tencentcloud.common.ClientProfile;
  const HttpProfile = tencentcloud.common.HttpProfile;
  let cred = new Credential('填写腾讯云SecretID', '填写腾讯云SecretKey');
  let httpProfile = new HttpProfile();
  httpProfile.endpoint = 'ocr.tencentcloudapi.com';
  let clientProfile = new ClientProfile();
  clientProfile.httpProfile = httpProfile;
  let client = new OcrClient(cred, 'ap-guangzhou', clientProfile);

  let req = new models.TaxiInvoiceOCRRequest();
  let params = `{"ImageBase64":"${content}"}`;
  req.from_json_string(params);
  return new Promise((resolve, reject) => {
    client.TaxiInvoiceOCR(req, function(errMsg, response) {
      if (errMsg) {
        reject(errMsg);
        return;
      }

      resolve(response.to_json_string());
    });
  });
};
```

最后，在项目目录中运行`npm start`，访问`127.0.0.1:3000`，即可进行体验。
