import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Badge, Container, Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';
import "./Logbook.css"; 

const Logbook = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('https://indoor-backend.test/api/events');
      setEvents(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar eventos:", error);
      setLoading(false);
    }
  };

  // Función para devolver un icono y color según el tipo de evento
  const getEventStyle = (type) => {
    switch (type) {
      case 'stock': return { icon: 'bi-box-seam', color: 'text-primary', bg: 'bg-primary' };
      case 'peste': return { icon: 'bi-bug', color: 'text-danger', bg: 'bg-danger' };
      case 'riego': return { icon: 'bi-droplet', color: 'text-info', bg: 'bg-info' };
      default: return { icon: 'bi-journal-text', color: 'text-success', bg: 'bg-success' };
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="success" /></div>;

  return (
    <Container className="py-4">
      <h2 className="mb-4 d-flex align-items-center">
        <i className="bi bi-journal-richtext me-2 text-success"></i> Bitácora de Cultivo
      </h2>

      <div className="timeline-container">
        {events.length === 0 ? (
          <p className="text-muted text-center">No hay registros todavía. ¡Empezá a documentar tu indoor!</p>
        ) : (
          events.map((event) => {
            const style = getEventStyle(event.type);
            return (
              <Card key={event.id} className="mb-3 border-0 shadow-sm border-start border-4" style={{ borderColor: `var(--bs-${style.color.split('-')[1]}) !important` }}>
                <Card.Body className="d-flex align-items-start">
                  <div className={`rounded-circle ${style.bg} bg-opacity-10 p-3 me-3`}>
                    <i className={`bi ${style.icon} ${style.color} fs-4`}></i>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <Badge pill className={`${style.bg} mb-2 text-capitalize`}>
                        {event.type}
                      </Badge>
                      <small className="text-muted">
                        {new Date(event.created_at).toLocaleString('es-AR')}
                      </small>
                    </div>
                    <p className="mb-1 text-dark">{event.description}</p>
                    {event.product && (
                      <small className="text-muted italic">
                        <i className="bi bi-tag me-1"></i>
                        Relacionado con: <strong>{event.product.name}</strong>
                      </small>
                    )}
                  </div>
                </Card.Body>
              </Card>
            );
          })
        )}
      </div>
    </Container>
  );
};

export default Logbook;