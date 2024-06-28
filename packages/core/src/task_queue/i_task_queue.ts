import { ITaskError } from './i_task';

export enum EN_TASK_QUEUE_TYPE {
    // 串行处理, 遇到error则停止
    SERIAL,
    // 串行处理,遇到error继续处理剩余的
    ALLSETTLED_SERIAL,
    // 并行处理，遇到error则停止
    PARALLEL,
    // 并行处理，遇到error继续处理剩余的
    ALLSETTLED_PARALLEL,
}

export interface ITaskQueue<R extends ANY = ANY> {
    start(type: EN_TASK_QUEUE_TYPE): Promise<{ results: R[]; errors: ITaskError[] }>;
}

export interface ITaskQueueOptions {
    type: EN_TASK_QUEUE_TYPE;
    concurrency: number;
}
