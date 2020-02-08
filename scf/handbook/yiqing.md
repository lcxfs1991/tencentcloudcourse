# 制作疫情地图

## 准备工作

1. 进入腾讯云控制台，在左上角云产品菜单里，选择【管理与审计】-> 【访问管理】，进入后在左边菜单栏中选择【访问密钥】->【API 密钥管理】，生成并获取一对 API 密钥。

![获取腾讯云API密钥](https://camo.githubusercontent.com/89a1dd621bc76992d556458a4556ae5ad2fdd5f2/68747470733a2f2f61736b2e71636c6f7564696d672e636f6d2f64726166742f313031313631382f676570653077626163332e706e67)

2. 在电脑安装 `Node.js` 语言运行环境，建议大于 8.0 版本。

3. 安装 `VS Code` + `Tencent Serverless Toolkit` 插件，或者安装命令行工具。

前者可参考文档：https://cloud.tencent.com/document/product/583/38106
后台可参考文档：https://cloud.tencent.com/document/product/583/33445

通过了解文档，或者本课程之前的章节，学习如何用`VS Code`插件或命令行工具创建和上传云函数。

学习完后，请创建一个名为 `yiqing` 的云函数。

4. 在[https://github.com/lcxfs1991/tencentcloudcourse](https://github.com/lcxfs1991/tencentcloudcourse)下载本课程的代码包，目录是 `scr/yiqing`，并将里面的代码覆盖刚才新创建的`yiqing`云函数中的文件。然后在该目录中命令行运行`npm i`，安装代码包的依赖。

## 效果预览

![疫情地图](https://user-images.githubusercontent.com/3348398/73936655-44c79b00-491e-11ea-8bb1-aada7aa08cfa.png)

## 知识点

1. 知道如何利用工具创建和上传云函数
2. 知道如何创建`API`网关触发器
3. 知道如何在云函数中部署能渲染`HTML`的服务
4. EChart.js 的使用

## 任务一 补充云函数逻辑

在云函数`yiqing`的`index.js`文件中，根据步骤提示，补充以下的逻辑。其中值得注意的是，该云函数除了承担渲染 html 的能力，还承担了输出数据的能力，这完全是通过链接中的`api`参数决定。通过这样的区别输出，就省了多制作一个云函数的麻烦，可谓是一举两得。

```js
// 1. 接受链接上的query参数api，用于判断是输出html，还是输出数数
let api = event.queryString.api || false;

// 2. 请求疫情数据
let result = await axios.get(
  `https://view.inews.qq.com/g2/getOnsInfo?name=disease_h5`
);

// 3. 中国地图数据
let china_map = JSON.stringify(require('./china.json'));

// 4. 解析并渲染 html 页面
let html = fs.readFileSync(path.resolve(__dirname, './index.html'), {
  encoding: 'utf-8'
});
html = render(html, { disease_data: result.data.data, china_map });
```

除此以外，由于后面创建网关的时候，要使用网关的集成响应，因此必须按照以下的格式对云函数进行输出，而不能直接返回一段数据。

```js
if (!api) {
  return {
    isBase64Encoded: false,
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: html
  };
}

// 5. 输出疫情数据
return {
  isBase64Encoded: false,
  statusCode: 200,
  headers: { 'Content-Type': 'application/json' },
  body: result.data.data
};
```

## 任务二 给模板补充逻辑

在云函数`yiqing`的`index.html`文件中，根据步骤提示，补充以下的逻辑。

```js
// 1. 填充地图模板变量
let china_map = ${china_map} || null;
```

```js
// 2. 填充确诊、疑似、治愈、死亡数据
let chinaTotal = disease_data.chinaTotal;
let chinaAdd = disease_data.chinaAdd;

$('.confirm .add span').html(`+${chinaAdd.confirm}`);
$('.suspect .add span').html(`+${chinaAdd.suspect}`);
$('.cure .add span').html(`+${chinaAdd.heal}`);
$('.dead .add span').html(`+${chinaAdd.dead}`);

$('.confirm .number').html(`${chinaTotal.confirm}`);
$('.suspect .number').html(`${chinaTotal.suspect}`);
$('.cure .number').html(`${chinaTotal.heal}`);
$('.dead .number').html(`${chinaTotal.dead}`);
```

```js
// 3. 处理疫情地图中的确诊数据格式
/**
 * 需要 {name: 'xxx', value: 'xxx'} 这样的格式
 */
let province = disease_data.areaTree[0].children;
let confirmData = province.map(function(item) {
  return {
    name: item.name,
    value: item.total.confirm
  };
});
```

```js
// 4. 给疫情地图添加标题
title: {
    text: '疫情地图',
    subtext: `${disease_data.lastUpdateTime} 更新`,
    left: 'right'
},
```

```js
// 5. 添加数据分段
pieces: [
    { min: 10000, label: '10000人及以上' },
    { min: 1000, max: 9999, label: '1000-9999人' },
    { min: 500, max: 999, label: '500-999人' },
    { min: 100, max: 499, label: '100-499人' },
    { min: 10, max: 99, label: '10-99人' },
    { min: 1, max: 9, label: '1-9人' }
],
```

```js
// 6. 填写疫情地图的数据及悬浮框的展示信息
series: [
  {
    name: '确诊病例',
    type: 'map',
    roam: true,
    map: 'china',
    label: {
      show: true
    },
    emphasis: {
      label: {
        show: true
      }
    },
    data: confirmData
  }
];
```

```js
// 7. 定时拉取
setInterval(function() {
  updateMap();
}, 60000);
```

需要简单说明的是，该模板是使用了`EChart`的模板进行改造，模板地址如下：[https://www.echartsjs.com/examples/zh/editor.html?c=map-usa](https://www.echartsjs.com/examples/zh/editor.html?c=map-usa)，下图是模板的效果。你也可以点击该模板右下角的`Download`按钮将模板的`html`文件下载下来，然后按自己的喜欢进行编辑改造。

![疫情地图的模板](https://user-images.githubusercontent.com/3348398/73943593-fae5b180-492b-11ea-859e-bdb0f49e3cde.png)

完成模板的改造后，请用插件或者命令行工具，上传云函数。下图是通过`VS Code`插件上传云函数的示例：

![通过`VS Code`插件上传云函数](https://user-images.githubusercontent.com/3348398/73943865-819a8e80-492c-11ea-9bb1-969220c13b3b.png)

## 任务三 创建 API 网关触发器

进入控制台，找到云函数的控制台，并选择云函数所在的地区以及命名空间，然后进入云函数的编辑界面，选择触发方式菜单，然后点击“添加触发方式”，按以下的内容添加一个 API 网关触发器。注意，请务必勾选“启用集成响应”，这样网关才能正确渲染`HTML`的内容。

![添加API网关触发器](https://user-images.githubusercontent.com/3348398/73863542-37a5a000-487b-11ea-9961-ecd34f709f6b.png)

创建完毕后，可以 API 网关触发器中，拿到访问路径路径，在浏览器中进行访问。如果验证过没问题后，建议将云函数，通过`VS Code`插件同步下来，将旧的`template.yaml`文件替换掉，这样避免下次上传云函数的时候，生成重复的 API 网关触发器。只有像下面的`Events`触发事件那样，将系统生成的网关贴上去，才不会重复生成新的网关，造成资源浪费。

````yaml
Events:
  service-8lqamcni:
    Type: APIGW
    Properties:
      Enable: true
      StageName: release
      ServiceId:
      HttpMethod: GET
      IntegratedResponse: true
        ```
````

体验地址：[疫情地图体验](https://service-lltf3zya-1253970226.gz.apigw.tencentcs.com/release/demo_yiqing)

## 任务四 添加自定义域名

如果觉得网关提供的域名过长，又或者担心这种域名由于安全问题会被微信等大平台封禁，可以自己自行配置自定义域名。首先，在云函数`yiqing`的控制台面板里，找到【触发方式】，然后点击任务三中添加过的触发器里的【API 服务名】，进入更详细的网关配置控制台。

![进入网关配置控制台](https://user-images.githubusercontent.com/3348398/74046219-1e325e80-4a09-11ea-9473-397b02e27821.png)

进入【自定义域名】菜单，新建自定义域名，如果想配置 HTTPS 协议，则需要去申请 HTTPS 证书（腾讯云有免费的可以申请，可以跟着提示跳转到证书配置菜单）。

![自定义域名菜单](https://user-images.githubusercontent.com/3348398/74046446-8c772100-4a09-11ea-92db-8e597dcf05b4.png)

可以按照下图的示例进行配置。要注意的是，如果想访问的路径更扁平化一点，请选择“自定义路径映射”，路径填入`/`，环境选择发布。如果不这样配置，如果原本网关的域名是[https://service-lltf3zya-1253970226.gz.apigw.tencentcs.com/release/demo_yiqing](https://service-lltf3zya-1253970226.gz.apigw.tencentcs.com/release/demo_yiqing)，那么配置好之后，访问的路径就是[https://yiqing.docschina.org/release/demo_yiqing]。但如果配置了`/`，那么后面的路径就只剩下`demo_yiqing`了。

![新建自定义域名](https://user-images.githubusercontent.com/3348398/74046578-c21c0a00-4a09-11ea-846b-e1393e3f8106.png)

在保存配置信息之前，请首先在域名解析服务商，根据弹窗的提示，先把域名的 CNAME 配置好。比如这里使用的是[https://yiqing.docschina.org](https://yiqing.docschina.org)，域名，提示要 CNAME 到`service-lltf3zya-1253970226.gz.apigw.tencentcs.com.`。做完 CNAME 后，就可以保存自定义域名的添加配置。稍等片刻，就可以访问了。

![配置域名解析](https://user-images.githubusercontent.com/3348398/74046843-3b1b6180-4a0a-11ea-9a3c-daef71f701f1.png)

如果看到配置列表上显示“解析成功”，那表明一切的陪着已经妥当，请尝试访问：[https://yiqing.docschina.org/demo_yiqing](https://yiqing.docschina.org/demo_yiqing)进行体验吧！
