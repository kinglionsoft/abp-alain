# API 客户端代理服务类
本目录下的ts文件是根据swagger生成的文档生成的客户端代理类，请不要手动修改。

## 生成方法
见 YkAbp 解决方案中的YkAbp.AngularClientGenerator项目。

## 服务代理类使用方法

### 方式一：按需注册 【建议】
* 通用的服务可以注入到 /src/app/core/core.module.ts，否则仅需注入到需要的Module或者Component。

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

#### 方式二：全量注册
* 将AbpServiceModule导入到AppModule中：
```ts
import { AbpServiceModule } from '@abp/services';

@NgModule({
    imports: [
        AbpServiceModule
    ]
})
export class AppModule { }
```


