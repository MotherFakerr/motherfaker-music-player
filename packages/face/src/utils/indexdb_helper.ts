class IndexDBHelperImpl {
    public async createDB(dbName: string, onUpgradeNeeded: (event: IDBVersionChangeEvent) => void): Promise<IDBDatabase> {
        return new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open(dbName, 1);
            request.onupgradeneeded = onUpgradeNeeded;
            request.onsuccess = (event: ANY) => {
                const db = event.target.result as IDBDatabase;
                db.onerror = (event: ANY) => {
                    // 针对此数据库请求的所有错误的通用错误处理器！
                    console.error(`数据库错误：${event.target.errorCode}`);
                };
                resolve(db);
            };

            request.onerror = (event: ANY) => {
                console.error('打开数据库时出错:', event.target.error);
                reject(event.target.error);
            };
        });
    }
}

export const IndexDBHelper = new IndexDBHelperImpl();
