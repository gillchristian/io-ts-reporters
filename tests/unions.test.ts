import test from 'ava';
import * as iots from 'io-ts';

import reporter from '../src';

test('formats keyof unions as "regular" types', t => {
  const WithKeyOf = iots.interface({
    oneOf: iots.keyof({ a: null, b: null, c: null })
  });

  t.deepEqual(reporter.report(WithKeyOf.decode({ oneOf: '' })), [
    'Expecting "a" | "b" | "c" at oneOf but instead got: ""'
  ]);
});

test('union of string literals (no key)', t => {
  t.deepEqual(reporter.report(Gender.decode('male')), [
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

  t.deepEqual(reporter.report(WithUnion.decode({})), [
    [
      'Expecting one of:',
      '    { key: string }',
      '    { code: number }',
      'at data but instead got: undefined'
    ].join('\n')
  ]);

  t.deepEqual(reporter.report(WithUnion.decode({ data: '' })), [
    [
      'Expecting one of:',
      '    { key: string }',
      '    { code: number }',
      'at data but instead got: ""'
    ].join('\n')
  ]);

  t.deepEqual(reporter.report(WithUnion.decode({ data: {} })), [
    [
      'Expecting one of:',
      '    { key: string }',
      '    { code: number }',
      'at data but instead got: {}'
    ].join('\n')
  ]);

  t.deepEqual(reporter.report(WithUnion.decode({ data: { code: '123' } })), [
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

  t.deepEqual(reporter.report(Person.decode({ name: 'Jane' })), [
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
    reporter.report(Person.decode({ name: 'Jane', gender: 'female' })),
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

  t.deepEqual(reporter.report(Person.decode({ name: 'Jane' })), [
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
    reporter.report(
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
