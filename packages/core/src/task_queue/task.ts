import { EN_TASK_STATUS, ITask, ITaskParams } from './interface';

export class Task<T extends KV = KV, R extends ANY = ANY> implements ITask<T> {
    private _status: EN_TASK_STATUS = EN_TASK_STATUS.CREATED;

    private _onPending?: (task: this) => Promise<void>;

    private _onRunning?: (task: this) => Promise<void>;

    private _onSuccess?: (task: this) => Promise<void>;

    private _onFailed?: (task: this) => Promise<void>;

    private _userData: T;

    private _response: R;

    private _promise: Promise<R>;

    private _resolve: (value: R) => void;

    private _reject: (reason: ANY) => void;

    constructor(params: ITaskParams<T>) {
        this._onPending = params.onPending;
        this._onRunning = params.onRunning;
        this._onSuccess = params.onSuccess;
        this._onFailed = params.onFailed;
        this._userData = params.userData ?? ({} as T);
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    public start(): Promise<R> {
        this.setStatus(EN_TASK_STATUS.PENDING);

        return this._promise;
    }

    public getUserData(): T {
        return this._userData;
    }

    public setUserData(data: T): void {
        this._userData = data;
    }

    public setResponse(response: R): void {
        this._response = response;
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

            this._status = EN_TASK_STATUS.FAILED;

            this._executeFailedCallback().catch((e) => {
                console.error('Error executing failed callback. Error:', e);
            });
        });
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
                await this._onSuccess?.(this);
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
            await this._onFailed(this);
        }
        this._reject('');
    }
}
