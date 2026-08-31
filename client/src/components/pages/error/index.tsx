import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export default function ErrorPage() {
  let error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.statusText} - {error.status}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <>
        <div>
          <h1>Error - {error.name}</h1>
          <p>{error.message}</p>
        </div>
        <div>
          <p>El stack es el siguiente:</p>
          <p>{error.stack}</p>
        </div>
      </>
    );
  } else {
    return (
      <>
        <h1>Unkown Error</h1>
      </>
    );
  }
}
