export function getProcessName(process) {
  if (process === 'main') return 'parent';
  return process;
}
