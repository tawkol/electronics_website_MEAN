import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private apiUrl = 'http://localhost:3000/api/prod';

  constructor(public http: HttpClient, public translate: LanguageService) {}
  private getHeaders(): HttpHeaders {
    const selectedLang = this.translate.getCurrentLanguageValue();
    return new HttpHeaders().set('Accept-Language', selectedLang);
  }

  getProducts(): Observable<any> {
    const headers = this.getHeaders();
    const url = `${this.apiUrl}/`;

    return this.http.get(url, { headers });
  }

  getProductById(id: string): Observable<any> {
    const headers = this.getHeaders();

    const url = `${this.apiUrl}/${id}`;

    return this.http.get(url, { headers });
  }

  addProduct(productData: any, images: File[]): Observable<any> {
    const formData: FormData = new FormData();

    // Append product data to the FormData object
    formData.append('name_en', productData.name_en);
    formData.append('name_ar', productData.name_ar);
    formData.append('description_en', productData.description_en);
    formData.append('description_ar', productData.description_ar);
    formData.append('price', productData.price);
    formData.append('category_en', productData.category_en);
    formData.append('category_ar', productData.category_ar);
    formData.append('show', productData.show ? 'true' : 'false');

    // Append multiple image files to the FormData
    images.forEach((image, index) => {
      formData.append('prodimg', image, image.name);
    });

    // Make a POST request to add the new product with images
    return this.http.post(this.apiUrl, formData);
  }

  getCategories(): Observable<any> {
    const headers = this.getHeaders();
    const url = `${this.apiUrl}/categories`;

    return this.http.get(url, { headers });
  }
}
