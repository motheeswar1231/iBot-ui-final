
export interface InvoiceItem {
  productName: string;
  description: string;
  quantity: number;
  grossAmount: number;
  discount: number;
  taxableValue: number;
  igst: number;
  total: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  gstin: string;
  invoiceDate: string;
  orderId: string;
  pan: string;
  buyerName: string;
  items: InvoiceItem[];
  totalAmount: number;
}
