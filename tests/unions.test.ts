import test from 'ava';
import * as iots from 'io-ts';

import Reporter, { TYPE_MAX_LEN } from '../src';

test('formats keyof unions as "regular" types', t => {
  const WithKeyOf = iots.interface({
    oneOf: iots.keyof({ a: null, b: null, c: null })
  });

  t.deepEqual(Reporter.report(WithKeyOf.decode({ oneOf: '' })), [
    'Expecting "a" | "b" | "c" at oneOf but instead got: ""'
  ]);
});

test('union of string literals (no key)', t => {
  t.deepEqual(Reporter.report(Gender.decode('male')), [
    [
      'Expecting one of:',
      '    "Male"',
      '    "Female"',
      '    "Other"',
      'but instead got: "male"'
    ].join('\n')
  ]);
});

test('union of interfaces', t => {
  const UnionOfInterfaces = iots.union([
    iots.interface({ key: iots.string }),
    iots.interface({ code: iots.number })
  ]);
  const WithUnion = iots.interface({ data: UnionOfInterfaces });

  t.deepEqual(Reporter.report(WithUnion.decode({})), [
    [
      'Expecting one of:',
      '    { key: string }',
      '    { code: number }',
      'at data but instead got: undefined'
    ].join('\n')
  ]);

  t.deepEqual(Reporter.report(WithUnion.decode({ data: '' })), [
    [
      'Expecting one of:',
      '    { key: string }',
      '    { code: number }',
      'at data but instead got: ""'
    ].join('\n')
  ]);

  t.deepEqual(Reporter.report(WithUnion.decode({ data: {} })), [
    [
      'Expecting one of:',
      '    { key: string }',
      '    { code: number }',
      'at data but instead got: {}'
    ].join('\n')
  ]);

  t.deepEqual(Reporter.report(WithUnion.decode({ data: { code: '123' } })), [
    [
      'Expecting one of:',
      '    { key: string }',
      '    { code: number }',
      'at data but instead got: {"code":"123"}'
    ].join('\n')
  ]);
});

const Gender = iots.union([
  iots.literal('Male'),
  iots.literal('Female'),
  iots.literal('Other')
]);

test('string union when provided undefined', t => {
  const Person = iots.interface({ name: iots.string, gender: Gender });

  t.deepEqual(Reporter.report(Person.decode({ name: 'Jane' })), [
    [
      'Expecting one of:',
      '    "Male"',
      '    "Female"',
      '    "Other"',
      'at gender but instead got: undefined'
    ].join('\n')
  ]);
});

test('string union when provided another string', t => {
  const Person = iots.interface({ name: iots.string, gender: Gender });

  t.deepEqual(
    Reporter.report(Person.decode({ name: 'Jane', gender: 'female' })),
    [
      [
        'Expecting one of:',
        '    "Male"',
        '    "Female"',
        '    "Other"',
        'at gender but instead got: "female"'
      ].join('\n')
    ]
  );

  t.deepEqual(Reporter.report(Person.decode({ name: 'Jane' })), [
    [
      'Expecting one of:',
      '    "Male"',
      '    "Female"',
      '    "Other"',
      'at gender but instead got: undefined'
    ].join('\n')
  ]);
});

test('string union deeply nested', t => {
  const Person = iots.interface({
    name: iots.string,
    children: iots.array(iots.interface({ gender: Gender }))
  });

  t.deepEqual(
    Reporter.report(
      Person.decode({
        name: 'Jane',
        children: [{}, { gender: 'Whatever' }]
      })
    ),
    [
      [
        'Expecting one of:',
        '    "Male"',
        '    "Female"',
        '    "Other"',
        'at children.0.gender but instead got: undefined'
      ].join('\n'),
      [
        'Expecting one of:',
        '    "Male"',
        '    "Female"',
        '    "Other"',
        'at children.1.gender but instead got: "Whatever"'
      ].join('\n')
    ]
  );
});

test('truncates really long unions', t => {
  const longUnion = iots.union([
    iots.type({
      '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890':
        iots.string
    }),
    iots.type({
      '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890':
        iots.number
    })
  ]);
  const messages = Reporter.report(longUnion.decode(null));
  t.is(messages.length, 1);
  t.regex(
    messages[0],
    new RegExp(
      `^Expecting one of:\n( *.{${
        TYPE_MAX_LEN - 3
      }}\\.{3}\n){2} *but instead got: null$`
    ),
    'Should be truncated'
  );
});
