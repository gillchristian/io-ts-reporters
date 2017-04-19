import * as t from 'io-ts';
import * as fp from 'fp-ts';

export const formatValidationError = (error: t.ValidationError) => {
    const path = error.context
        .map(c => c.key)
        // The context entry with an empty key is the original type ("default
        // context"), not an type error.
        .filter(key => key.length > 0)
        .join('.');

    // The actual error is last in context
    const maybeErrorContext = fp.array.last(error.context);

    return maybeErrorContext.map(errorContext => {
        const expectedType = errorContext.type.name;
        return (
            `Expected type of ${path} to be ${expectedType}, `
            + `but got ${typeof error.value}: ${error.value}.`
        );
    });
};

export const reporter = <T>(validation: t.Validation<T>) => (
    validation.fold(
        errors => (
            fp.array.catOptions(
                errors.map(formatValidationError),
            )
        ),
        () => [],
    )
);
