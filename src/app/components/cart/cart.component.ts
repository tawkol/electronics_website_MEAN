import { Component, OnInit } from '@angular/core';
import { CartService, CartProduct } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlus,
  faMinus,
  faTrashAlt,
  faArrowRight,
  faShoppingCart,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, TranslateModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  cart: CartProduct[] = [];
  total: number = 0;

  // icons
  trashIcon = faTrashAlt;
  minusIcon = faMinus;
  plusIcon = faPlus;
  rightArrowIcon = faArrowRight;
  leftArrowIcon = faArrowLeft;
  cartIcon = faShoppingCart;

  constructor(public cartService: CartService) {}

  ngOnInit() {
    this.updateCart();
    console.log(this.cart);
  }

  private updateCart() {
    this.cart = this.cartService.getCart();
    this.total = this.cartService.getTotal();
  }

  deleteProduct(item: CartProduct) {
    this.cartService.deleteProduct(item);
    this.updateCart();
  }

  incrementProduct(item: CartProduct) {
    this.cartService.incrementProduct(item._id);
    this.updateCart();
  }

  decrementProduct(item: CartProduct) {
    this.cartService.decrementProduct(item._id);
    this.updateCart();
  }
}
