import sharedPanelLoader from "./loaders/sharedPanel.loader";
export declare const routes: ({
    path: string;
    element: import("react").JSX.Element;
    children?: undefined;
    id?: undefined;
} | {
    element: import("react").JSX.Element;
    children: ({
        path: string;
        id: string;
        errorElement: import("react").JSX.Element;
        children: ({
            index: boolean;
            id: string;
            element: import("react").JSX.Element;
            path?: undefined;
            loader?: undefined;
            errorElement?: undefined;
        } | {
            path: string;
            id: string;
            element: import("react").JSX.Element;
            index?: undefined;
            loader?: undefined;
            errorElement?: undefined;
        } | {
            path: string;
            id: string;
            loader: ({ params, }: import("react-router-dom").LoaderFunctionArgs) => Promise<import("./loaders/panel.loader").PanelLoaderData>;
            element: import("react").JSX.Element;
            errorElement: import("react").JSX.Element;
            index?: undefined;
        })[];
        loader?: undefined;
        element?: undefined;
    } | {
        path: string;
        id: string;
        loader: typeof sharedPanelLoader;
        element: import("react").JSX.Element;
        errorElement: import("react").JSX.Element;
        children?: undefined;
    })[];
    path?: undefined;
    id?: undefined;
} | {
    path: string;
    id: string;
    element: import("react").JSX.Element;
    children?: undefined;
})[];
