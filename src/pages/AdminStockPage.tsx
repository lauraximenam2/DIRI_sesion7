// src/pages/AdminStockPage.tsx
import { useEffect, FC } from 'react'; 
import { useSelector } from 'react-redux'; 
import { RootState } from '../store/store';   
import logger from '../services/logging';
// import { useMenu } from '../context/MenuContext'; 


const AdminStockPage: FC = () => {
  // Usamos useSelector para obtener menuItems y status del store de Redux
  const menuItemsFromStore = useSelector((state: RootState) => state.menu.items);
  const menuStatus = useSelector((state: RootState) => state.menu.status);
  const menuError = useSelector((state: RootState) => state.menu.error); 


  useEffect(() => {
    logger.info("AdminStockPage (Redux) montada", { itemCount: menuItemsFromStore.length, status: menuStatus });

  }, [menuItemsFromStore.length, menuStatus]); 

  if (menuStatus === 'loading') {
    return <div className="loadingFallback">Cargando stock...</div>;
  }

  if (menuStatus === 'failed') {
    return (
      <div className="errorFallback">
        <h2>Error al cargar el stock</h2>
        <p>{menuError || "Por favor, inténtalo de nuevo más tarde."}</p>
      </div>
    );
  }

  if (!menuItemsFromStore || menuItemsFromStore.length === 0) {
    return (
        <div>
            <h3 className="title">Disponibilidad de Productos</h3>
            <p>No hay items en el menú para mostrar o aún se están cargando.</p>
        </div>
    );
  }

  return (
    <div>
      <h3 className="title">Disponibilidad de Productos</h3>
      <ul className="ulApp">
        {menuItemsFromStore.map((item) => (
          <li key={item.id} className="liApp">
            <p>{item.name}</p>
            <p>Stock: #{item.quantity}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminStockPage;