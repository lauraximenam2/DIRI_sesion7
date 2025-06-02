// src/firebase-config.ts
import { initializeApp,  FirebaseApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyByEzW7hysytxGDFOwvNTFIQw_L_me6Chk",
  authDomain: "foodapp-firebase-eb849.firebaseapp.com",
  databaseURL: "https://foodapp-firebase-eb849-default-rtdb.firebaseio.com/", 
  projectId: "foodapp-firebase-eb849",
  storageBucket: "foodapp-firebase-eb849.firebasestorage.app",
  messagingSenderId: "407774276644",
  appId: "1:407774276644:web:20d23e4bf254ccb75ffcb1"
};

// Inicializar Firebase
const app: FirebaseApp = initializeApp(firebaseConfig); 

// Exportar la instancia de la base de datos para usarla en otros lugares
export const db = getDatabase(app);

export { app };