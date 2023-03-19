export class AlreadyRunningException extends Error {
  public name: string;

  public functionReference: string;
  public lockDurationInSeconds: number;

  constructor(functionReference: string, lockDurationInSeconds: number) {
    const message = `"${functionReference}" is already running. Please wait for it to finish (max ${lockDurationInSeconds} seconds) and try again`;
    super(message);
    this.functionReference = functionReference;
    this.lockDurationInSeconds = lockDurationInSeconds;
    this.name = "AlreadyRunningException";
  }
}

export function mutex<T extends CallableFunction, R>(
  functionReference: string,
  callable: T,
  lockDurationInSeconds: number
): R {
  /* tslint:disable:no-console */

  // Gets a cache that is specific to the current document containing the script
  const cache = CacheService.getDocumentCache();

  const cacheKey = `${functionReference}-is-running`;

  const cached = cache.get(cacheKey);
  console.log(
    `Added cache entry. Script "${functionReference}" can not run while this cache entry is active`
  );
  if (cached !== null) {
    throw new AlreadyRunningException(functionReference, lockDurationInSeconds);
  }

  cache.put(cacheKey, "true", lockDurationInSeconds);

  let results;
  let exception;
  try {
    results = callable();
  } catch (e) {
    exception = e;
  } finally {
    cache.remove(cacheKey);
    console.log(
      `Removed cache entry. Script "${functionReference}" can run again now`
    );
  }

  if (exception) {
    throw exception;
  }

  return results;
  /* tslint:enable:no-console */
}
