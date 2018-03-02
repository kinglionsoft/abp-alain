import { Observable } from 'rxjs/Observable';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { zip } from 'rxjs/observable/zip';
import { catchError, map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { MenuService, SettingsService, TitleService } from '@delon/theme';
import { ACLService } from '@delon/acl';
import { I18NService } from '../i18n/i18n.service';
import { environment } from '@env/environment';

import { AppConsts } from '@abp/shared';
import * as moment from 'moment';

/**
 * 用于应用启动时
 * 一般用来获取应用所需要的基础数据等
 */
@Injectable()
export class StartupService {
    constructor(
        private menuService: MenuService,
        private translate: TranslateService,
        private i18n: I18NService,
        private settingService: SettingsService,
        private aclService: ACLService,
        private titleService: TitleService,
        private httpClient: HttpClient,
        private injector: Injector) { 
            AppConsts.remoteServiceBaseUrl = environment.SERVER_URL;
        }

    load(): Promise<any> {
        // only works with promises
        // https://github.com/angular/angular/issues/15088

        return new Promise((resolve, reject) => {
            zip(
                this.httpClient.get(`/i18n/${this.i18n.defaultLang}.json`),
                this.httpClient.get('./assets/app-data.json'),
                this.getUserConfiguration()
            ).pipe(
                // 接收其他拦截器后产生的异常消息
                catchError(([langData, appData, abpConfig]) => {
                    resolve(null);
                    return [langData, appData, abpConfig];
                })
            ).subscribe(([langData, appData, abpConfig]) => {
                // setting language data
                let langs = abpConfig.localization.languages.map(function (l) {
                    return {
                        code: l.name,
                        text: l.displayName
                    }
                });
                this.i18n.addLangs(langs);
                this.translate.setTranslation(this.i18n.defaultLang, langData);
                this.translate.setDefaultLang(this.i18n.defaultLang);

                // application data
                // 应用信息：包括站点名、描述、年份
                this.settingService.setApp(appData.app);
                // 用户信息：包括姓名、头像、邮箱地址
                // this.settingService.setUser(appData.user);
                // ACL：设置权限为全量
                this.aclService.setFull(false);
                // 初始化菜单
                this.menuService.add(appData.menu);
                // 设置页面标题的后缀
                this.titleService.suffix = appData.app.name;
            },
                () => { },
                () => {
                    resolve(null);
                });

        });
    }

    private static getCurrentClockProvider(currentProviderName: string): abp.timing.IClockProvider {
        if (currentProviderName === 'unspecifiedClockProvider') {
            return abp.timing.unspecifiedClockProvider;
        }

        if (currentProviderName === 'utcClockProvider') {
            return abp.timing.utcClockProvider;
        }

        return abp.timing.localClockProvider;
    }

    private getUserConfiguration(): Observable<any> {

        return this.httpClient.get('/YkAbpUserConfiguration/GetAll')
            .map((response: any) => {
                let result: any = response.result;
                $.extend(true, abp, result);

                abp.clock.provider = StartupService.getCurrentClockProvider(result.clock.provider);

                moment.locale(abp.localization.currentLanguage.name);

                if (abp.clock.provider.supportsMultipleTimezone) {
                    moment.tz.setDefault(abp.timing.timeZoneInfo.iana.timeZoneId);
                }
                return result;
            });
    }
}
