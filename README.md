# 当前版本为beta版本，请联系开放平台获取正式版
# EZUIKit-JavaScript-HD
基于插件的浏览器播放插件。基于插件的性能优越性，解决了浏览器解码播放视频内存限制，适用于播放高清视频，多窗口视频等。

支持高清视频播放（2K）
支持多窗口播放
支持倍速回放
支持语音对讲
# 快速上手
## DEMO使用步骤
### 1. 双击“启动localhost服务.exe”启动本地localhost服务器
### 2. 访问http://localhost/index.html 可访问demo页面
### 3. 点击插件初始化，初始化插件
### 4. 点击播放预览，即可开始播放视频。

[在线demo](https://jianboyu.top/ezuikitHd/index.html)

# 在我的项目中使用

### 1. 下载插件

### 1. 引入ezuikit-hd.js文件
```
  <script src="./ezuikit-hd.js"></script>
```
### 2. 创建视频实例
```
    var EZUIKitHd = new EZUIKitHd({
      id: 'playWnd',
      layout: 2,
    })
```
| 参数       | 是否必填  |  类型  |  说明  |
| --------   | -----:  | -----:  | :----:  |
| id         | 是  | string  |视频容器唯一ID     |
| layout     |   否   |int|   视频布局   |
| offsetLeft |    否   |int |  视频窗口左偏移量（像素）  |
| offsetLeft |    否    |int|  视频窗口上偏移量（像素）  |
### 3. 初始化插件
```
    EZUIKitHd.init({
        accessToken: 'xxx',
        layout: 1,
        videoType: 0,
    });

```
### 4. 播放视频
#### 方式1
```
    EZUIKitHd.play("ezopen://open.ys7.com/C78957921/1.live");
``` 
#### 方式2-支持播放不同token权限下的设备
```
    EZUIKitHd.play({
      url:"ezopen://open.ys7.com/xxxx/1.live",
      accessToken: "xxxx"
    });
``` 
### 3. 销毁插件
```
    EZUIKitHd.destroy();
```

### 4. 设置窗口偏移
可以在创建时设置窗口偏移值(参考2.创建视频实例)，后续仍可以通过函数修改偏移量
```
     EZUIKitHd.setDocOffset(offsetLeft,offsetTop)
```

