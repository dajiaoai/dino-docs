import type { GenerationRecord } from './data';

const DATABASE_NAME = 'dino-question-bank';
const DATABASE_VERSION = 1;
const STORE_NAME = 'generation-results';
const BATCH_INDEX = 'batchId';

type StoredGenerationRecord = {
  batchId: string;
  questionId: string;
  record: Omit<GenerationRecord, 'staticImageUrl'>;
  staticImage?: Blob;
  staticImageUrl?: string;
};

export type LoadedGenerationRecords = {
  records: Record<string, GenerationRecord>;
  objectUrls: string[];
};

export async function loadGenerationRecords(
  batchId: string,
): Promise<LoadedGenerationRecords> {
  const database = await openDatabase();
  const stored = await requestToPromise(
    database
      .transaction(STORE_NAME, 'readonly')
      .objectStore(STORE_NAME)
      .index(BATCH_INDEX)
      .getAll(IDBKeyRange.only(batchId)),
  ) as StoredGenerationRecord[];
  const objectUrls: string[] = [];
  const records = Object.fromEntries(
    stored.map((item) => {
      let staticImageUrl = item.staticImageUrl;
      if (item.staticImage) {
        staticImageUrl = URL.createObjectURL(item.staticImage);
        objectUrls.push(staticImageUrl);
      }
      return [
        item.questionId,
        { ...item.record, staticImageUrl } satisfies GenerationRecord,
      ];
    }),
  );
  database.close();
  return { records, objectUrls };
}

export async function saveGenerationRecord(
  batchId: string,
  record: GenerationRecord,
  staticImage?: Blob,
) {
  const stored: StoredGenerationRecord = {
    batchId,
    questionId: record.questionId,
    record: withoutStaticImageUrl(record),
  };

  if (staticImage) {
    stored.staticImage = staticImage;
  } else if (record.status === 'finished' && record.staticImageUrl) {
    try {
      stored.staticImage = await fetchBlob(record.staticImageUrl);
    } catch {
      stored.staticImageUrl = record.staticImageUrl;
    }
  }

  const database = await openDatabase();
  await transactionDone(
    database.transaction(STORE_NAME, 'readwrite'),
    (store) => store.put(stored),
  );
  database.close();
}

export async function replaceGenerationRecords(
  batchId: string,
  records: Record<string, GenerationRecord>,
  staticImages: Record<string, Blob> = {},
) {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index(BATCH_INDEX);
  const keys = await requestToPromise(
    index.getAllKeys(IDBKeyRange.only(batchId)),
  );
  keys.forEach((key) => store.delete(key));

  Object.values(records).forEach((record) => {
    const stored: StoredGenerationRecord = {
      batchId,
      questionId: record.questionId,
      record: withoutStaticImageUrl(record),
    };
    const image = staticImages[record.questionId];
    if (image) {
      stored.staticImage = image;
    } else if (record.staticImageUrl) {
      stored.staticImageUrl = record.staticImageUrl;
    }
    store.put(stored);
  });

  await transactionComplete(transaction);
  database.close();
}

export async function deleteGenerationRecords(batchId: string) {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  const keys = await requestToPromise(
    store.index(BATCH_INDEX).getAllKeys(IDBKeyRange.only(batchId)),
  );
  keys.forEach((key) => store.delete(key));
  await transactionComplete(transaction);
  database.close();
}

function withoutStaticImageUrl(record: GenerationRecord) {
  const { staticImageUrl: _staticImageUrl, ...rest } = record;
  return rest;
}

async function fetchBlob(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`图片下载失败（HTTP ${response.status}）`);
  return response.blob();
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      const store = database.createObjectStore(STORE_NAME, {
        keyPath: ['batchId', 'questionId'],
      });
      store.createIndex(BATCH_INDEX, BATCH_INDEX, { unique: false });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestToPromise<Result>(request: IDBRequest<Result>): Promise<Result> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(
  transaction: IDBTransaction,
  operation: (store: IDBObjectStore) => IDBRequest,
) {
  operation(transaction.objectStore(STORE_NAME));
  return transactionComplete(transaction);
}

function transactionComplete(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}
