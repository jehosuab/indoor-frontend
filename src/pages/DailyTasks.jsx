import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Card, Table, Badge, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const DailyTasks = () => {
  const [lots, setLots] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  // Tabla de referencia Grotek Megapack
  const grokekSchedule = [
    { component: 'Solo-Tek Grow', siembra: '0.5ml', transplante: '1ml', vegetativo: '2ml', prefloracion: '2ml', semana1: '-', semana2: '-', semana3: '-', semana4: '-', semana5: '-', semana6: '-', semana7: '-', semana8: '-' },
    { component: 'Solo-Tek Bloom', siembra: '-', transplante: '-', vegetativo: '-', prefloracion: '-', semana1: '2ml', semana2: '2ml', semana3: '2ml', semana4: '2ml', semana5: '2ml', semana6: '2ml', semana7: '2ml', semana8: '-' },
    { component: 'Vitamax Pro', siembra: '4ml', transplante: '4ml', vegetativo: '4ml', prefloracion: '4ml', semana1: '4ml', semana2: '4ml', semana3: '4ml', semana4: '4ml', semana5: '4ml', semana6: '4ml', semana7: '4ml', semana8: '-' },
    { component: 'Monster Grow Pro', siembra: '-', transplante: '-', vegetativo: '0.10g', prefloracion: '0.10g', semana1: '-', semana2: '-', semana3: '-', semana4: '-', semana5: '-', semana6: '-', semana7: '-', semana8: '-' },
    { component: 'Bud Fuel Pro', siembra: '-', transplante: '-', vegetativo: '-', prefloracion: '1ml', semana1: '2ml', semana2: '2ml', semana3: '2ml', semana4: '1ml', semana5: '-', semana6: '-', semana7: '-', semana8: '-' },
    { component: 'Blossom Blaster', siembra: '-', transplante: '-', vegetativo: '-', prefloracion: '-', semana1: '1ml', semana2: '1ml', semana3: '1ml', semana4: '-', semana5: '-', semana6: '-', semana7: '-', semana8: '-' },
    { component: 'Heavy Bud Pro', siembra: '-', transplante: '-', vegetativo: '-', prefloracion: '-', semana1: '-', semana2: '-', semana3: '-', semana4: '1ml', semana5: '3ml', semana6: '3ml', semana7: '2ml', semana8: '-' },
    { component: 'Monster Bloom', siembra: '-', transplante: '-', vegetativo: '-', prefloracion: '-', semana1: '-', semana2: '-', semana3: '-', semana4: '0.10g', semana5: '0.20g', semana6: '0.10g', semana7: '0.10g', semana8: '-' },
    { component: 'Final Flush', siembra: '-', transplante: '-', vegetativo: '-', prefloracion: '-', semana1: '-', semana2: '-', semana3: '-', semana4: '-', semana5: '-', semana6: '-', semana7: '-', semana8: '2ml' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [lotsRes, eventsRes] = await Promise.all([
        api.get('/lots'),
        api.get('/events')
      ]);
      setLots(lotsRes.data.filter(lot => lot.status === 'active'));
      setEvents(eventsRes.data);
      calculateSuggestions(lotsRes.data.filter(lot => lot.status === 'active'), eventsRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSuggestions = (allLots, allEvents) => {
    const newSuggestions = [];
    const now = new Date();

    allLots.forEach(lot => {
      const lotEvents = allEvents.filter(e => e.lot_id === lot.id);
      const daysOld = Math.floor((now - new Date(lot.start_date)) / (1000 * 60 * 60 * 24));

      // 1. Sugerir riego (cada 2 días)
      const lastRiego = lotEvents.filter(e => e.type === 'riego').sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      if (!lastRiego || (now - new Date(lastRiego.created_at)) > 2 * 24 * 60 * 60 * 1000) {
        newSuggestions.push({
          id: `riego-${lot.id}`,
          type: 'riego',
          lotId: lot.id,
          lotName: lot.name,
          message: `Riego sugerido para ${lot.name}`,
          priority: 'high',
          action: () => navigate('/riego', { state: { lotId: lot.id } })
        });
      }

      // 2. Sugerir fertilizantes según fase
      const phase = getPlantPhase(daysOld);
      if (phase && !lastRiego?.description?.includes('fertilizante')) {
        const phaseKey = getPhaseKey(phase);
        const recommendedFerts = grokekSchedule.filter(item => item[phaseKey] !== '-');
        if (recommendedFerts.length > 0) {
          newSuggestions.push({
            id: `fert-${lot.id}`,
            type: 'fertilizante',
            lotId: lot.id,
            lotName: lot.name,
            message: `Aplicar fertilizantes recomendados en fase ${phase} para ${lot.name}`,
            priority: 'medium',
            details: recommendedFerts.map(f => `${f.component}: ${f[phaseKey]}`).join(', ')
          });
        }
      }

      // 3. Sugerir preventivos segunda vuelta (10 días después)
      const lastPreventivo = lotEvents.filter(e => e.type === 'preventivo').sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      if (lastPreventivo && (now - new Date(lastPreventivo.created_at)) > 10 * 24 * 60 * 60 * 1000) {
        newSuggestions.push({
          id: `prev-${lot.id}`,
          type: 'preventivo',
          lotId: lot.id,
          lotName: lot.name,
          message: `Segunda aplicación de preventivo sugerida para ${lot.name}`,
          priority: 'medium',
          action: () => navigate('/preventivos', { state: { lotId: lot.id } })
        });
      }

      // 4. Sugerir revisión de plantas macho (48 horas después de detectar)
      const maleDetection = lotEvents.find(e => e.description?.includes('planta macho'));
      if (maleDetection && (now - new Date(maleDetection.created_at)) > 2 * 24 * 60 * 60 * 1000) {
        newSuggestions.push({
          id: `male-${lot.id}`,
          type: 'macho',
          lotId: lot.id,
          lotName: lot.name,
          message: `Revisar y registrar estado de plantas macho en ${lot.name}`,
          priority: 'high'
        });
      }
    });

    setSuggestions(newSuggestions);
  };

  const getPlantPhase = (daysOld) => {
    if (daysOld < 7) return 'Siembra';
    if (daysOld < 21) return 'Transplante';
    if (daysOld < 35) return 'Vegetativo';
    if (daysOld < 42) return 'Prefloracion';
    if (daysOld < 49) return 'Semana 1';
    if (daysOld < 56) return 'Semana 2';
    if (daysOld < 63) return 'Semana 3';
    if (daysOld < 70) return 'Semana 4';
    if (daysOld < 77) return 'Semana 5';
    if (daysOld < 84) return 'Semana 6';
    if (daysOld < 91) return 'Semana 7';
    return 'Semana 8';
  };

  const getPhaseKey = (phase) => {
    const phaseMap = {
      'Siembra': 'siembra',
      'Transplante': 'transplante',
      'Vegetativo': 'vegetativo',
      'Prefloracion': 'prefloracion',
      'Semana 1': 'semana1',
      'Semana 2': 'semana2',
      'Semana 3': 'semana3',
      'Semana 4': 'semana4',
      'Semana 5': 'semana5',
      'Semana 6': 'semana6',
      'Semana 7': 'semana7',
      'Semana 8': 'semana8',
    };
    return phaseMap[phase] || 'vegetativo';
  };

  const getPriorityColor = (priority) => {
    return priority === 'high' ? 'danger' : 'warning';
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="success" /></div>;

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">📋 Tareas Diarias</h2>

      {/* Sugerencias activas */}
      {suggestions.length > 0 && (
        <Card className="mb-4 shadow-sm border-left border-danger">
          <Card.Header className="bg-light">
            <h5 className="mb-0">⚡ Sugerencias Activas ({suggestions.length})</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              {suggestions.map(suggestion => (
                <Col md={6} key={suggestion.id} className="mb-3">
                  <Alert variant={getPriorityColor(suggestion.priority)} className="mb-0">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <strong>{suggestion.message}</strong>
                        {suggestion.details && (
                          <div className="small mt-1">{suggestion.details}</div>
                        )}
                      </div>
                      {suggestion.action && (
                        <Button
                          size="sm"
                          variant={getPriorityColor(suggestion.priority)}
                          onClick={suggestion.action}
                          className="ms-2"
                        >
                          Ir
                        </Button>
                      )}
                    </div>
                  </Alert>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Tabla de referencia */}
      <Card className="shadow-sm">
        <Card.Header className="bg-light">
          <h5 className="mb-0">📊 Calendario de Riego - Grotek Megapack</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Componente</th>
                  <th>Siembra</th>
                  <th>Transplante</th>
                  <th>Vegetativo</th>
                  <th>Prefloracion</th>
                  <th>Semana 1</th>
                  <th>Semana 2</th>
                  <th>Semana 3</th>
                  <th>Semana 4</th>
                  <th>Semana 5</th>
                  <th>Semana 6</th>
                  <th>Semana 7</th>
                  <th>Semana 8</th>
                </tr>
              </thead>
              <tbody>
                {grokekSchedule.map((row, idx) => (
                  <tr key={idx}>
                    <td className="fw-bold">{row.component}</td>
                    <td>{row.siembra}</td>
                    <td>{row.transplante}</td>
                    <td>{row.vegetativo}</td>
                    <td>{row.prefloracion}</td>
                    <td>{row.semana1}</td>
                    <td>{row.semana2}</td>
                    <td>{row.semana3}</td>
                    <td>{row.semana4}</td>
                    <td>{row.semana5}</td>
                    <td>{row.semana6}</td>
                    <td>{row.semana7}</td>
                    <td>{row.semana8}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <div className="mt-3 text-muted small">
        <p><strong>Notas:</strong> Las sugerencias se actualizan automáticamente basadas en los eventos registrados. "-" indica que el componente no se aplica en esa fase.</p>
      </div>
    </div>
  );
};

export default DailyTasks;
