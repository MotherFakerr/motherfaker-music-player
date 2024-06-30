/* eslint-disable no-await-in-loop */
import { EN_TASK_STATUS, ITaskError } from './i_task';
import { EN_TASK_QUEUE_TYPE, ITaskQueue, ITaskQueueOptions } from './i_task_queue';
import { Task } from './task';

export class TaskQueue<R extends ANY = ANY> implements ITaskQueue<R> {
    private _options: ITaskQueueOptions = {
        type: EN_TASK_QUEUE_TYPE.SERIAL,
        concurrency: 10,
    };

    constructor(private _tasks: Task<R>[], options?: Partial<ITaskQueueOptions>) {
        this._options = { ...this._options, ...options };
    }

    public async start(): Promise<{ results: R[]; errors: ITaskError[] }> {
        if (!this._checkTaskValid()) {
            throw new Error('Task状态必须为CREATED才能开始');
        }

        const { type, concurrency } = this._options;

        if (concurrency < 1) {
            throw new Error('concurrency必须为正数');
        }

        const errors: ITaskError[] = [];
        const results: R[] = [];
        if (type === EN_TASK_QUEUE_TYPE.SERIAL) {
            for (const task of this._tasks) {
                try {
                    const res = await task.start();
                    results.push(res);
                } catch {
                    errors.push(...task.getErrors());
                }
            }
        } else if (type === EN_TASK_QUEUE_TYPE.ALLSETTLED_SERIAL) {
            for (const task of this._tasks) {
                try {
                    const res = await task.start();
                    results.push(res);
                } catch {
                    errors.push(...task.getErrors());
                    break;
                }
            }
        } else {
            for (let i = 0; i < Math.ceil(this._tasks.length / concurrency); i += concurrency) {
                const tasks = this._tasks.slice(i * concurrency, (i + 1) * concurrency);
                if (type === EN_TASK_QUEUE_TYPE.PARALLEL) {
                    const promises = tasks.map((task) => task.start());
                    const resultsArr = await Promise.all(promises);
                    results.push(...resultsArr);
                } else if (type === EN_TASK_QUEUE_TYPE.ALLSETTLED_PARALLEL) {
                    const promises = tasks.map((task) => task.start());
                    const resultsArr = await Promise.allSettled(promises);
                    for (const result of resultsArr) {
                        if (result.status === 'fulfilled') {
                            results.push(result.value);
                        } else {
                            errors.push(...(result.reason as ITaskError[]));
                            break;
                        }
                    }
                }
            }
        }

        return { results, errors };
    }

    private _checkTaskValid(): boolean {
        for (const task of this._tasks) {
            if (task.getStatus() !== EN_TASK_STATUS.CREATED) {
                return false;
            }
        }

        return true;
    }
}
