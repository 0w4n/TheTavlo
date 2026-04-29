import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./breadcrumb.css";
import useGlobalContext from "#core/globalContext/hooks/useGlobalContext";
import { firebaseService } from "#shared/infraestructure/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function BreadCrumb() {
  const location = useLocation();
  const { state } = useGlobalContext();
  const db = firebaseService.firestore;

  const [pathSegments, setPathSegments] = useState<string[]>([]);

  useEffect(() => {
    const fetchSegments = async () => {
      const segments = location.pathname.split("/").filter(Boolean);

      const names = await Promise.all(
        segments.map(async (segment) => {
          if (segment === "home") return "~";

          try {
            const panelRef = doc(
              db,
              "users",
              state.user.userId,
              "panels",
              segment
            );

            const panelSnap = await getDoc(panelRef);

            if (panelSnap.exists()) {
              return panelSnap.data().name;
            } else {
              return segment; // fallback
            }
          } catch (error) {
            console.error(error);
            return segment;
          }
        }),
      );

      setPathSegments(names);
    };

    if (state?.user?.userId) {
      fetchSegments();
    }
  }, [location.pathname, state.user.userId, db]);

  return (
    <div className="breadcrumb">
      {pathSegments.map((segment, index) => (
        <div key={index} className="breadcrumb__segment">
          <span>{segment}</span>
          <span>/</span>
        </div>
      ))}
    </div>
  );
}
