import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Card, Table, Badge, Spinner, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';

const LotStatusPage = () => {
    const [lots, setLots] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [lotsResponse, eventsResponse] = await Promise.all([
                api.get('/lots'),
                api.get('/events')
            ]);

            setLots(lotsResponse.data);
            setEvents(eventsResponse.data);
        } catch (error) {
            console.error('Error al cargar lotes o eventos:', error);
            Swal.fire({
                title: 'Error de conexión',
                text: 'No se pudieron cargar los lotes o eventos. Revisa que el backend esté corriendo.',
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    };


    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <Badge bg="success">Activo</Badge>;
            case 'harvested':
                return <Badge bg="warning">Cosechado</Badge>;
            case 'archived':
                return <Badge bg="secondary">Archivado</Badge>;
            default:
                return <Badge bg="info">{status}</Badge>;
        }
    };

    const handleDeleteLot = async (lot) => {
        const result = await Swal.fire({
            title: '¿Eliminar lote?',
            text: `¿Seguro que deseas eliminar el lote "${lot.name}"? Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/lots/${lot.id}`);
                Swal.fire({
                    title: 'Eliminado',
                    text: `El lote "${lot.name}" ha sido eliminado.`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                fetchData();
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: error.response?.data?.message || 'Error al eliminar el lote',
                    icon: 'error'
                });
            }
        }
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="success" /></div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4">📊 Estado de Lotes</h2>

            <Card className="shadow-sm">
                <Card.Body>
                    {lots.length === 0 ? (
                        <p className="text-muted text-center">No hay lotes registrados.</p>
                    ) : (
                        <Table responsive hover>
                            <thead className="table-light">
                                <tr>
                                    <th>Lote</th>
                                    <th>Fecha Inicio</th>
                                    <th>Estado</th>
                                    <th>Plantas Sembradas</th>
                                    <th>Plantas Cosechadas</th>
                                    <th>Cosecha Húmeda (g)</th>
                                    <th>Cosecha Seca (g)</th>
                                    <th>Rendimiento (%)</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lots.map(lot => {
                                    const totalPlanted = lot.strains.reduce((total, strain) => total + strain.sprouted_count, 0);
                                    const lotEvents = (lot.events && lot.events.length > 0)
                                        ? lot.events
                                        : events.filter(event => event.lot_id === lot.id);
                                    const harvestEvents = lotEvents.filter(event => event.type === 'cosecha');
                                    const wetHarvest = harvestEvents
                                        .filter(event => /h[úu]meda/i.test(event.description || ''))
                                        .reduce((total, event) => total + (parseFloat(event.quantity) || 0), 0);
                                    const dryHarvest = harvestEvents
                                        .filter(event => /seca/i.test(event.description || ''))
                                        .reduce((total, event) => total + (parseFloat(event.quantity) || 0), 0);
                                    const totalHarvested = harvestEvents.length > 0 ? totalPlanted : 0;
                                    const yieldPercentage = totalPlanted > 0 ? ((dryHarvest / (totalPlanted * 10)) * 100).toFixed(1) : 0;

                                    return (
                                        <tr key={lot.id}>
                                            <td>
                                                <strong>{lot.name}</strong>
                                                {lot.substrate && (
                                                    <div className="small text-muted">
                                                        Sustrato: {lot.substrate.name}
                                                    </div>
                                                )}
                                            </td>
                                            <td>{new Date(lot.start_date).toLocaleDateString()}</td>
                                            <td>{getStatusBadge(lot.status)}</td>
                                            <td className="text-center">
                                                <Badge bg="primary" className="fs-6">
                                                    {totalPlanted}
                                                </Badge>
                                            </td>
                                            <td className="text-center">
                                                <Badge bg="warning" className="fs-6">
                                                    {totalHarvested}
                                                </Badge>
                                            </td>
                                            <td className="text-center">
                                                <span className="fw-bold text-info">
                                                    {wetHarvest.toFixed(1)}g
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <span className="fw-bold text-success">
                                                    {dryHarvest.toFixed(1)}g
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <Badge bg={yieldPercentage > 0 ? "success" : "secondary"} className="fs-6">
                                                    {yieldPercentage}%
                                                </Badge>
                                            </td>
                                            <td className="text-center">
                                                <Button 
                                                    variant="danger" 
                                                    size="sm"
                                                    onClick={() => handleDeleteLot(lot)}
                                                    title="Eliminar lote"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <div className="mt-3 text-muted small">
                <p><strong>Nota:</strong> Los datos de cosecha y rendimiento se calcularán automáticamente desde los eventos registrados en la bitácora.</p>
            </div>
        </div>
    );
};

export default LotStatusPage;