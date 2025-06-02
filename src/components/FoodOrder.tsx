import { useState, ChangeEvent, MouseEventHandler, useEffect } from 'react'; 
import { MenuItem } from '../entities/entities'; 
import './FoodOrder.css';
// import { useMenu } from '../context/MenuContext'; 

import logger from '../services/logging'; 

// Hooks de React-Redux y Thunk
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store'; 
import { submitOrderAndDecreaseStock, resetLastOrderStatus } from '../store/menuSlice';

interface FoodOrderProps {
  food: MenuItem;
  onReturnToMenu: MouseEventHandler<HTMLButtonElement>;
}

function FoodOrder(props: FoodOrderProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { items: menuItems } = useSelector((state: RootState) => state.menu);
  const lastOrderStatus = useSelector((state: RootState) => state.menu.lastOrderStatus);
  const lastOrderError = useSelector((state: RootState) => state.menu.lastOrderError);

  const [orderQuantity, setOrderQuantity] = useState<number>(1); 
  // Los mensajes ahora se derivan de lastOrderStatus y lastOrderError

  const totalPrice = (props.food.price * orderQuantity).toFixed(2);

  const handleQuantityChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (lastOrderStatus === 'submitting' || lastOrderStatus === 'succeeded') return;

    const quantity = parseInt(event.target.value, 10);
    if (!isNaN(quantity) && quantity >= 0) {
      setOrderQuantity(quantity);
      if (lastOrderStatus === 'failed') { 
        dispatch(resetLastOrderStatus());
      }
    } else if (event.target.value === '') {
      setOrderQuantity(0);
      if (lastOrderStatus === 'failed') {
        dispatch(resetLastOrderStatus());
      }
    }
  };

  const handleSubmitOrder = () => { // Ya no necesita ser async aquí, el thunk lo es
    if (orderQuantity <= 0) {
      alert('Por favor, introduce una cantidad válida.');
      return;
    }

    // Obtener el item actual del store para la validación de stock más reciente
    const currentItemFromStore = menuItems.find(item => item.id === props.food.id);
    if (!currentItemFromStore || orderQuantity > currentItemFromStore.quantity) {
      alert(`Lo sentimos, solo quedan ${currentItemFromStore?.quantity || 0} de "${props.food.name}" disponibles.`);
      return;
    }

    logger.info(`FoodOrder: Despachando submitOrderAndDecreaseStock para ${props.food.name} y cantidad ${orderQuantity}`); 
    dispatch(submitOrderAndDecreaseStock({ food: props.food, orderedQuantity: orderQuantity }));
  }

  // Limpiar el estado del último pedido cuando el componente se monta o cambia el food
  useEffect(() => {
    logger.debug("FoodOrder: Reseteando estado de último pedido y cantidad.", { foodId: props.food.id });
    dispatch(resetLastOrderStatus());
    setOrderQuantity(1);
  }, [props.food, dispatch]);


  let displayMessage = '';
  let messageType: 'success' | 'error' | 'loading' | '' = '';

  if (lastOrderStatus === 'submitting') {
    displayMessage = 'Enviando pedido...';
    messageType = 'loading';
  } else if (lastOrderStatus === 'succeeded') {
    //displayMessage = `¡Pedido enviado con éxito!`;
    displayMessage = `Pedido de ${orderQuantity} x ${props.food.name} enviado. ¡Gracias!`;
  } else if (lastOrderStatus === 'failed') {
    displayMessage = lastOrderError || 'Error al enviar el pedido. Inténtalo de nuevo.';
    messageType = 'error';
  }

  return (
    <div className="foodOrderContainer">
      <h3>Detalles del Pedido para: {props.food.name}</h3>
      <div className="orderDetails">
        <img
          className="orderFoodImg"
          src={`${import.meta.env.BASE_URL}images/${props.food.image}`}
          alt={props.food.name}
        />
        <div className="orderInfo">
          <p className="orderDesc">{props.food.desc}</p>
          <p className="orderBasePrice">Precio unitario: {props.food.price.toFixed(2)}$</p>
          <div className="quantityControl">
            <label htmlFor={`quantity-${props.food.id}`}>Cantidad:</label>
            <input
              type="number"
              id={`quantity-${props.food.id}`}
              name="quantity"
              min="0"
              value={orderQuantity}
              onChange={handleQuantityChange}
              className="quantityInput"
              disabled={lastOrderStatus === 'submitting' || lastOrderStatus === 'succeeded'}
            />
          </div>
          <p className="orderTotalPrice">Precio Total: {totalPrice}$</p>
        </div>
      </div>

      {displayMessage && (
        <p className={`confirmationMessage ${messageType}`}>
          {displayMessage}
        </p>
      )}

      <div className="orderActions">
        <button
          onClick={handleSubmitOrder}
          className="submitOrderButton"
          disabled={orderQuantity <= 0 || lastOrderStatus === 'submitting' || lastOrderStatus === 'succeeded'}
        >
          {lastOrderStatus === 'submitting' ? 'Enviando...' : 
           (lastOrderStatus === 'succeeded' ? 'Pedido Enviado' : 'Enviar Pedido')}
        </button>
        <button 
          onClick={props.onReturnToMenu} 
          className="returnMenuButton"
          disabled={lastOrderStatus === 'submitting'} 
        >
          Volver al menú
        </button>
      </div>
    </div>
  );
}

export default FoodOrder;