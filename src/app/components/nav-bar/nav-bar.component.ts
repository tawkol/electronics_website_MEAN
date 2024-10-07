import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, FontAwesomeModule, TranslateModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css',
})
// export class NavBarComponent implements OnInit {
export class NavBarComponent {
  isNavbarCollapsed = true;
  lang = '';
  ShoppingCart = faShoppingCart;

  constructor(
    public cartService: CartService,
    public translate: LanguageService // public translate: TranslateService
  ) {}
  switchLanguage(lang: any) {
    const selectedLanguage = lang.target.value;
    this.translate.changeLanguage(selectedLanguage);
  }
  getCurrentLang() {
    return this.translate.getCurrentLanguageValue();
  }

  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }
}
