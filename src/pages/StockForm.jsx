import { useState } from "react";
import "./StockForm.css";
import axios from "axios";
import Swal from 'sweetalert2';

const StockForm = ({ onCancel, onSuccess  }) => {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    stock: "",
    unit: "L",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const response = await axios.post('https://indoor-backend.test/api/products', formData, {
        headers: { 'Accept': 'application/json' }
    });

    if (response.status === 201) {
      // Modal de éxito pro
      Swal.fire({
        title: '¡Guardado!',
        text: 'El insumo se registró correctamente.',
        icon: 'success',
        confirmButtonColor: '#28a745',
        timer: 2000 // Se cierra solo en 2 segundos
      });

      onSuccess(); // Refresca la tabla y cierra el form
    }
  } catch (error) {
    console.error('Detalle del error:', error.response?.data || error);
    
    Swal.fire({
      title: 'Error',
      text: 'No se pudo guardar. Revisá la consola o los campos.',
      icon: 'error',
      confirmButtonColor: '#d33'
    });
  }
};

  return (
    <div className="form-card animate__animated animate__fadeIn">
      <h4 className="mb-4">Agregar Nuevo Insumo</h4>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6 input-group-custom">
            <label>Nombre del Producto</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Ej: Alga Bloom"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 input-group-custom">
            <label>Marca</label>
            <input
              type="text"
              name="brand"
              className="form-control"
              placeholder="Ej: Plagron"
              value={formData.brand}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 input-group-custom">
            <label>Cantidad Inicial</label>
            <input
              type="number"
              name="stock"
              step="0.01"
              className="form-control"
              value={formData.stock}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 input-group-custom">
            <label>Unidad</label>
            <select
              name="unit"
              className="form-select"
              value={formData.unit}
              onChange={handleChange}
            >
              <option value="L">Litros (L)</option>
              <option value="ml">Mililitros (ml)</option>
              <option value="Kg">Kilogramos (Kg)</option>
              <option value="gr">Gramos (gr)</option>
            </select>
          </div>
        </div>

        <div className="d-flex gap-2 mt-3">
          <button type="submit" className="btn-primary-indoor">
            Guardar Insumo
          </button>
          <button type="button" className="btn btn-light" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default StockForm;
