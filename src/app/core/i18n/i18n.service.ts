import { Injectable, Inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { zhCN, enUS, NzLocaleService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService, AlainI18NService } from '@delon/theme';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class I18NService implements AlainI18NService {

    private _default = 'zh-CN';

    private _defaultLangs = [
        { code: 'zh-CN', text: '中文' },
        { code: 'en', text: 'English' }
    ];

    private _langs = [];

    constructor(
        settings: SettingsService,
        private nzLocalService: NzLocaleService,
        private translate: TranslateService,
        private injector: Injector
    ) {
        const defaultLan = settings.layout.lang || translate.getBrowserLang();
        const lans = this._defaultLangs.map(item => item.code);
        this._default = lans.includes(defaultLan) ? defaultLan : lans[0];
        translate.addLangs(lans);
        this._langs = [...this._defaultLangs];
    }

    use(lang: string = null, firstLoad = true): Observable<any> {
        lang = lang || this.translate.getDefaultLang();
        this.nzLocalService.setLocale(lang === 'en' ? enUS : zhCN);
        // need reload router because of ng-zorro-antd local system
        if (!firstLoad) this.injector.get(Router).navigate(['/']);
        return this.translate.use(lang);
    }
    /** 获取语言列表 */
    getLangs() {
        return this._langs;
    }
    /** 翻译 */
    fanyi(key: string) {
        return this.translate.instant(key);
    }
    /** 默认语言 */
    get defaultLang() {
        return this._default;
    }
    /** 当前语言 */
    get currentLang() {
        return this.translate.currentLang || this.translate.getDefaultLang() || this._default;
    }

    /** 增加默认语言之外的语言 */
    addLangs(langs: { code: string, text: string }[]) {
        const defaultLangs = this._defaultLangs.map(item => item.code);
        this._langs = this._defaultLangs.map(i => i); // clone
        for (let i = 0; i < langs.length; i++) {
            const l = langs[i];
            if (!defaultLangs.includes(l.code)) {
                this._langs.push({
                    code: l.code,
                    text: l.text
                });
            }
        }
        this.translate.langs = [];
        this.translate.addLangs(this._langs.map(l => l.code));
    }
}
