import { ReactiveEvent } from "./event";

export type DevToolsRecord = {
    type: string;
    payload: unknown;
    at: number;
};

/**
 * Minimal built-in devtools event bus.
 */
export class ReactiveDevTools {
    private readonly records: DevToolsRecord[] = [];
    private readonly stream = new ReactiveEvent<DevToolsRecord>();

    public emit(type: string, payload: unknown): void {
        const record: DevToolsRecord = { type, payload, at: Date.now() };
        this.records.push(record);
        this.stream.invoke(record);
    }

    public clear(): void {
        this.records.length = 0;
    }

    public inspect(): readonly DevToolsRecord[] {
        return this.records;
    }

    public addListener(fn: (record: DevToolsRecord) => void): () => void {
        return this.stream.addListener((record) => fn(record), { batched: false });
    }
}
