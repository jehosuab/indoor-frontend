import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Swal from 'sweetalert2';

const PlantingPage = () => {
    const [loading, setLoading] = useState(true);
    const [inventory, setInventory] = useState([]);
    const [isTransplanting, setIsTransplanting] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        start_date: new Date().toISOString().split('T')[0], // La fecha vuelve a estar aquí
        initial_notes: '',
        strains: [{ product_id: '', quantity: '', sprouted_count: '' }]
    });

    const fetchInsumos = async () => {
        setLoading(true);
        try {
            const res = await api.get('/products');
            console.log("Inventario cargado desde backend:", res.data);
            setInventory(res.data);
        } catch (error) {
            console.error("Error al cargar inventario del backend:", error);
            // Fallback: cargar datos mock
            try {
                const mockRes = await fetch('/mock-products.json');
                const mockData = await mockRes.json();
                console.log("Inventario cargado desde mock:", mockData);
                setInventory(mockData);
                Swal.fire({
                    title: 'Modo Offline',
                    text: 'No se pudo conectar al backend. Usando datos de prueba.',
                    icon: 'warning',
                    confirmButtonColor: '#f39c12'
                });
            } catch (mockError) {
                console.error("Error al cargar datos mock:", mockError);
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo cargar el inventario ni los datos de prueba.',
                    icon: 'error'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsumos();
    }, []);

    // Función para agregar más variedades
    const addStrain = () => {
        setFormData(prev => ({
            ...prev,
            strains: [...prev.strains, { product_id: '', quantity: '', sprouted_count: '' }]
        }));
    };

    // Función para remover una variedad
    const removeStrain = (index) => {
        if (formData.strains.length > 1) {
            setFormData(prev => ({
                ...prev,
                strains: prev.strains.filter((_, i) => i !== index)
            }));
        }
    };

    // Función para poder editar las cantidades en la tabla de semillas
    const handleStrainChange = (index, field, value) => {
        const newStrains = [...formData.strains];
        newStrains[index][field] = value;
        setFormData({ ...formData, strains: newStrains });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Preparar los datos asegurando tipos correctos
            const dataToSend = {
                name: formData.name,
                start_date: formData.start_date,
                initial_notes: formData.initial_notes || null,
                strains: formData.strains.map(strain => ({
                    product_id: parseInt(strain.product_id) || 0,
                    quantity: parseInt(strain.quantity) || 0,
                    sprouted_count: parseInt(strain.sprouted_count) || 0
                })).filter(strain => strain.product_id > 0 && strain.quantity > 0 && strain.sprouted_count >= 0)
            };

            // Validar stock disponible antes de enviar
            for (const strain of dataToSend.strains) {
                const product = inventory.find(p => p.id === strain.product_id);
                if (product && product.stock < strain.quantity) {
                    Swal.fire({
                        title: 'Stock insuficiente',
                        text: `No hay suficiente stock de ${product.name}. Disponible: ${product.stock}, solicitado: ${strain.quantity}`,
                        icon: 'error',
                        confirmButtonColor: '#d33'
                    });
                    return;
                }
            }

            // Agregar datos de sustrato solo si está transplantando
            if (isTransplanting && formData.substrate_id && formData.substrate_amount) {
                dataToSend.substrate_id = parseInt(formData.substrate_id);
                dataToSend.substrate_amount = parseInt(formData.substrate_amount);

                // Validar stock de sustrato
                const substrate = inventory.find(p => p.id == formData.substrate_id);
                if (substrate && substrate.stock < dataToSend.substrate_amount) {
                    Swal.fire({
                        title: 'Stock insuficiente',
                        text: `No hay suficiente stock de ${substrate.name}. Disponible: ${substrate.stock}, solicitado: ${dataToSend.substrate_amount}`,
                        icon: 'error',
                        confirmButtonColor: '#d33'
                    });
                    return;
                }
            }

            // Validaciones básicas
            if (!dataToSend.name.trim()) {
                Swal.fire({
                    title: 'Falta nombre',
                    text: 'Por favor ingrese un nombre para el lote.',
                    icon: 'warning',
                    confirmButtonColor: '#3085d6'
                });
                return;
            }
            if (dataToSend.strains.length === 0) {
                Swal.fire({
                    title: 'Falta variedad',
                    text: 'Por favor agregue al menos una variedad de semilla.',
                    icon: 'warning',
                    confirmButtonColor: '#3085d6'
                });
                return;
            }
            if (isTransplanting && (!formData.substrate_id || !formData.substrate_amount)) {
                Swal.fire({
                    title: 'Falta sustrato',
                    text: 'Por favor seleccione sustrato y cantidad cuando está transplantando.',
                    icon: 'warning',
                    confirmButtonColor: '#3085d6'
                });
                return;
            }

            console.log('Datos a enviar:', dataToSend); // Para debugging

            await api.post('/lots', dataToSend);
            await fetchInsumos();
            await Swal.fire({
                title: 'Siembra registrada',
                text: 'El lote se guardó y el inventario se actualizó correctamente.',
                icon: 'success',
                confirmButtonColor: '#28a745',
                timer: 2000,
                showConfirmButton: false,
                timerProgressBar: true,
            });
            setFormData({
                name: '',
                start_date: new Date().toISOString().split('T')[0],
                initial_notes: '',
                strains: [{ product_id: '', quantity: '', sprouted_count: '' }]
            });
            setIsTransplanting(false);
        } catch (error) {
            console.error('Error completo:', error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || error.message,
                icon: 'error',
                confirmButtonColor: '#d33'
            });
        }
    };

    if (loading) return <div className="container mt-5">Cargando datos del inventario...</div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Nueva Tanda de Cultivo</h2>
            <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
                
                <div className="row">
                    <div className="col-md-8 mb-3">
                        <label className="form-label">Nombre del Lote</label>
                        <input 
                            type="text" 
                            className="form-control"
                            placeholder="Ej: Ciclo 1 - Abril 2026"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>
                    {/* FECHA REINCORPORADA */}
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Fecha de Inicio</label>
                        <input 
                            type="date" 
                            className="form-control"
                            value={formData.start_date}
                            onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                            required
                        />
                    </div>
                </div>

                <div className="card bg-light p-3 mb-4">
                    <h5>Variedades y Germinación</h5>
                    {formData.strains.map((strain, index) => (
                        <div key={index} className="row g-2 mb-2 align-items-end">
                            <div className="col-md-6">
                                <label className="form-label">Semilla</label>
                                <select 
                                    className="form-select"
                                    value={strain.product_id}
                                    onChange={(e) => handleStrainChange(index, 'product_id', e.target.value)}
                                    required
                                >
                                    <option value="">Seleccionar variedad...</option>
                                    {inventory.filter(p => p.unit_type === 'u' && p.stock > 0).map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.brand}) - Stock: {p.stock} {p.unit}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Cant. Usada</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    value={strain.quantity} 
                                    onChange={(e) => handleStrainChange(index, 'quantity', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Brotes</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    value={strain.sprouted_count} 
                                    onChange={(e) => handleStrainChange(index, 'sprouted_count', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    ))}
                    <div className="d-flex gap-2 mt-2">
                        <button type="button" className="btn btn-outline-success btn-sm" onClick={addStrain}>
                            <i className="bi bi-plus-circle"></i> Agregar Variedad
                        </button>
                        {formData.strains.length > 1 && (
                            <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeStrain(formData.strains.length - 1)}>
                                <i className="bi bi-dash-circle"></i> Remover Última
                            </button>
                        )}
                    </div>
                </div>

                {/* Switch de Sustrato */}
                <div className="form-check form-switch mb-3 p-3 border rounded shadow-sm">
                    <input 
                        className="form-check-input ms-0 me-2" 
                        type="checkbox" 
                        checked={isTransplanting}
                        onChange={(e) => setIsTransplanting(e.target.checked)}
                    />
                    <label className="form-check-label"><strong>¿Pasar a tierra ahora?</strong></label>
                </div>

                {isTransplanting && (
                    <div className="row mb-4 border-start border-primary border-4 ps-3">
                        <div className="col-md-8">
                            <label className="form-label">Sustrato disponible</label>
                            <select 
                                className="form-select"
                                onChange={(e) => setFormData({...formData, substrate_id: e.target.value})}
                                required={isTransplanting}
                            >
                                <option value="">Seleccionar...</option>
                                {inventory.filter(p => (p.unit === 'L' || p.unit === 'Kg') && p.stock > 0).map(p => (
                                    <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock}{p.unit})</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Lts. usados</label>
                            <input 
                                type="number" 
                                className="form-control"
                                onChange={(e) => setFormData({...formData, substrate_amount: e.target.value})}
                                required={isTransplanting}
                            />
                        </div>
                    </div>
                )}

                <div className="mb-3">
                    <label className="form-label">Notas</label>
                    <textarea 
                        className="form-control" 
                        rows="2"
                        value={formData.initial_notes}
                        onChange={(e) => setFormData({...formData, initial_notes: e.target.value})}
                        placeholder="Ej: Solo agua por ahora."
                    ></textarea>
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-100">
                    {isTransplanting ? 'Registrar Siembra Completa' : 'Iniciar Germinación (Solo Semillas)'}
                </button>
            </form>
        </div>
    );
};

export default PlantingPage;