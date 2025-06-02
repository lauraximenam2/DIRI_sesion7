/* // src/__tests__/App.test.tsx

import { render, screen, within } from '@testing-library/react'; 
import userEvent from '@testing-library/user-event';
import App from '../App';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock del import dinámico para LazyFoods
vi.mock('../components/Foods', async (importOriginal) => {
  const OriginalFoods = (await importOriginal()) as { default: React.FC<any> };
  return {
    default: OriginalFoods.default,
  };
});

describe('Pruebas de la Aplicación de Comida Rápida', () => {
  afterEach(() => {
    cleanup();
  });

  // --- PRUEBA 1: Cuatro productos en la carta inicial (Vista de Disponibilidad) ---
  it('debe mostrar cuatro productos en la vista de disponibilidad inicial con stock, imagen y nombre', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Pedir Comida/i })).toBeInTheDocument();
    expect(screen.getByText('Hamburguesa de Pollo')).toBeInTheDocument();
    expect(screen.getByText('Patatas Fritas')).toBeInTheDocument();
    expect(screen.getByText('Hamburguesas Vegetarianas')).toBeInTheDocument();
    expect(screen.getByText('Helado')).toBeInTheDocument();

    const polloListItem = screen.getByText('Hamburguesa de Pollo').closest('li');
    expect(polloListItem).toHaveTextContent('#40');
    const heladoListItem = screen.getByText('Helado').closest('li');
    expect(heladoListItem).toHaveTextContent('#40');

    const ulAppElement = document.querySelector('.ulApp'); // Selector más específico si es necesario
    if (!ulAppElement) throw new Error("Elemento .ulApp no encontrado para la prueba de conteo de items");
    const listItemsInUlApp = within(ulAppElement).getAllByRole('listitem');
    expect(listItemsInUlApp).toHaveLength(4);
  });

  // --- PRUEBA 2: En la pantalla de Pedir Comida se muestran cuatro productos y alguno de los precios ---
  it('debe mostrar cuatro productos en la pantalla de "Pedir Comida" (Carta) con sus precios', async () => {
    const user = userEvent.setup();
    render(<App />);
    const toggleButton = screen.getByRole('button', { name: /Pedir Comida/i });
    await user.click(toggleButton);

    expect(await screen.findByText('Hamburguesa de Pollo')).toBeInTheDocument();
    expect(await screen.findByText('Patatas Fritas')).toBeInTheDocument(); 
    expect(await screen.findByText('Hamburguesas Vegetarianas')).toBeInTheDocument();
    expect(await screen.findByText('Helado')).toBeInTheDocument();

    expect(screen.getByText('30.00$')).toBeInTheDocument();
    expect(screen.getByText('5.00$')).toBeInTheDocument();

    const orderButtons = await screen.findAllByRole('button', { name: /Pedir este plato/i });
    expect(orderButtons).toHaveLength(4);
  });

  // --- PRUEBA 3: En la compra se actualiza correctamente el precio total en FoodOrder cuando se cambia la cantidad ---
  it('debe actualizar correctamente el precio total en FoodOrder cuando se cambia la cantidad', async () => {
    const user = userEvent.setup();
    render(<App />);

    const toggleButton = screen.getByRole('button', { name: /Pedir Comida/i });
    await user.click(toggleButton);

    // Esperar y seleccionar el botón de "Patatas Fritas"
    const potatoesTextElement = await screen.findByText('Patatas Fritas');
    const potatoesItemContainer = potatoesTextElement.closest('li');
    if (!potatoesItemContainer) throw new Error('Contenedor del ítem "Patatas Fritas" no encontrado');
    
    const specificOrderButton = within(potatoesItemContainer).getByRole('button', { name: /Pedir este plato/i });
    await user.click(specificOrderButton);

    // Ahora en la vista FoodOrder para Patatas Fritas
    expect(await screen.findByText('Precio unitario: 15.00$')).toBeInTheDocument();
    const quantityInput = screen.getByLabelText<HTMLInputElement>(/Cantidad:/i);
    expect(quantityInput.value).toBe('1');
    expect(screen.getByText('Precio Total: 15.00$')).toBeInTheDocument();

    await user.clear(quantityInput);
    await user.type(quantityInput, '3');
    expect(quantityInput.value).toBe('3');
    expect(screen.getByText('Precio Total: 45.00$')).toBeInTheDocument();

    await user.clear(quantityInput);
    await user.type(quantityInput, '0');
    expect(quantityInput.value).toBe('0');
    expect(screen.getByText('Precio Total: 0.00$')).toBeInTheDocument();
  });
}); */