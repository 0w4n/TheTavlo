import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import useAuth from "../core/auth/presentation/hooks/useAuth";
import { useState } from "react";
export default function MigrationDialog() {
    const { state, completeMigration } = useAuth();
    const [loading, setLoading] = useState(false);
    if (state.status !== "migration-pending" || !state.migrationData) {
        return null;
    }
    const handleMigration = async (strategy) => {
        setLoading(true);
        try {
            await completeMigration(strategy);
        }
        catch (error) {
            console.error("Error en migración:", error);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { style: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
        }, children: _jsxs("div", { style: {
                background: "white",
                padding: "2rem",
                borderRadius: "8px",
                maxWidth: "500px",
            }, children: [_jsx("h2", { children: "\u00A1Ya tienes una cuenta con Google!" }), _jsx("p", { children: "Detectamos que ya ten\u00EDas datos en tu cuenta de Google." }), _jsx("p", { children: "\u00BFQu\u00E9 quieres hacer con tus datos de invitado?" }), _jsxs("div", { style: {
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                        marginTop: "1.5rem",
                    }, children: [_jsxs("button", { onClick: () => handleMigration("merge"), disabled: loading, style: { padding: "1rem" }, children: ["\uD83D\uDCE6 Combinar todo", _jsx("div", { style: { fontSize: "0.85rem", opacity: 0.7 }, children: "Mantener ambos conjuntos de datos" })] }), _jsxs("button", { onClick: () => handleMigration("keep-separate"), disabled: loading, style: { padding: "1rem" }, children: ["\uD83D\uDDD1\uFE0F Descartar datos de invitado", _jsx("div", { style: { fontSize: "0.85rem", opacity: 0.7 }, children: "Mantener solo los datos de Google" })] }), _jsxs("button", { onClick: () => handleMigration("move"), disabled: loading, style: { padding: "1rem", opacity: 0.6 }, children: ["\u26A0\uFE0F Reemplazar con datos de invitado", _jsx("div", { style: { fontSize: "0.85rem", opacity: 0.7 }, children: "Perder\u00E1s tus datos actuales de Google" })] })] })] }) }));
}
