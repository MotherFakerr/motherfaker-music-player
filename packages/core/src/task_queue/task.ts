import { EN_TASK_STATUS, ITask, ITaskError, ITaskParams } from './interface';

export class Task<R extends ANY = ANY> implements ITask<R> {
    private _status: EN_TASK_STATUS = EN_TASK_STATUS.CREATED;

    private _onPending?: (task: this) => Promise<void>;

    private _onRunning?: (task: this) => Promise<void>;

    private _onSuccess?: (task: this, res: R) => Promise<void>;

    private _onFailed?: (task: this, errors: ITaskError[]) => Promise<void>;

    private _response: R;

    private _promise: Promise<R>;

    private _resolve: (value: R) => void;

    private _reject: (reason: ANY) => void;

    private _errors: ITaskError[] = [];

    constructor(params: ITaskParams<R>) {
        this._onPending = params.onPending;
        this._onRunning = params.onRunning;
        this._onSuccess = params.onSuccess;
        this._onFailed = params.onFailed;
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    public start(): Promise<R> {
        this.setStatus(EN_TASK_STATUS.PENDING);

        return this._promise;
    }

    public getStatus(): EN_TASK_STATUS {
        return this._status;
    }

    public setStatus(status: EN_TASK_STATUS): void {
        if (this._status === EN_TASK_STATUS.FAILED) {
            return;
        }

        if (status <= this._status) {
            console.error('Task status cannnot be reversed');
            return;
        }
        this._status = status;

        this._executeCallback(status).catch((e) => {
            console.error('Error executing callback for status:', status, 'Error:', e);
            this._errors.push({ msg: e.message, stack: e.stack });
            this._status = EN_TASK_STATUS.FAILED;

            this._executeFailedCallback().catch((e: Error) => {
                console.error('Error executing failed callback. Error:', e);
                this._errors.push({ msg: e.message, stack: e.stack });
            });
        });
    }

    public getErrors(): ITaskError[] {
        return this._errors;
    }

    public markFailed(error: Error): void {
        this._errors.push({ msg: error.message, stack: error.stack });
        this.setStatus(EN_TASK_STATUS.FAILED);
    }

    public markSuccess(res: R): void {
        this._response = res;
        this.setStatus(EN_TASK_STATUS.SUCCESS);
    }

    private async _executeCallback(status: EN_TASK_STATUS): Promise<void> {
        switch (status) {
            case EN_TASK_STATUS.PENDING:
                await (this._onPending ? this._onPending(this) : this.setStatus(EN_TASK_STATUS.RUNNING));
                break;
            case EN_TASK_STATUS.RUNNING:
                await (this._onRunning ? this._onRunning(this) : this.setStatus(EN_TASK_STATUS.SUCCESS));
                break;
            case EN_TASK_STATUS.SUCCESS:
                await this._onSuccess?.(this, this._response);
                this._resolve(this._response);
                break;
            case EN_TASK_STATUS.FAILED:
                await this._executeFailedCallback();
                break;
            default:
                throw new Error(`Unknown task status:${status}`);
        }
    }

    private async _executeFailedCallback(): Promise<void> {
        if (this._onFailed) {
            await this._onFailed(this, this._errors);
        }
        this._reject(this._errors);
    }
}
