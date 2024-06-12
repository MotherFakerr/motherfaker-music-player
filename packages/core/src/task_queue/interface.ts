export enum EN_TASK_STATUS {
    CREATED,
    PENDING,
    RUNNING,
    SUCCESS,
    FAILED,
}

export enum EN_TASK_QUEUE_TYPE {
    // 串行处理
    SERIAL,
    // 并行处理，遇到error则停止
    PARALLEL,
    // 并行处理，遇到error继续处理剩余的
    ALLSETTLED_PARALLEL,
}

export interface ITaskParams<R extends ANY = ANY> {
    // 不设置onCreated是为了防止taskQueue刚创建就把task执行了
    onPending?: (task: ITask<R>) => Promise<void>;
    onRunning?: (task: ITask<R>) => Promise<void>;
    onSuccess?: (task: ITask<R>, res: R) => Promise<void>;
    onFailed?: (task: ITask<R>, errors: ITaskError[]) => Promise<void>;
}

export interface ITask<R extends ANY = ANY> {
    start(): void;
    setStatus(status: EN_TASK_STATUS): void;
    getStatus(): EN_TASK_STATUS;
    getErrors(): ITaskError[];
    markFailed(error: Error): void;
    markSuccess(res: R): void;
}

export interface ITaskQueue {
    addTask(task: ITask): void;
}

export interface ITaskError {
    msg: string;
    stack?: string;
}
