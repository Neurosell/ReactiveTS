import { ReactiveField, type ReactiveFieldOptions } from "./field";

/**
 * Lightweight atom primitive based on ReactiveField.
 */
export class ReactiveAtom<T> extends ReactiveField<T> {}

/**
 * Create a new atom.
 */
export function useAtom<T>(initial: T, options?: ReactiveFieldOptions<T>): ReactiveAtom<T> {
    return new ReactiveAtom(initial, options);
}
