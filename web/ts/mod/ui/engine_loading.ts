const MEGABYTE = 1024 * 1024;
const megabytes = (bytes) => (bytes / MEGABYTE).toFixed(1);

export function engineLoadingMessage(progress) {
  const prefix = "Loading the Takumi engine…";
  if (!progress) return prefix;
  if (progress.total > 0) return `${prefix} ${megabytes(progress.loaded)} of ${megabytes(progress.total)} MB`;
  return `${prefix} ${megabytes(progress.loaded)} MB`;
}
