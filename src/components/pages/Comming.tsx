import Icon from "#shared/ui/atoms/icons";
import { Link } from "react-router-dom";

export default function CommingPage() {
  return (
    <>
      <div>
        <h1>Estamos en ello</h1>
        <Icon name="IconBuilding" />
        <button>
          <Link to="/home" replace/>
        </button>
      </div>
    </>
  );
}
