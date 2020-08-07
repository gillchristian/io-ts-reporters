---
title: index.ts
nav_order: 1
parent: Modules
---

## index overview

An [io-ts Reporter](https://gcanti.github.io/io-ts/modules/Reporter.ts.html#reporter-interface).

**Example**

```ts
import * as t from 'io-ts'
import Reporter from 'io-ts-reporters'

const User = t.interface({ name: t.string })

assert.deepEqual(Reporter.report(User.decode({ nam: 'Jane' })), ['Expecting string at name but instead got: undefined'])
assert.deepEqual(Reporter.report(User.decode({ name: 'Jane' })), [])
```

Added in v1.2.0

---

<h2 class="text-delta">Table of contents</h2>

- [deprecated](#deprecated)
  - [~~reporter~~](#reporter)
- [formatters](#formatters)
  - [ReporterOptions (interface)](#reporteroptions-interface)
  - [formatValidationError](#formatvalidationerror)
  - [formatValidationErrors](#formatvalidationerrors)
- [internals](#internals)
  - [TYPE_MAX_LEN](#type_max_len)

---

# deprecated

## ~~reporter~~

Deprecated, use the default export instead.

**Signature**

```ts
export declare const reporter: <T>(validation: E.Either<t.Errors, T>, options?: ReporterOptions) => any[]
```

Added in v1.0.0

# formatters

## ReporterOptions (interface)

**Signature**

```ts
export interface ReporterOptions {
  truncateLongTypes?: boolean
}
```

Added in v1.2.2

## formatValidationError

Format a single validation error.

**Signature**

```ts
export declare const formatValidationError: (error: t.ValidationError, options?: ReporterOptions) => O.Option<string>
```

Added in v1.0.0

## formatValidationErrors

Format validation errors (`t.Errors`).

**Signature**

```ts
export declare const formatValidationErrors: (errors: t.Errors, options?: ReporterOptions) => string[]
```

**Example**

```ts
import * as E from 'fp-ts/Either'
import * as t from 'io-ts'
import { formatValidationErrors } from 'io-ts-reporters'

const result = t.string.decode(123)

assert.deepEqual(E.mapLeft(formatValidationErrors)(result), E.left(['Expecting string but instead got: 123']))
```

Added in v1.2.0

# internals

## TYPE_MAX_LEN

**Signature**

```ts
export declare const TYPE_MAX_LEN: 160
```

Added in v1.2.1
