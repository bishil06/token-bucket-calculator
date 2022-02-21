export default function wait(ms: number) {
  return new Promise<number>((resolve) => {
    setTimeout(() => resolve(ms), ms);
  });
}
