import { Container, Row, Col, Nav, Navbar, Offcanvas, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom'; // Cambiamos Link por NavLink
import { useState } from 'react';
import "./Layout.css";

const Layout = ({ children }) => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const handleClose = () => setShowOffcanvas(false);
  const handleShow = () => setShowOffcanvas(true);

  const navItems = [
    { to: '/', label: '🏠 Dashboard', end: true },
    { to: '/inventario', label: '📦 Inventario', end: false },
    { to: '/bitacora', label: '📝 Bitácora', end: false },
    { to: '/tareas-diarias', label: '📋 Tareas Diarias', end: false },
    { to: '/estado-lotes', label: '📊 Estado de Lotes', end: false }
  ];

  return (
    <Container fluid className="vh-100 p-0">
      <Row className="g-0 h-100">
        {/* Sidebar Fijo - Desktop */}
        <Col md={2} className="bg-dark text-white p-3 d-none d-md-block shadow">
          <div className="d-flex align-items-center mb-4 ps-2">
            <i className="bi bi-leaf text-success me-2 fs-4"></i>
            <span className="fs-4 fw-bold text-success">Indoor</span>
            <span className="fs-4 fw-light text-white-50">App</span>
          </div>
          
          <Nav className="flex-column gap-2 sidebar-nav">
            {navItems.map(item => (
              <Nav.Link 
                key={item.to}
                as={NavLink} 
                to={item.to} 
                end={item.end}
                className="text-white-50 p-2 rounded"
              >
                {item.label}
              </Nav.Link>
            ))}
          </Nav>
        </Col>

        {/* Menú Offcanvas - Mobile */}
        <Offcanvas show={showOffcanvas} onHide={handleClose} placement="start" className="bg-dark text-white">
          <Offcanvas.Header closeButton closeVariant="white" className="border-bottom border-secondary">
            <Offcanvas.Title>
              <div className="d-flex align-items-center">
                <i className="bi bi-leaf text-success me-2 fs-4"></i>
                <span className="fs-5 fw-bold text-success">Indoor</span>
                <span className="fs-5 fw-light text-white-50 ms-1">App</span>
              </div>
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-0">
            <Nav className="flex-column gap-2 p-3 sidebar-nav">
              {navItems.map(item => (
                <Nav.Link 
                  key={item.to}
                  as={NavLink} 
                  to={item.to} 
                  end={item.end}
                  className="text-white-50 p-2 rounded"
                  onClick={handleClose}
                >
                  {item.label}
                </Nav.Link>
              ))}
            </Nav>
          </Offcanvas.Body>
        </Offcanvas>

        {/* Área de Contenido */}
        <Col md={10} className="bg-light d-flex flex-column">
          <Navbar bg="white" className="border-bottom px-4 py-3 sticky-top">
            {/* Botón Hamburguesa - Solo en móviles */}
            <Button 
              variant="link" 
              className="d-md-none text-success p-0 border-0"
              onClick={handleShow}
              style={{ fontSize: '1.5rem' }}
            >
              <i className="bi bi-list"></i>
            </Button>

            {/* El nombre solo se ve en móviles */}
            <Navbar.Brand as={NavLink} to="/" className="d-md-none text-success fw-bold ms-2">
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