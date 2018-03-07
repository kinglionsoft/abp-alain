import { MenuService, Menu } from '@delon/theme';
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { AuthOptions, DA_OPTIONS_TOKEN } from '@delon/auth';
import * as moment from 'moment';
import { ACLService } from '@delon/acl';

@Injectable()
export class AbpConfigurationService {
    constructor(private httpClient: HttpClient,
        private menuService: MenuService,
        private aclService: ACLService,
        @Inject(DA_OPTIONS_TOKEN) private authOptions?: AuthOptions) { }

    getUserConfiguration(): Observable<any> {
        return this.httpClient.get('/YkAbpUserConfiguration/GetAll', {
            headers: {
                'Authorization': 'Bearer ' + this.getToken(),
                '.AspNetCore.Culture': abp.utils.getCookieValue("Abp.Localization.CultureName")
            },
            params: new HttpParams().set(this.authOptions.allow_anonymous_key, '1')
        })
            .map((response: any) => {
                let result: any = response.result;
                $.extend(true, abp, result);

                abp.clock.provider = this.getCurrentClockProvider(result.clock.provider);

                moment.locale(abp.localization.currentLanguage.name);

                if (abp.clock.provider.supportsMultipleTimezone) {
                    moment.tz.setDefault(abp.timing.timeZoneInfo.iana.timeZoneId);
                }
                // menus 
                this.menuService.add(this.adapteFromAbpNav(abp.nav.menus.AdminPanel.items));
                // roles
                let roles: string[] = [];
                for (let k in abp.auth.grantedPermissions) {
                    if (abp.auth.grantedPermissions[k]) {
                        roles.push(k);
                    }
                }
                if (abp.session.userId) {
                    roles.push('__user'); // for all logined users
                }
                this.aclService.add({ role: roles });
                return result;
            });
    }

    private getCurrentClockProvider(currentProviderName: string): abp.timing.IClockProvider {
        if (currentProviderName === 'unspecifiedClockProvider') {
            return abp.timing.unspecifiedClockProvider;
        }

        if (currentProviderName === 'utcClockProvider') {
            return abp.timing.utcClockProvider;
        }

        return abp.timing.localClockProvider;
    }

    /**将ABP的菜单格式化为alain的格式 */
    private adapteFromAbpNav(abpMenus: abp.nav.IMenuItem[]): Menu[] {
        return abpMenus.map(menu => this.mapAbpNavItem(menu));
    }

    private mapAbpNavItem(menu: abp.nav.IMenuItem): Menu {
        return {
            /** 文本 */
            text: menu.displayName,
            /** i18n主键 */
            i18n: menu.customData && menu.customData.i18n,
            /** 是否菜单组 */
            group: menu.customData && menu.customData.group,
            /** angular 路由 */
            link: menu.url,
            /** 外部链接 */
            externalLink: null,
            /** 链接 target */
            // target?: '_blank' | '_self' | '_parent' | '_top',
            /** 图标 */
            icon: menu.icon,
            /** 徽标数，展示的数字。（注：`group:true` 无效） */
            badge: undefined,
            /** 徽标数，显示小红点 */
            badge_dot: undefined,
            /** 徽标数，设置 Badge 颜色 （默认：error， 所有颜色值见：https://github.com/cipchk/ng-alain/blob/master/_documents/utils.md#色彩） */
            badge_status: undefined,
            /** 是否隐藏 */
            hide: false,
            /** ACL配置，若导入 `@delon/acl` 时自动有效, ABP不会返回无权限的菜单 */
            acl: undefined,
            /** 是否快捷菜单项 */
            shortcut: menu.customData && menu.customData.shortcut,
            /** 快捷菜单根节点 */
            shortcut_root: menu.customData && menu.customData.shortcut_root,
            /** 是否允许复用，需配合 `reuse-tab` 组件 */
            reuse: menu.customData && menu.customData.reuse,
            /** 二级菜单 */
            children: menu.items && menu.items.map(m => this.mapAbpNavItem(m))
        };
    }

    /**暂时不能注入TokenService来获取token，待优化 */
    private getToken(): string {
        let token = localStorage.getItem('_token');
        if (!token) return '';
        let tokenEntity = JSON.parse(token);
        return tokenEntity ? tokenEntity.token : '';
    }
}
