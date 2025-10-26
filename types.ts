export interface ReceiptItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface ReceiptData {
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export interface Assignment {
  itemId: number;
  personNames: string[];
}

export interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
}

export interface PersonTotal {
    name: string;
    total: number;
    subtotal: number;
    tax: number;
    tip: number;
}

export interface Bill {
  id: string;
  title: string;
  createdAt: number;
  receiptImage: string | null;
  parsedReceipt: ReceiptData | null;
  assignments: Assignment[];
  chatHistory: ChatMessage[];
  diners: string[];
  dinerTips: { [key: string]: number };
  dinerSettlement: { [key: string]: boolean };
}