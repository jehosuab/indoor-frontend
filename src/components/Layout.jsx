import { Container, Row, Col, Nav, Navbar } from 'react-bootstrap';
import { NavLink } from 'react-router-dom'; // Cambiamos Link por NavLink
import "./Layout.css";

const Layout = ({ children }) => {
  return (
    <Container fluid className="vh-100 p-0">
      <Row className="g-0 h-100">
        {/* Sidebar Fijo */}
        <Col md={2} className="bg-dark text-white p-3 d-none d-md-block shadow">
          <div className="d-flex align-items-center mb-4 ps-2">
            <i className="bi bi-leaf text-success me-2 fs-4"></i> {/* Icono de plantita */}
            <span className="fs-4 fw-bold text-success">Indoor</span>
            <span className="fs-4 fw-light text-white-50">App</span>
          </div>
          
          <Nav className="flex-column gap-2 sidebar-nav">
            <Nav.Link as={NavLink} to="/" end className="text-white-50 p-2 rounded">
              🏠 Dashboard
            </Nav.Link>
            {/* Usamos /inventario para que coincida con lo que armamos */}
            <Nav.Link as={NavLink} to="/inventario" className="text-white-50 p-2 rounded">
              📦 Inventario
            </Nav.Link>
            {/* Usamos /bitacora para los registros */}
            <Nav.Link as={NavLink} to="/bitacora" className="text-white-50 p-2 rounded">
              📝 Bitácora
            </Nav.Link>
          </Nav>
        </Col>

        {/* Área de Contenido */}
        <Col md={10} className="bg-light d-flex flex-column">
          <Navbar bg="white" className="border-bottom px-4 py-3 sticky-top">
            {/* El nombre solo se ve en móviles */}
            <Navbar.Brand as={NavLink} to="/" className="d-md-none text-success fw-bold">
               🌿 Indoor App
            </Navbar.Brand>
            
            <div className="ms-auto d-flex align-items-center">
              <i className="bi bi-geo-alt text-muted me-1"></i>
              <small className="text-muted me-3">Monte Grande, AR</small>
              <div className="bg-success rounded-circle d-flex align-items-center justify-content-center text-white" style={{width: 32, height: 32}}>
                <i className="bi bi-person"></i>
              </div>
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