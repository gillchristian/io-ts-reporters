# io-ts-reporters

[Error reporters](https://github.com/gcanti/io-ts#error-reporters) for io-ts.

Currently this package only includes one reporter. The output is an array of strings in the format of:

`Expected type of ${path} to be ${expectedType}, but got ${actualType}: ${actualValue}.`

## TypeScript compatibility

| io-ts-reporters version | required typescript version |
| ----------------------- | --------------------------- |
| 1.0.0                   | 3.5+                        |
| <= 0.0.21               | 2.7+                        |

## Installation

```bash
yarn add io-ts-reporters
```

## Example

```ts
import * as t from 'io-ts';
import reporter, { formatValidationErrors } from 'io-ts-reporters';
import * as E from 'fp-ts/lib/Either';

const User = t.interface({ name: t.string });

// When decoding fails, the errors are reported
reporter.report(User.decode({ nam: 'Jane' }));
//=> ['Expecting string at name but instead got: undefined']

// Nothing gets reported on success
reporter.report(User.decode({ name: 'Jane' }));
//=> []
```

If you want to report the errors on the `Left` only use `formatValidationErrors` instead.

```ts
import * as t from 'io-ts';
import { formatValidationErrors } from 'io-ts-reporters';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';

const User = t.interface({ name: t.string });

pipe({ nam: 'Jane' }, User.decode, E.mapLeft(formatValidationErrors));
```

For more examples see [the tests](./tests/index.test.ts).

## Testing

```bash
yarn
yarn run test
```

[io-ts]: https://github.com/gcanti/io-ts#error-reporters

## Credits

This library was created by [OliverJAsh](https://github.com/OliverJAsh).
