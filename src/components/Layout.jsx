import { Container, Row, Col, Nav, Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <Container fluid className="vh-100 p-0">
      <Row className="g-0 h-100">
        {/* Sidebar Fijo */}
        <Col md={2} className="bg-dark text-white p-3 d-none d-md-block shadow">
          <div className="d-flex align-items-center mb-4 ps-2">
            <span className="fs-4 fw-bold text-success">Indoor</span>
            <span className="fs-4 fw-light text-white-50">App</span>
          </div>
          
          <Nav className="flex-column gap-2">
            <Nav.Link as={Link} to="/" className="text-white-50 p-2 rounded hover-effect">
              🏠 Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/stock" className="text-white-50 p-2 rounded">
              📦 Stock de Insumos
            </Nav.Link>
            <Nav.Link as={Link} to="/registros" className="text-white-50 p-2 rounded">
              📝 Registros Previos
            </Nav.Link>
          </Nav>
        </Col>

        {/* Área de Contenido */}
        <Col md={10} className="bg-light d-flex flex-column">
          <Navbar bg="white" className="border-bottom px-4 py-3">
            <Navbar.Brand className="d-md-none text-success fw-bold">Indoor App</Navbar.Brand>
            <div className="ms-auto d-flex align-items-center">
              <small className="text-muted me-3">Monte Grande, AR</small>
              <div className="bg-success rounded-circle" style={{width: 32, height: 32}}></div>
            </div>
          </Navbar>
          
          <main className="p-4 overflow-auto">
            {children}
          </main>
        </Col>
      </Row>
    </Container>
  );
};

export default Layout;