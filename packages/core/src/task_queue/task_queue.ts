import { EN_TASK_QUEUE_TYPE, EN_TASK_STATUS, ITaskQueue } from './interface';
import { Task } from './task';

export class TaskQueue implements ITaskQueue {
    constructor(private _tasks: Task[], private _type: EN_TASK_QUEUE_TYPE) {}

    public start(): void {
        if (!this._checkTaskValid()) {
            throw new Error('Task状态必须为CREATED才能开始');
        }

        if (this._type === EN_TASK_QUEUE_TYPE.SERIAL) {
            for (const task of this._tasks) {
                task.start();
            }
        }
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
