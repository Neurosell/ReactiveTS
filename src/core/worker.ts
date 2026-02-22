import { ReactiveEvent } from "./event";

export type WorkerMessage<T = unknown> = {
    type: string;
    payload: T;
};

export type WorkerBridge = {
    post<T>(message: WorkerMessage<T>): void;
    onMessage: ReactiveEvent<WorkerMessage>;
    dispose(): void;
};

/**
 * Create strongly-typed helper bridge for browser/web-worker style messaging.
 */
export function createWorkerBridge(worker: Pick<Worker, "postMessage" | "addEventListener" | "removeEventListener">): WorkerBridge {
    const onMessage = new ReactiveEvent<WorkerMessage>();
    const listener = (event: MessageEvent<WorkerMessage>) => onMessage.invoke(event.data);

    worker.addEventListener("message", listener as EventListener);

    return {
        post(message) {
            worker.postMessage(message);
        },
        onMessage,
        dispose() {
            worker.removeEventListener("message", listener as EventListener);
            onMessage.removeAllListeners();
        }
    };
}
