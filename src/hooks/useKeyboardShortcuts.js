import { useEffect } from "react";

const IGNORED_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

export function useKeyboardShortcuts(keyMap, enabled = true) {
    useEffect(() => {
        if (!enabled) return;

        const handler = (e) => {
            const tag = document.activeElement?.tagName;
            if (IGNORED_TAGS.has(tag) || document.activeElement?.isContentEditable) return;

            const key = e.key.toLowerCase();
            if (keyMap[key]) {
                e.preventDefault();
                keyMap[key](e);
            }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [keyMap, enabled]);
}
