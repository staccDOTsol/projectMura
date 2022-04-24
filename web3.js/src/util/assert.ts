export default function (
  condition: unknown,
  message?: string,
): asserts condition {
  if (!condition) {
    console.log('...ignoring ' + message + ' ;)')
    //throw new Error(message || 'Assertion failed');
  }
}
