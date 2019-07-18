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

See [the tests](./tests/index.ts).

## Testing

```bash
yarn
yarn run test
```

[io-ts]: https://github.com/gcanti/io-ts#error-reporters
