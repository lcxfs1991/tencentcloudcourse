# 制作唐诗识别脚本工具

## 准备工作

1. 进入腾讯云控制台，在左上角云产品菜单里，选择【文字识别】-> 【通用文字识别】，进入后在左边菜单栏中选择【通用印刷体识别（高精度版）】控制面板，进入后开通服务。

![开通通用印刷体识别（高精度版）服务](https://user-images.githubusercontent.com/3348398/69009602-c77d3180-0991-11ea-80e3-8eb067623db2.png)

2. 在左上角云产品菜单里，选择【管理与审计】-> 【访问管理】，进入后在左边菜单栏中选择【访问密钥】->【API 密钥管理】，生成并获取一对 API 密钥。

![获取腾讯云API密钥](https://camo.githubusercontent.com/89a1dd621bc76992d556458a4556ae5ad2fdd5f2/68747470733a2f2f61736b2e71636c6f7564696d672e636f6d2f64726166742f313031313631382f676570653077626163332e706e67)

3. 在电脑安装 `Python 3` 语言运行环境。

4. 在[https://github.com/lcxfs1991/tencentcloudcourse](https://github.com/lcxfs1991/tencentcloudcourse)下载本课程的代码包，目录是 `ocr/peom`。

5. 在命令行中运行 `pip install tencentcloud-sdk-python` 安装腾讯云 SDK。

## 效果预览

![识别唐诗](https://user-images.githubusercontent.com/3348398/71306147-df742500-2417-11ea-902f-370d55151c50.png)

## 知识点

1. 能够根据场景选择合适的文字识别能力及接口
2. 能够正确地使用腾讯云提供的 SDK 进行服务调用

### 任务一：根据场景选择合适的文字识别能力

由于需要识别的是在图片的唐诗文字，并且不是手写，而是印刷体文字，因此可以选用通用印刷体识别（高精度版）服务。另外要注意的是，如果图片的颜色比较丰富，或者比较复杂，可能会影响文字识别的准确性，因此要提高精度，图片最好比较单纯，比方说背景是纯色的。

### 任务二：在 API Explorer 上调试接口

进入 API Explorer 的通用印刷体识别（高精度版）的调试面板，输入腾讯云 API 密钥，以及需要识别的图片链接，然后进行调试。

![API Explorer调试](https://user-images.githubusercontent.com/3348398/69010829-8b9c9900-099e-11ea-8984-4be15e3ef288.png)

### 任务三：将代码拷贝到项目中并做修改优化

调试成功后，将 API Explorer 生成的 Python 代码，复制到复制到项目中的`peom/index.py`文件中，并进行输出的优化。

```python
from tencentcloud.common import credential
from tencentcloud.common.profile.client_profile import ClientProfile
from tencentcloud.common.profile.http_profile import HttpProfile
from tencentcloud.common.exception.tencent_cloud_sdk_exception import TencentCloudSDKException
from tencentcloud.ocr.v20181119 import ocr_client, models
import json

try:
    # 填入腾讯云SecretID和SecretKey
    cred = credential.Credential(
        "腾讯云SecretID", "腾讯云SecretKey")
    httpProfile = HttpProfile()
    httpProfile.endpoint = "ocr.tencentcloudapi.com"

    clientProfile = ClientProfile()
    clientProfile.httpProfile = httpProfile
    client = ocr_client.OcrClient(cred, "ap-guangzhou", clientProfile)

    req = models.GeneralBasicOCRRequest()
    # 填入图片外链
    params = '{"ImageUrl":"https://wx2.sinaimg.cn/mw690/618b9db7ly1g2xrcarzhdj20dw0afwf6.jpg"}'
    req.from_json_string(params)

    resp = client.GeneralBasicOCR(req)

    # 格式化输出
    peomObj = json.loads(resp.to_json_string())
    for peomLine in peomObj['TextDetections']:
        print(peomLine['DetectedText'])

except TencentCloudSDKException as err:
    print(err)
```

最后，在项目中运行 `python index.py` 即可获得如效果预览一样的结果。
