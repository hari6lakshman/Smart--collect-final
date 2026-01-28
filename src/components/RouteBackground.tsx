"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function RouteBackground() {
    const pathname = usePathname();

    useEffect(() => {
        // The "start page" is the root path "/"
        if (pathname === "/" || pathname === "") {
            document.body.classList.remove("app-bg");
        } else {
            document.body.classList.add("app-bg");
        }
    }, [pathname]);

    return null;
}
