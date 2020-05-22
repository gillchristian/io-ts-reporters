import * as array from 'fp-ts/lib/Array';
import {fold} from 'fp-ts/lib/Either';
import {map} from 'fp-ts/lib/Option';
import {pipe} from 'fp-ts/lib/pipeable';
import * as t from 'io-ts';

const jsToString = (value: t.mixed) =>
  value === undefined ? 'undefined' : JSON.stringify(value);

export const formatValidationError = (error: t.ValidationError) => {
  const path = error.context
    .map((c) => c.key)
    // The context entry with an empty key is the original type ("default
    // context"), not an type error.
    .filter((key) => key.length > 0)
    .join('.');

  // The actual error is last in context
  const maybeErrorContext = array.last(
    // https://github.com/gcanti/fp-ts/pull/544/files
    error.context as t.ContextEntry[]
  );

  return pipe(
    maybeErrorContext,
    map((errorContext) => {
      const expectedType = errorContext.type.name;
      // https://github.com/elm-lang/core/blob/18c9e84e975ed22649888bfad15d1efdb0128ab2/src/Native/Json.js#L199
      return [
        `Expecting ${expectedType}`,
        path ? `at ${path}` : '',
        'but instead got:',
        jsToString(error.value),
        error.message ? `(${error.message})` : ''
      ]
        .filter(Boolean)
        .join(' ');
    })
  );
};

export const reporter = <T>(validation: t.Validation<T>) =>
  pipe(
    validation,
    fold(
      (errors) => array.compact(errors.map(formatValidationError)),
      () => []
    )
  );
