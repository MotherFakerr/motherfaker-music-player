/* eslint-disable no-await-in-loop */
import { EN_TASK_QUEUE_TYPE, EN_TASK_STATUS, ITaskError, ITaskQueue } from './interface';
import { Task } from './task';

export class TaskQueue<R extends ANY = ANY> implements ITaskQueue<R> {
    constructor(private _tasks: Task<R>[]) {}

    public async start(type: EN_TASK_QUEUE_TYPE = EN_TASK_QUEUE_TYPE.SERIAL): Promise<{ results: R[]; errors: ITaskError[] }> {
        if (!this._checkTaskValid()) {
            throw new Error('Task状态必须为CREATED才能开始');
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
                    break;
                }
            }
        } else if (type === EN_TASK_QUEUE_TYPE.ALLSETTLED_SERIAL) {
            for (const task of this._tasks) {
                try {
                    const res = await task.start();
                    results.push(res);
                } catch {
                    errors.push(...task.getErrors());
                }
            }
        } else if (type === EN_TASK_QUEUE_TYPE.PARALLEL) {
            const promises = this._tasks.map((task) => task.start());
            const resultsArr = await Promise.all(promises);
            results.push(...resultsArr);
        } else if (type === EN_TASK_QUEUE_TYPE.ALLSETTLED_PARALLEL) {
            const promises = this._tasks.map((task) => task.start());
            const resultsArr = await Promise.allSettled(promises);
            for (const result of resultsArr) {
                if (result.status === 'fulfilled') {
                    results.push(result.value);
                } else {
                    errors.push(...(result.reason as ITaskError[]));
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
