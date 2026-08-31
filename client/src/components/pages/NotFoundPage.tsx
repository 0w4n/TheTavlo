import { Link } from "react-router-dom";

/**
 * 404 real. Antes el catch-all "*" de las rutas devolvía <CommingPage/>
 * ("En construcción"), que semánticamente es para features futuras, no para
 * URLs que no existen. Ahora cada una tiene su propio componente.
 */
export default function NotFoundPage() {
  return (
    <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
      <h1>404</h1>
      <p>La página que buscás no existe.</p>
      <Link to="/home">Volver al inicio</Link>
    </div>
  );
}
