# API 客户端代理服务类
clients.ts是根据swagger生成的文档生成的客户端代理类。

## 生成方法
见 YkAbp 解决方案中的YkAbp.AngularClientGenerator项目。

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