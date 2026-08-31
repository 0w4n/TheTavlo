import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React from "react";
export default function ComposeProviders({ providers, children, }) {
    return (_jsx(_Fragment, { children: providers.reduceRight((child, parent) => {
            return React.cloneElement(parent, {}, child);
        }, children) }));
}
