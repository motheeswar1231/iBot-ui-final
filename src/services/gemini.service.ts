import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InvoiceData } from '../models/invoice.model';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private http = inject(HttpClient);

  // Your Spring Boot endpoints
  private apiUrl = 'http://localhost:8080/invoice';

  /** Get all invoices from the Spring Boot backend */
 getInvoices(): Observable<InvoiceData[]> {
  console.log("Came to service", `${this.apiUrl}/invoices`);
  return this.http.get<InvoiceData[]>(`${this.apiUrl}/invoices`);
}

  /** Upload a new invoice to the Spring Boot backend */
  uploadInvoice(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

 /** Get invoice by invoice number */
getInvoiceBySearch(value: string): Observable<InvoiceData[]> {
  return this.http.get<InvoiceData[]>(`${this.apiUrl}/invoices/search/${value}`);
}
}