import test from 'ava';
import * as iots from 'io-ts';

import { reporter } from '../src/';

test('reports an empty array when the result doesn’t contain errors', (t) => {
  const PrimitiveType = iots.string;
  const result = PrimitiveType.decode('');

  t.deepEqual(reporter(result), []);
});

test('formats a top-level primitve type correctly', (t) => {
  const PrimitiveType = iots.string;
  const result = PrimitiveType.decode(42);

  t.deepEqual(reporter(result), ['Expecting string but instead got: 42.']);
});

test('formats array items', (t) => {
  const NumberGroups = iots.array(iots.array(iots.number));
  const result = NumberGroups.decode({});

  t.deepEqual(reporter(result), ['Expecting Array<Array<number>> but instead got: {}.']);
});

test('formats nested array item mismatches correctly', (t) => {
  const NumberGroups = iots.array(iots.array(iots.number));
  const result = NumberGroups.decode([[{}]]);

  t.deepEqual(reporter(result), ['Expecting number at 0.0 but instead got: {}.']);
});

test('formats a complex type correctly', (t) => {
  const Gender = iots.union([iots.literal('Male'), iots.literal('Female')]);
  const Person = iots.interface({
    name: iots.string,
    age: iots.number,
    gender: Gender,
    children: iots.array(
      iots.interface({
        gender: Gender,
      })
    )
  });
  const result = Person.decode({
    name: 'Giulio',
    children: [{ gender: 'Whatever' }]
  });

  t.deepEqual(reporter(result), [
    'Expecting number at age but instead got: undefined.',
    'Expecting "Male" at gender.0 but instead got: undefined.',
    'Expecting "Female" at gender.1 but instead got: undefined.',
    'Expecting "Male" at children.0.gender.0 but instead got: "Whatever".',
    'Expecting "Female" at children.0.gender.1 but instead got: "Whatever".'
  ]);
});
