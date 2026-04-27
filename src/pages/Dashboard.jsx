import { Row, Col, Card, Button } from 'react-bootstrap';

const Dashboard = () => {
  const actions = [
    { title: 'Cargar Riego', icon: '💧', color: 'info' },
    { title: 'Cargar Siembra', icon: '🌱', color: 'success' },
    { title: 'Preventivos', icon: '🛡️', color: 'warning' },
  ];

  return (
    <div>
      <h2 className="fw-bold mb-4">Panel de Control</h2>
      
      {/* Tarjetas de Acceso Rápido */}
      <Row className="g-4 justify-content-center">
        {actions.map((action, idx) => (
          <Col key={idx} xs={12} sm={6} lg={3}>
            <Card className="text-center border-0 shadow-sm h-100 hover-card">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center py-4">
                <span style={{ fontSize: '2.5rem' }} className="mb-2">{action.icon}</span>
                <Card.Title className="fw-bold">{action.title}</Card.Title>
                <Button variant={`outline-${action.color}`} size="sm" className="mt-2 stretched-link">
                  Acceder
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Espacio para el Estado Actual (Próximamente) */}
      <Row className="mt-5">
        <Col>
          <Card className="bg-dark text-white border-0 shadow">
            <Card.Body className="p-4">
              <h5>Estado del Cultivo</h5>
              <p className="text-white-50">No hay ciclos activos seleccionados.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;