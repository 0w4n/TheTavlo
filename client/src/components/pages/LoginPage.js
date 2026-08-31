import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import useAuth from "../../core/auth/presentation/hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "#components/atoms/button";
import { useDocumentTitle } from "#core/routing/useDocumentTitle";
import { safeReturnTo, withReturnTo } from "#core/routing/returnTo";
import OnboardingPage from "#features/onBoarding/components/pages/OnboardingPage";
import "./LoginPage.css";
export default function LoginPage() {
    useDocumentTitle("Iniciar sesión");
    const { state } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnTo = safeReturnTo(searchParams.get("returnTo"));
    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            navigate(withReturnTo("/login?onBoarding", returnTo), { replace: true });
        }
        catch (error) {
            console.error("Error al iniciar sesión con Google:", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleGuestSignIn = async () => {
        setIsLoading(true);
        try {
            navigate(withReturnTo("/login?onBoarding", returnTo), { replace: true });
        }
        catch (error) {
            throw new Error(error);
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        if (state.status === "authenticated") {
            navigate(returnTo ?? "/home", { replace: true });
        }
    });
    // /login?onBoarding — mismo login, pero guiado. Ver OnboardingPage.tsx.
    if (searchParams.has("onBoarding")) {
        return _jsx(OnboardingPage, {});
    }
    return (_jsxs("div", { className: "loginPage__card", children: [_jsxs("div", { className: "loginPage__card-header", children: [_jsx("h1", { children: "Organizalo. Hazlo. Logralo." }), _jsx("i", { children: "Inicia sesi\u00F3n en TheTavlo" })] }), state.status === "error" && (_jsx("div", { className: "loginPage__card-error", children: state.error })), _jsxs("div", { className: "loginPage__card-content", children: [_jsx(Button, { className: "loginPage__card-content-item", variant: "secondary", onClick: handleGoogleSignIn, icon: "IconBrandGoogleFilled", label: "Entrar con Google", disabled: isLoading || state.status === "initializing" }), _jsx(Button, { className: "loginPage__card-content-item", variant: "secondary", onClick: handleGuestSignIn, icon: "IconSpy", label: "Entrar como Invitado", disabled: isLoading || state.status === "initializing" })] }), _jsx("footer", { children: _jsxs("span", { children: ["Para crear una cuenta es ", _jsx("strong", { children: "aqu\u00ED tambi\u00E9n" }), "."] }) })] }));
}
