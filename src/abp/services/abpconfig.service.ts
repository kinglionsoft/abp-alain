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
    private adapteFromAbpNav(abpMenus: any[]): Menu[] {
        return [];
    }

    /**暂时不能注入TokenService来获取token，待优化 */
    private getToken(): string {
        let token = localStorage.getItem('_token');
        if (!token) return '';
        let tokenEntity = JSON.parse(token);
        return tokenEntity ? tokenEntity.token : '';
    }
}
