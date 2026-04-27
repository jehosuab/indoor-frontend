import { ListGroup, Card } from 'react-bootstrap';

const Logs = () => {
  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        <h3 className="mb-4">Historial de Actividades</h3>
        <ListGroup variant="flush">
          <ListGroup.Item className="py-3 text-muted italic">
            Aquí aparecerán los registros de riegos y siembras...
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default Logs;