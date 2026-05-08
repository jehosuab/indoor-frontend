import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Swal from 'sweetalert2';
import { Card, Button, Form, Row, Col } from 'react-bootstrap';

const PreventivePage = () => {
    const [products, setProducts] = useState([]);
    const [lots, setLots] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        type: 'fungicida',
        product_id: '',
        lot_id: '',
        quantity: '',
        description: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, lotsRes] = await Promise.all([
                api.get('/products'),
                api.get('/lots')
            ]);

            setProducts(productsRes.data);
            setLots(lotsRes.data.filter(lot => lot.status === 'active'));
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const selectedProduct = products.find(p => p.id == formData.product_id);

            const eventData = {
                type: 'preventivo',
                description: `${formData.type}: ${selectedProduct?.name || 'Producto'} - ${formData.description}`,
                product_id: parseInt(formData.product_id),
                lot_id: formData.lot_id ? parseInt(formData.lot_id) : null,
                quantity: parseFloat(formData.quantity),
                notes: formData.notes
            };

            await api.post('/events', eventData);

            await Swal.fire({
                title: 'Preventivo registrado',
                text: 'La aplicación preventiva se registró correctamente.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            window.location.reload();

            // Limpiar formulario
            setFormData({
                type: 'fungicida',
                product_id: '',
                lot_id: '',
                quantity: '',
                description: '',
                notes: ''
            });

        } catch (error) {
            console.error('Error al registrar preventivo:', error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Error al registrar el preventivo',
                icon: 'error'
            });
        }
    };

    if (loading) return <div className="text-center mt-5">Cargando datos...</div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4">🛡️ Aplicaciones Preventivas</h2>

            <Card className="shadow-sm">
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>🛡️ Tipo de Aplicación</Form.Label>
                                    <Form.Select
                                        value={formData.type}
                                        onChange={(e) => handleChange('type', e.target.value)}
                                        required
                                    >
                                        <option value="fungicida">Fungicida</option>
                                        <option value="insecticida">Insecticida</option>
                                        <option value="micorriza">Micorriza</option>
                                        <option value="tricoderma">Tricoderma</option>
                                        <option value="otro">Otro</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>🌱 Lote (opcional)</Form.Label>
                                    <Form.Select
                                        value={formData.lot_id}
                                        onChange={(e) => handleChange('lot_id', e.target.value)}
                                    >
                                        <option value="">Aplicación general</option>
                                        {lots.map(lot => (
                                            <option key={lot.id} value={lot.id}>
                                                {lot.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>🧪 Producto Utilizado</Form.Label>
                                    <Form.Select
                                        value={formData.product_id}
                                        onChange={(e) => handleChange('product_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Seleccionar producto...</option>
                                        {products.filter(p => p.unit_type === 'decimal').map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} ({p.brand}) - Stock: {p.stock}{p.unit}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Cantidad ({products.find(p => p.id == formData.product_id)?.unit || 'u'})</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Ej: 2.5"
                                        value={formData.quantity}
                                        onChange={(e) => handleChange('quantity', e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>📝 Descripción de la Aplicación</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Describa la aplicación preventiva..."
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Notas Adicionales</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Observaciones adicionales..."
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                            />
                        </Form.Group>

                        <div className="text-center">
                            <Button type="submit" variant="warning" size="lg">
                                🛡️ Registrar Aplicación Preventiva
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default PreventivePage;