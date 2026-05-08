import { Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const actions = [
    { title: 'Cargar Siembra', icon: '🌱', color: 'success', path: '/siembra' },
    { title: 'Cargar Riego', icon: '💧', color: 'info', path: '/riego' },
    { title: 'Preventivos', icon: '🛡️', color: 'warning', path: '/preventivos' },
    { title: 'Cargar Evento', icon: '📅', color: 'secondary', path: '/evento' },
    { title: 'Registrar Cosecha', icon: '🌿', color: 'success', path: '/cosecha' },
  ];

  return (
    <div>
      <h2 className="fw-bold mb-4">Panel de Control</h2>
      
      <Row className="g-4 justify-content-center">
        {actions.map((action, idx) => (
          <Col key={idx} xs={12} sm={6} lg={3}>
            {/* Agregamos el onClick en la Card para que toda la zona sea clickeable */}
            <Card 
              className="text-center border-0 shadow-sm h-100 hover-card" 
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(action.path)}
            >
              <Card.Body className="d-flex flex-column align-items-center justify-content-center py-4">
                <span style={{ fontSize: '2.5rem' }} className="mb-2">{action.icon}</span>
                <Card.Title className="fw-bold">{action.title}</Card.Title>
                <Button 
                  variant={`outline-${action.color}`} 
                  size="sm" 
                  className="mt-2 stretched-link"
                >
                  Acceder
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Espacio para el Estado Actual */}
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