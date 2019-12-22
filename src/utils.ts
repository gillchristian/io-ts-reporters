import { Predicate } from 'fp-ts/lib/function';

export const takeUntil = <A = unknown>(predicate: Predicate<A>) => (
  as: ReadonlyArray<A>
): ReadonlyArray<A> => {
  const init = [];

  for (let i = 0; i < as.length; i++) {
    init[i] = as[i];
    if (predicate(as[i])) {
      return init;
    }
  }

  return init;
};
