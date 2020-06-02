import * as A from 'fp-ts/lib/Array';
import * as E from 'fp-ts/lib/Either';
import * as NEA from 'fp-ts/lib/NonEmptyArray';
import * as O from 'fp-ts/lib/Option';
import * as R from 'fp-ts/lib/Record';
import { pipe } from 'fp-ts/lib/pipeable';
import * as t from 'io-ts';

import { takeUntil } from './utils';

const isUnionType = ({ type }: t.ContextEntry) => type instanceof t.UnionType;

const jsToString = (value: t.mixed) =>
  value === undefined ? 'undefined' : JSON.stringify(value);

const keyPath = (ctx: t.Context) =>
  // The context entry with an empty key is the original
  // type ("default context"), not a type error.
  ctx
    .map(c => c.key)
    .filter(Boolean)
    .join('.');

// The actual error is last in context
const getErrorFromCtx = (validation: t.ValidationError) =>
  // https://github.com/gcanti/fp-ts/pull/544/files
  A.last(validation.context as t.ContextEntry[]);

const getValidationContext = (validation: t.ValidationError) =>
  // https://github.com/gcanti/fp-ts/pull/544/files
  validation.context as t.ContextEntry[];

const errorMessageSimple = (
  expectedType: string,
  path: string,
  error: t.ValidationError
) =>
  // https://github.com/elm-lang/core/blob/18c9e84e975ed22649888bfad15d1efdb0128ab2/src/Native/Json.js#L199
  [
    `Expecting ${expectedType}`,
    path === '' ? '' : `at ${path}`,
    `but instead got: ${jsToString(error.value)}`,
    error.message ? `(${error.message})` : ''
  ]
    .filter(Boolean)
    .join(' ');

const errorMessageUnion = (
  expectedTypes: string[],
  path: string,
  value: unknown
) =>
  // https://github.com/elm-lang/core/blob/18c9e84e975ed22649888bfad15d1efdb0128ab2/src/Native/Json.js#L199
  [
    'Expecting one of:\n',
    expectedTypes.map(type => `    ${type}`).join('\n'),
    path === '' ? '\n' : `\nat ${path} `,
    `but instead got: ${jsToString(value)}`
  ]
    .filter(Boolean)
    .join('');

// Find the union type in the list of ContextEntry
// The next ContextEntry should be the type of this branch of the union
const findExpectedType = (ctx: t.ContextEntry[]) =>
  pipe(
    ctx,
    A.findIndex(isUnionType),
    O.chain(n => A.lookup(n + 1, ctx))
  );

const formatValidationErrorOfUnion = (
  path: string,
  errors: NEA.NonEmptyArray<t.ValidationError>
) => {
  const expectedTypes = pipe(
    errors,
    A.map(getValidationContext),
    A.map(findExpectedType),
    A.compact
  );

  const value = pipe(
    expectedTypes,
    A.head,
    O.map(v => v.actual),
    O.getOrElse((): unknown => undefined)
  );

  const expected = expectedTypes.map(({ type }) => type.name);

  return expected.length > 0
    ? O.some(errorMessageUnion(expected, path, value))
    : O.none;
};

const formatValidationError = (path: string, error: t.ValidationError) =>
  pipe(
    error,
    getErrorFromCtx,
    O.map(errorContext =>
      errorMessageSimple(errorContext.type.name, path, error)
    )
  );

const format = (path: string, errors: NEA.NonEmptyArray<t.ValidationError>) =>
  NEA.tail(errors).length > 0
    ? formatValidationErrorOfUnion(path, errors)
    : formatValidationError(path, NEA.head(errors));

const groupByKey = NEA.groupBy((error: t.ValidationError) =>
  pipe(error.context, takeUntil(isUnionType), keyPath)
);

export const reporter = <T>(validation: t.Validation<T>) =>
  pipe(
    validation,
    E.mapLeft(groupByKey),
    E.mapLeft(R.mapWithIndex(format)),
    E.mapLeft(R.compact),
    E.mapLeft(R.toArray),
    E.mapLeft(A.map(([_key, error]) => error)),
    E.fold(
      errors => errors,
      () => []
    )
  );
