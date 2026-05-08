import React, { useState } from 'react';
import api from '../api/axiosConfig';
import Swal from 'sweetalert2';
import { Card, Button, Form } from 'react-bootstrap';

const EventPage = () => {
    const [formData, setFormData] = useState({
        type: 'general',
        description: '',
        notes: ''
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const eventData = {
                type: formData.type === 'general' ? 'evento' : formData.type,
                description: `${formData.type}: ${formData.description}`,
                notes: formData.notes
            };

            await api.post('/events', eventData);

            await Swal.fire({
                title: 'Evento registrado',
                text: 'El evento se registró correctamente en la bitácora.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            window.location.reload();

            // Limpiar formulario
            setFormData({
                type: 'general',
                description: '',
                notes: ''
            });

        } catch (error) {
            console.error('Error al registrar evento:', error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Error al registrar el evento',
                icon: 'error'
            });
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">📅 Registro de Eventos</h2>

            <Card className="shadow-sm">
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>🏷️ Tipo de Evento</Form.Label>
                            <Form.Select
                                value={formData.type}
                                onChange={(e) => handleChange('type', e.target.value)}
                                required
                            >
                                <option value="general">General</option>
                                <option value="accidente">Accidente</option>
                                <option value="plaga">Plaga Detectada</option>
                                <option value="perdida">Pérdida de Material</option>
                                <option value="mantenimiento">Mantenimiento</option>
                                <option value="otro">Otro</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>📝 Descripción del Evento</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Describa lo que sucedió..."
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
                                placeholder="Detalles adicionales..."
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                            />
                        </Form.Group>

                        <div className="text-center">
                            <Button type="submit" variant="secondary" size="lg">
                                📅 Registrar Evento
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default EventPage;