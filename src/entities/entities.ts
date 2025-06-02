export interface MenuItem { 
    id: number, 
    name: string, 
    quantity: number, 
    desc: string, 
    price: number, 
    image: string 
}

export interface OrderItem {
    menuItemId: number;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }

  export interface Order {
    id?: string; 
    items: OrderItem[];
    orderTotal: number;
    timestamp: string;
  }