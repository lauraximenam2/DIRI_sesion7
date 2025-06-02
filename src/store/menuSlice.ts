// src/store/menuSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MenuItem, Order, OrderItem } from '../entities/entities'; 
import { db as firebaseDB } from '../../firebase-config';
import { ref, push } from "firebase/database";
import logger from '../services/logging'; 

//Cargándolos asincronamente
const initialLocalItems: MenuItem[] = [
    { id: 1, name: "Hamburguesa de Pollo", quantity: 40, desc: "Jugosa hamburguesa de pollo, acompañada de frescos vegetales de temporada y tus salsas favoritas.", price: 30, image: "cb.png" },
    { id: 2, name: "Patatas Fritas", quantity: 40, desc: "Nuestras patatas fritas doradas y perfectamente crujientes, servidas en una generosa porción.", price: 15, image: "chips.png" },
    { id: 3, name: "Hamburguesas Vegetarianas", quantity: 40, desc: "Deliciosa hamburguesa a base de plantas, repleta de sabor y textura.", price: 20, image: "hv.png" },
    { id: 4, name: "Helado", quantity: 40, desc: "Refrescante y cremoso helado, disponible en una variedad de sabores clásicos y sorprendentes.", price: 5, image: "ice.png" },
  ];

// --- Estado Inicial y Tipos ---
export interface MenuState {
  items: MenuItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed'; // Para operaciones asíncronas
  error: string | null | undefined;
  lastOrderStatus: 'idle' | 'submitting' | 'succeeded' | 'failed';
  lastOrderError: string | null | undefined;
}


const initialState: MenuState = {
  items: initialLocalItems, 
  status: 'idle',
  error: null,
  lastOrderStatus: 'idle',
  lastOrderError: null,
};

// Thunk para guardar un pedido en Firebase y actualizar el stock local
export const submitOrderAndDecreaseStock = createAsyncThunk<
  { updatedItem: MenuItem, orderId: string }, // Tipo de lo que retorna si es exitoso
  { food: MenuItem, orderedQuantity: number }, // Argumentos que recibe el thunk
  { rejectValue: string } // Tipo de lo que retorna si hay error
>(
  'menu/submitOrder',
  async ({ food, orderedQuantity }, { dispatch, rejectWithValue, getState }) => {
    logger.info(`Thunk: submitOrderAndDecreaseStock para ${food.name} x ${orderedQuantity}`);
    const orderItem: OrderItem = {
      menuItemId: food.id,
      name: food.name,
      quantity: orderedQuantity,
      unitPrice: food.price,
      totalPrice: food.price * orderedQuantity,
    };
    const newOrderPayload: Omit<Order, 'id'> = { // Omitimos id porque Firebase lo genera
      items: [orderItem],
      orderTotal: orderItem.totalPrice,
      timestamp: new Date().toISOString(), 
    };

    try {
      const ordersRef = ref(firebaseDB, "orders");
      const newOrderRef = await push(ordersRef, newOrderPayload); // push devuelve una referencia con la key
      if (!newOrderRef.key) {
        throw new Error("No se pudo obtener el ID del nuevo pedido de Firebase.");
      }
      logger.info("Thunk: Pedido guardado en Firebase", { orderId: newOrderRef.key });

      // Actualizar el stock localmente (después de confirmar en Firebase)
      // Esto es una acción síncrona del slice
      dispatch(decreaseStock({ itemId: food.id, quantityToRemove: orderedQuantity }));

      // Devolver datos útiles para el estado 'fulfilled'
      const updatedItemState = (getState() as { menu: MenuState }).menu.items.find(i => i.id === food.id);
      if (!updatedItemState) throw new Error("Item no encontrado en el estado después de actualizar stock");

      return { updatedItem: updatedItemState, orderId: newOrderRef.key };

    } catch (error: any) {
      logger.error("Thunk: Error al guardar pedido en Firebase", error);
      return rejectWithValue(error.message || 'Error desconocido al enviar el pedido');
    }
  }
);


// --- Slice ---
const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    // Acción síncrona para decrementar stock (llamada por el thunk)
    decreaseStock: (state, action: PayloadAction<{ itemId: number; quantityToRemove: number }>) => {
      const { itemId, quantityToRemove } = action.payload;
      const existingItem = state.items.find(item => item.id === itemId);
      if (existingItem) {
        logger.debug(`Reducer: Decrementando stock para ${existingItem.name}`, { oldQty: existingItem.quantity, remove: quantityToRemove });
        const newQuantity = existingItem.quantity - quantityToRemove;
        existingItem.quantity = newQuantity >= 0 ? newQuantity : 0;
      }
    },

    resetLastOrderStatus: (state) => {
        state.lastOrderStatus = 'idle';
        state.lastOrderError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitOrderAndDecreaseStock.pending, (state) => {
        state.lastOrderStatus = 'submitting';
        state.lastOrderError = null;
        logger.debug("Reducer: submitOrderAndDecreaseStock.pending");
      })
      .addCase(submitOrderAndDecreaseStock.fulfilled, (state, action) => {
        state.lastOrderStatus = 'succeeded';
        // El stock ya se actualizó con la acción síncrona 'decreaseStock'
        logger.info("Reducer: submitOrderAndDecreaseStock.fulfilled", { payload: action.payload });
      })
      .addCase(submitOrderAndDecreaseStock.rejected, (state, action) => {
        state.lastOrderStatus = 'failed';
        state.lastOrderError = action.payload; 
        logger.error("Reducer: submitOrderAndDecreaseStock.rejected", { error: action.payload });
      });
  },
});

export const { decreaseStock, resetLastOrderStatus } = menuSlice.actions;

export default menuSlice.reducer;