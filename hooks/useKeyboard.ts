import { useEffect, useMemo, useState } from "react";

type Keys = {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    interact: boolean; // "pressed this frame" style
};

export function useKeyboard() {
    const [down, setDown] = useState({
        KeyW: false,
        KeyA: false,
        KeyS: false,
        KeyD: false,
    });

    // "just pressed" E (one-shot)
    const [interactPulse, setInteractPulse] = useState(false);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.code in down) setDown((p) => ({ ...p, [e.code]: true }));

            if (e.code === "KeyE") {
                // pulse true for 1 tick
                setInteractPulse(true);
            }
        };

        const onKeyUp = (e: KeyboardEvent) => {
            if (e.code in down) setDown((p) => ({ ...p, [e.code]: false }));
        };

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // reset interactPulse immediately after it’s been read once
    useEffect(() => {
        if (!interactPulse) return;
        const t = window.setTimeout(() => setInteractPulse(false), 0);
        return () => window.clearTimeout(t);
    }, [interactPulse]);

    const keys: Keys = useMemo(
        () => ({
            forward: down.KeyW,
            backward: down.KeyS,
            left: down.KeyA,
            right: down.KeyD,
            interact: interactPulse,
        }),
        [down, interactPulse]
    );

    return keys;
}
