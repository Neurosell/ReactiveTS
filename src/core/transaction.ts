import { ReactiveHistoryStack, useReactiveTransaction } from "./history";

export type TransactionContext = {
    label?: string;
    startedAt: number;
};

export type TransactionMiddleware = {
    before?(ctx: TransactionContext): void;
    after?(ctx: TransactionContext & { durationMs: number }): void;
};

export type TransactionProfile = {
    label?: string;
    startedAt: number;
    finishedAt: number;
    durationMs: number;
};

/**
 * Transaction manager with middleware + profiling support.
 */
export class ReactiveTransactionManager {
    private readonly middlewares = new Set<TransactionMiddleware>();

    constructor(private readonly history: ReactiveHistoryStack = new ReactiveHistoryStack()) {}

    public getHistory(): ReactiveHistoryStack {
        return this.history;
    }

    public use(middleware: TransactionMiddleware): () => void {
        this.middlewares.add(middleware);
        return () => this.middlewares.delete(middleware);
    }

    public run<T>(fn: () => T, label?: string): T {
        const startedAt = Date.now();
        const ctx: TransactionContext = { label, startedAt };

        for (const middleware of this.middlewares) {
            middleware.before?.(ctx);
        }

        try {
            return useReactiveTransaction(this.history, fn, label);
        } finally {
            const finishedAt = Date.now();
            const afterCtx = {
                ...ctx,
                durationMs: finishedAt - startedAt
            };
            for (const middleware of this.middlewares) {
                middleware.after?.(afterCtx);
            }
        }
    }
}

/**
 * Collect transaction timing profiles.
 */
export function createTransactionProfiler(target: TransactionProfile[] = []): TransactionMiddleware {
    return {
        after(ctx) {
            target.push({
                label: ctx.label,
                startedAt: ctx.startedAt,
                finishedAt: ctx.startedAt + ctx.durationMs,
                durationMs: ctx.durationMs
            });
        }
    };
}
