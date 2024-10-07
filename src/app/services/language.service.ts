import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private currentLang: string = 'en';
  public onLangChange: BehaviorSubject<string> = new BehaviorSubject(
    this.currentLang
  );

  constructor(private translateService: TranslateService) {
    const savedLang = localStorage.getItem('lang') || 'en';
    this.changeLanguage(savedLang);
  }

  changeLanguage(lang: string): void {
    this.translateService.use(lang);
    this.currentLang = lang;
    this.setDirection(lang);
    localStorage.setItem('lang', lang);
    this.onLangChange.next(lang);
  }

  getCurrentLanguageValue(): string {
    return this.currentLang;
  }

  private setDirection(lang: string): void {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
  }
}
