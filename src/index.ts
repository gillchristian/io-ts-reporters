import * as array from 'fp-ts/lib/Array';
import * as t from 'io-ts';

// These are only needed for emitting TypeScript declarations
/* tslint:disable no-unused-variable */
import { Left, Right } from 'fp-ts/lib/Either';
import { None, Some } from 'fp-ts/lib/Option';
/* tslint:enable no-unused-variable */

const jsToString = (value: any) => (value === undefined ? 'undefined' : JSON.stringify(value));

export const formatValidationError = (error: t.ValidationError) => {
    const path = error.context
        .map(c => c.key)
        // The context entry with an empty key is the original type ("default
        // context"), not an type error.
        .filter(key => key.length > 0)
        .join('.');

    // The actual error is last in context
    const maybeErrorContext = array.last(error.context);

    return maybeErrorContext.map(errorContext => {
        const expectedType = errorContext.type.name;
        return (
            // tslint:disable-next-line max-line-length
            // https://github.com/elm-lang/core/blob/18c9e84e975ed22649888bfad15d1efdb0128ab2/src/Native/Json.js#L199
            `Expecting ${expectedType}`
                + (path === '' ? '' : ` at ${path}`)
                + ` but instead got: ${jsToString(error.value)}.`
        );
    });
};

export const reporter = (validation: t.Validation<any>) => (
    validation.fold(errors => array.catOptions(errors.map(formatValidationError)), () => [])
);
