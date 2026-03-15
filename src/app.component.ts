import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { InvoiceData } from './models/invoice.model';
import { InvoiceService } from './services/gemini.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly invoiceService = inject(InvoiceService);
  readonly isApiKeyConfigured = signal(true); // Always true, no AI key needed

  isModalVisible = signal<boolean>(false);
  selectedFile = signal<File | null>(null);
  invoices = signal<InvoiceData[]>([]);
  isProcessing = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  filterQuery = signal<string>('');

  filteredInvoices = computed(() => {
    const query = this.filterQuery().toLowerCase().trim();
    if (!query) {
      return this.invoices();
    }
    return this.invoices().filter(invoice =>
      invoice.invoiceNumber.toLowerCase().includes(query) ||
      invoice.orderId?.toLowerCase().includes(query) ||
      invoice.buyerName?.toLowerCase().includes(query) ||
      invoice.invoiceDate.toLowerCase().includes(query)
    );
  });

  selectedFileSize = computed(() => {
    const file = this.selectedFile();
    if (!file) return '';
    const sizeInKB = file.size / 1024;
    return sizeInKB > 1024
      ? `${(sizeInKB / 1024).toFixed(2)} MB`
      : `${sizeInKB.toFixed(2)} KB`;
  });

  constructor() {
    // Load invoices on page load
    this.loadInvoices();
  }

  openModal(): void {
    this.isModalVisible.set(true);
  }

  closeModal(): void {
    this.isModalVisible.set(false);
    this.selectedFile.set(null);
    this.errorMessage.set(null);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.errorMessage.set('File size exceeds 5MB limit.');
        return;
      }
      this.selectedFile.set(file);
      this.errorMessage.set(null);
    }
  }

  onFilterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filterQuery.set(input.value);
  }

  removeFile(event: MouseEvent): void {
    event.stopPropagation();
    this.selectedFile.set(null);
  }

  async processInvoice(): Promise<void> {
    const file = this.selectedFile();
    if (!file) return;

    this.isProcessing.set(true);
    this.errorMessage.set(null);

    try {
      // Upload invoice to Spring Boot backend
      await this.invoiceService.uploadInvoice(file).toPromise();

      // Reload invoices from backend
      this.loadInvoices();

      // Close modal
      this.closeModal();

    } catch (error) {
      console.error('Error uploading invoice:', error);
      this.errorMessage.set('Failed to upload invoice.');
    } finally {
      this.isProcessing.set(false);
    }
  }

  loadInvoices(): void {
    console.log("Load endpoint is called")
    this.invoiceService.getInvoices().subscribe(
      data => {
        console.log('Invoices loaded from backend:', data); // <-- log response
        this.invoices.set(data);
      },
      error => {
        console.error('Error loading invoices:', error);
        this.errorMessage.set('Failed to fetch invoices from backend.');
      }
    );
  }

  trackByInvoiceNumber(index: number, invoice: InvoiceData) {
  return invoice.invoiceNumber;
}
}