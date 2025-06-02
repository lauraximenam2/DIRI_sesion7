import './Foods.css';
// import { useMenu } from '../context/MenuContext'; 
import { MenuItem } from '../entities/entities';

// Hooks de React-Redux
import { useSelector } from 'react-redux';
import { useEffect } from 'react'; 
import { RootState } from '../store/store'; 
import logger from '../services/logging';

interface FoodsProps {
  onFoodSelected: (food: MenuItem) => void;
}

function Foods(props: FoodsProps) {
  // Obtener menuItems y el estado de carga del store de Redux
  const menuItemsFromStore = useSelector((state: RootState) => state.menu.items);
  const menuLoadingStatus = useSelector((state: RootState) => state.menu.status); // 'idle', 'loading', 'succeeded', 'failed'

  useEffect(() => { 
    logger.debug("Foods component (Redux) renderizando", { count: menuItemsFromStore.length, status: menuLoadingStatus });
  }, [menuItemsFromStore, menuLoadingStatus]);


  if (menuLoadingStatus === 'loading') {
    return <div className="loadingFallback">Cargando menú...</div>;
  }

  if (menuLoadingStatus === 'failed') {
    return <div className="errorFallback">Error al cargar el menú. Inténtalo de nuevo.</div>;
  }

  return (
    <>
      <ul className="ulFoods">
        {menuItemsFromStore.map((item) => (
          <li key={item.id} className="liFoods">
            <img
              className="foodImg"
              src={`${import.meta.env.BASE_URL}images/${item.image}`}
              alt={item.name}
            />
            <div className="foodItem">
              <h5 className="foodName">{item.name}</h5>
              <p className="foodDesc">{item.desc}</p>
              <p className="foodPrice">{item.price.toFixed(2)}$</p>
            </div>
            <button
              className="selectFoodButton"
              onClick={() => props.onFoodSelected(item)}
              disabled={item.quantity <= 0}
            >
              {item.quantity > 0 ? 'Pedir este plato' : 'Agotado'}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

export default Foods;