import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { Table, Badge, Card, Spinner } from "react-bootstrap";
import StockForm from "./StockForm";
import Swal from "sweetalert2";
import "./Inventory.css";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); // 2. Estado para mostrar/ocultar

  // 1. Metemos la lógica de carga en una función reusable
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // USÁ HTTPS si Herd te está forzando SSL
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Llamamos a la función al montar el componente
  useEffect(() => {
    fetchProducts();
  }, []);
  const handleStockChange = async (id, isAdding) => {
    // Buscamos el producto actual para saber su tipo
    const product = products.find((p) => p.id === id);
    const action = isAdding ? "adicionar" : "restar";
    const color = isAdding ? "#38a169" : "#e53e3e";

    const { value: amount } = await Swal.fire({
      title: `${isAdding ? "Sumar" : "Restar"} Stock`,
      input: "number",
      inputLabel: `Cantidad a ${action} (${product.unit})`,
      inputPlaceholder: "Ej: 5, 10, 500...",
      // AJUSTE: Si el tipo es 'u' (unidades), el step es 1, si no, permite decimales
      inputAttributes: {
        step: product.unit_type === "u" ? "1" : "0.01",
      },
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      confirmButtonColor: color,
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        if (!value || value <= 0) {
          return "¡Tenés que ingresar una cantidad válida!";
        }
        // VALIDACIÓN EXTRA: Si es unidad, que no sea decimal
        if (product.unit_type === "u" && !Number.isInteger(Number(value))) {
          return "Para este producto solo podés ingresar números enteros.";
        }
      },
    });

    // 2. Si el usuario confirmó y puso un número
    if (amount) {
      try {
        const finalAmount = isAdding ? parseFloat(amount) : -parseFloat(amount);
        const response = await api.patch(
          `/products/${id}/stock`,
          { amount: finalAmount },
        );

        if (response.status === 200) {
          setProducts(products.map((p) => (p.id === id ? response.data : p)));

          // Un toast chiquito de éxito (no invasivo)
          const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
          });
          Toast.fire({
            icon: "success",
            title: "Stock actualizado",
          });
        }
      } catch (error) {
        console.error("Error al actualizar stock:", error);
        Swal.fire("Error", "No se pudo actualizar el stock", "error");
      }
    }
  };
  const handleDelete = async (id) => {
    // Verificamos que Swal exista antes de usarlo
    if (typeof Swal === "undefined") {
      console.error("SweetAlert2 no está cargado");
      return;
    }

    const result = await Swal.fire({
      title: "¿Eliminar producto?",
      text: "Esta acción quitará el insumo del inventario.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e53e3e",
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        // Usamos la URL completa de tu backend en Herd
        await api.delete(`/products/${id}`);

        // Si llegamos acá, borró bien en la DB
        fetchProducts(); // Recarga la lista

        Swal.fire({
          title: "¡Borrado!",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error al borrar:", error);
        Swal.fire("Error", "No se pudo eliminar el registro.", "error");
      }
    }
  };

  return (
    <div>
      {/* 3. Encabezado dinámico */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold m-0 text-dark">
          {showForm ? "Nuevo Insumo" : "Gestión de Stock"}
        </h3>

        {!showForm && (
          <button
            className="btn-primary-indoor"
            onClick={() => setShowForm(true)}
          >
            + Agregar Insumo
          </button>
        )}
      </div>

      {/* 4. Switch entre Formulario y Tabla */}
      {showForm ? (
        <StockForm
          onCancel={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchProducts(); // Esta es la que refresca la lista
          }}
        />
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="success" />
              </div>
            ) : (
              <Table hover responsive className="align-middle m-0">
                <thead className="table-light">
                  <tr>
                    <th>Producto</th>
                    <th>Marca</th>
                    <th>Stock</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="fw-bold">{p.name}</td>
                      <td>
                        <Badge bg="info" className="fw-normal">
                          {p.brand}
                        </Badge>
                      </td>

                      {/* CELDA MODIFICADA: Lógica para unidades vs líquidos */}
                      <td
                        className={
                          p.unit_type === "u"
                            ? "text-primary fw-bold"
                            : "text-success fw-bold"
                        }
                      >
                        {
                          p.unit_type === "u"
                            ? Math.floor(p.stock) // Si son semillas, mostramos el entero
                            : p.stock // Si es fertilizante, mostramos el decimal
                        }
                        <small className="text-muted ms-1">{p.unit}</small>
                      </td>

                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn-stock-action minus"
                            onClick={() => handleStockChange(p.id, false)}
                          >
                            <i className="bi bi-dash-lg"></i>
                          </button>

                          <button
                            className="btn-stock-action plus"
                            onClick={() => handleStockChange(p.id, true)}
                          >
                            <i className="bi bi-plus-lg"></i>
                          </button>

                          <button
                            className="btn-delete-quick"
                            onClick={() => handleDelete(p.id)}
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default Inventory;
