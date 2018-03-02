# NSwag
clients.ts是根据swagger生成的文档生成的客户端代理类。

## NSwag使用方法
* 下载[NSwagStudio](https://github.com/RSuter/NSwag/wiki/NSwagStudio)，安装。若浏览下载失败，使用迅雷下载。
* 打开本目录下的abp.nswag，确认swagger生成的API规范地址正确，并启动API主程序。

```js
{
    "swaggerGenerator": {
    "fromSwagger": {
      "url": "http://localhost:21021/swagger/v1/swagger.json", //
      "output": null
    }
  }
}
```
* 启动NSwagStudio，File->Open，打开本目录下的abp.nswag;
* 右侧Outputs中，点击【Generate Files】。

## 服务代理类使用方法

* 注册到DI：

```ts
import { AccountClient } from '@abp/services';

@NgModule({
    providers: [
        AccountClient
    ]
})
export class XXXModule {
  constructor() {
  }
}

```

* 使用时注入即可；
* 通用的服务可以注入到 /src/app/core/core.module.ts，否则仅需注入到需要的Module或者Component。