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

export interface ITaskParams<T extends KV = KV> {
    userData?: T;
    // 不设置onCreated是为了防止taskQueue刚创建就把task执行了
    onPending?: (task: ITask<T>) => Promise<void>;
    onRunning?: (task: ITask<T>) => Promise<void>;
    onSuccess?: (task: ITask<T>) => Promise<void>;
    onFailed?: (task: ITask<T>) => Promise<void>;
}

export interface ITask<T extends KV = KV, R extends ANY = ANY> {
    start(): void;
    getUserData(): T;
    setUserData(data: T): void;
    setResponse(response: R): void;
    setStatus(status: EN_TASK_STATUS): void;
    getStatus(): EN_TASK_STATUS;
}

export interface ITaskQueue {
    addTask(task: ITask): void;
}
