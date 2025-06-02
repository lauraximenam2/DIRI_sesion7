// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import menuReducer from './menuSlice';
import reduxLoggerMiddleware from './loggerMiddleware'; 

const store = configureStore({
  reducer: {
    menu: menuReducer,
  },
  // Middleware: RTK incluye thunk por defecto.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
     .concat(reduxLoggerMiddleware), 
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;