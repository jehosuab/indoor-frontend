import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Swal from 'sweetalert2';
import { Card, Button, Form, Row, Col, Badge } from 'react-bootstrap';

const WateringPage = () => {
    const [lots, setLots] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wateringData, setWateringData] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [lotsRes, productsRes] = await Promise.all([
                api.get('/lots'),
                api.get('/products')
            ]);

            // Filtrar solo lotes activos
            const activeLots = lotsRes.data.filter(lot => lot.status === 'active');
            setLots(activeLots);
            setProducts(productsRes.data);

            // Inicializar datos de riego para cada lote
            const initialData = {};
            activeLots.forEach(lot => {
                initialData[lot.id] = {
                    water_amount: '',
                    use_fertilizer: false,
                    fertilizer_id: '',
                    fertilizer_amount: '',
                    notes: ''
                };
            });
            setWateringData(initialData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWateringChange = (lotId, field, value) => {
        setWateringData(prev => ({
            ...prev,
            [lotId]: {
                ...prev[lotId],
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const eventsToCreate = [];

            // Procesar cada lote que tenga datos de riego
            Object.entries(wateringData).forEach(([lotId, data]) => {
                if (data.water_amount && parseFloat(data.water_amount) > 0) {
                    // Evento de riego básico
                    eventsToCreate.push({
                        type: 'riego',
                        description: `Riego: ${data.water_amount}L${data.notes ? ` - ${data.notes}` : ''}`,
                        lot_id: parseInt(lotId),
                        product_id: null,
                        quantity: parseFloat(data.water_amount),
                        notes: data.notes
                    });

                    // Si se usó fertilizante
                    if (data.use_fertilizer && data.fertilizer_id && data.fertilizer_amount) {
                        eventsToCreate.push({
                            type: 'riego',
                            description: `Fertilizante aplicado: ${data.fertilizer_amount}${products.find(p => p.id == data.fertilizer_id)?.unit || 'u'}`,
                            lot_id: parseInt(lotId),
                            product_id: parseInt(data.fertilizer_id),
                            quantity: parseFloat(data.fertilizer_amount),
                            notes: `Aplicado durante riego - ${data.notes || ''}`
                        });
                    }
                }
            });

            if (eventsToCreate.length === 0) {
                Swal.fire({
                    title: 'Sin datos',
                    text: 'No hay datos de riego para registrar.',
                    icon: 'warning'
                });
                return;
            }

            // Crear todos los eventos
            await Promise.all(eventsToCreate.map(event =>
                api.post('/events', event)
            ));

            await Swal.fire({
                title: 'Riego registrado',
                text: `Se registraron ${eventsToCreate.length} eventos de riego.`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            window.location.reload();

        } catch (error) {
            console.error('Error al registrar riego:', error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Error al registrar el riego',
                icon: 'error'
            });
        }
    };

    if (loading) return <div className="text-center mt-5">Cargando datos...</div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4">💧 Registro de Riego</h2>

            <Form onSubmit={handleSubmit}>
                {lots.length === 0 ? (
                    <Card className="text-center p-4">
                        <Card.Body>
                            <p className="text-muted">No hay lotes activos para regar.</p>
                        </Card.Body>
                    </Card>
                ) : (
                    lots.map(lot => (
                        <Card key={lot.id} className="mb-4 shadow-sm">
                            <Card.Header className="bg-info text-white">
                                <h5 className="mb-0">🌱 {lot.name}</h5>
                                <small>Estado: <Badge bg="success">Activo</Badge></small>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>💧 Cantidad de Agua (L)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                placeholder="Ej: 2.5"
                                                value={wateringData[lot.id]?.water_amount || ''}
                                                onChange={(e) => handleWateringChange(lot.id, 'water_amount', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Notas</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={2}
                                                placeholder="Observaciones del riego..."
                                                value={wateringData[lot.id]?.notes || ''}
                                                onChange={(e) => handleWateringChange(lot.id, 'notes', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Check
                                    type="checkbox"
                                    label="🧪 Aplicar fertilizante"
                                    checked={wateringData[lot.id]?.use_fertilizer || false}
                                    onChange={(e) => handleWateringChange(lot.id, 'use_fertilizer', e.target.checked)}
                                    className="mb-3"
                                />

                                {wateringData[lot.id]?.use_fertilizer && (
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Fertilizante</Form.Label>
                                                <Form.Select
                                                    value={wateringData[lot.id]?.fertilizer_id || ''}
                                                    onChange={(e) => handleWateringChange(lot.id, 'fertilizer_id', e.target.value)}
                                                >
                                                    <option value="">Seleccionar fertilizante...</option>
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
                                                <Form.Label>Cantidad ({products.find(p => p.id == wateringData[lot.id]?.fertilizer_id)?.unit || 'u'})</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="Ej: 5.0"
                                                    value={wateringData[lot.id]?.fertilizer_amount || ''}
                                                    onChange={(e) => handleWateringChange(lot.id, 'fertilizer_amount', e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                )}
                            </Card.Body>
                        </Card>
                    ))
                )}

                {lots.length > 0 && (
                    <div className="text-center mt-4">
                        <Button type="submit" variant="primary" size="lg">
                            💧 Registrar Riego
                        </Button>
                    </div>
                )}
            </Form>
        </div>
    );
};

export default WateringPage;