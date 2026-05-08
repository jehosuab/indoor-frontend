import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Swal from 'sweetalert2';
import { Card, Button, Form, Row, Col, Badge } from 'react-bootstrap';

const HarvestPage = () => {
    const [lots, setLots] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        lot_id: '',
        wet_weight: '',
        dry_weight: '',
        notes: ''
    });

    useEffect(() => {
        fetchLots();
    }, []);

    const fetchLots = async () => {
        try {
            const response = await api.get('/lots');
            // Mostrar lotes que tienen plantas (sprouted_count > 0)
            const harvestableLots = response.data.filter(lot =>
                lot.status === 'active' && lot.strains.some(strain => strain.sprouted_count > 0)
            );
            setLots(harvestableLots);
        } catch (error) {
            console.error('Error al cargar lotes:', error);
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
            const selectedLot = lots.find(lot => lot.id == formData.lot_id);

            // Crear evento de cosecha húmeda si se especifica
            if (formData.wet_weight && parseFloat(formData.wet_weight) > 0) {
                await api.post('/events', {
                    type: 'cosecha',
                    description: `Cosecha húmeda: ${formData.wet_weight}g`,
                    lot_id: parseInt(formData.lot_id),
                    product_id: null,
                    quantity: parseFloat(formData.wet_weight),
                    notes: `Cosecha húmeda - ${formData.notes || ''}`
                });
            }

            // Crear evento de cosecha seca si se especifica
            if (formData.dry_weight && parseFloat(formData.dry_weight) > 0) {
                await api.post('/events', {
                    type: 'cosecha',
                    description: `Cosecha seca: ${formData.dry_weight}g`,
                    lot_id: parseInt(formData.lot_id),
                    product_id: null,
                    quantity: parseFloat(formData.dry_weight),
                    notes: `Cosecha seca - ${formData.notes || ''}`
                });
            }

            await Swal.fire({
                title: 'Cosecha registrada',
                text: 'La cosecha se registró correctamente en la bitácora.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            window.location.reload();

            // Limpiar formulario
            setFormData({
                lot_id: '',
                wet_weight: '',
                dry_weight: '',
                notes: ''
            });

        } catch (error) {
            console.error('Error al registrar cosecha:', error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Error al registrar la cosecha',
                icon: 'error'
            });
        }
    };

    if (loading) return <div className="text-center mt-5">Cargando lotes...</div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4">🌿 Registro de Cosecha</h2>

            <Card className="shadow-sm">
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>🌱 Lote a Cosechar</Form.Label>
                            <Form.Select
                                value={formData.lot_id}
                                onChange={(e) => handleChange('lot_id', e.target.value)}
                                required
                            >
                                <option value="">Seleccionar lote...</option>
                                {lots.map(lot => (
                                    <option key={lot.id} value={lot.id}>
                                        {lot.name} - Plantas: {lot.strains.reduce((total, strain) => total + strain.sprouted_count, 0)}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>⚖️ Peso Húmedo (g)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        placeholder="Ej: 150.5"
                                        value={formData.wet_weight}
                                        onChange={(e) => handleChange('wet_weight', e.target.value)}
                                    />
                                    <Form.Text className="text-muted">
                                        Peso inmediatamente después de cortar
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>⚖️ Peso Seco (g)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        placeholder="Ej: 25.3"
                                        value={formData.dry_weight}
                                        onChange={(e) => handleChange('dry_weight', e.target.value)}
                                    />
                                    <Form.Text className="text-muted">
                                        Peso después del proceso de secado
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Notas de la Cosecha</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Observaciones sobre la calidad, maduración, etc..."
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                            />
                        </Form.Group>

                        <div className="text-center">
                            <Button
                                type="submit"
                                variant="success"
                                size="lg"
                                disabled={!formData.wet_weight && !formData.dry_weight}
                            >
                                🌿 Registrar Cosecha
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default HarvestPage;