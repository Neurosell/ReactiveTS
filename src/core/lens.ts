import { ReactiveField } from "./field";
import type { Unsubscribe } from "./disposable";

export type ReactiveLensSource<T> = {
    value: T;
    addListener(fn: () => void): Unsubscribe;
};

function getAtPath(obj: unknown, path: Array<string | number | symbol>): unknown {
    let cursor = obj as any;
    for (const seg of path) {
        cursor = cursor?.[seg as any];
    }
    return cursor;
}

function setAtPath(obj: unknown, path: Array<string | number | symbol>, next: unknown): void {
    if (path.length === 0) return;
    let cursor = obj as any;
    for (let i = 0; i < path.length - 1; i++) {
        cursor = cursor[path[i] as any];
    }
    cursor[path[path.length - 1] as any] = next;
}

/**
 * Focus reactive source into nested value (two-way lens).
 */
export function useLens<TRoot extends object, TValue>(
    source: ReactiveLensSource<TRoot>,
    path: Array<string | number | symbol>
): ReactiveField<TValue> {
    const lens = new ReactiveField<TValue>(getAtPath(source.value, path) as TValue);

    source.addListener(() => {
        const next = getAtPath(source.value, path) as TValue;
        lens.set(next);
    });

    lens.addListener((next) => {
        const current = getAtPath(source.value, path);
        if (Object.is(current, next)) return;
        setAtPath(source.value, path, next);
    });

    return lens;
}
