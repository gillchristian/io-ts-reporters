import test from 'ava';
import * as iots from 'io-ts';
import { withMessage } from 'io-ts-types/lib/withMessage';

import reporter from '../src';

test('reports an empty array when the result doesn’t contain errors', t => {
  const PrimitiveType = iots.string;
  const result = PrimitiveType.decode('foo');

  t.deepEqual(reporter.report(result), []);
});

test('formats a top-level primitve type correctly', t => {
  const PrimitiveType = iots.string;
  const result = PrimitiveType.decode(42);

  t.deepEqual(reporter.report(result), [
    'Expecting string but instead got: 42'
  ]);
});

test('formats array items', t => {
  const NumberGroups = iots.array(iots.array(iots.number));
  const result = NumberGroups.decode({});

  t.deepEqual(reporter.report(result), [
    'Expecting Array<Array<number>> but instead got: {}'
  ]);
});

test('formats nested array item mismatches correctly', t => {
  const NumberGroups = iots.array(iots.array(iots.number));
  const result = NumberGroups.decode([[{}]]);

  t.deepEqual(reporter.report(result), [
    'Expecting number at 0.0 but instead got: {}'
  ]);
});

test('formats branded types correctly', t => {
  interface PositiveBrand {
    readonly Positive: unique symbol;
  }

  const Positive = iots.brand(
    iots.number,
    (n): n is iots.Branded<number, PositiveBrand> => n >= 0,
    'Positive'
  );

  t.deepEqual(reporter.report(Positive.decode(-1)), [
    'Expecting Positive but instead got: -1'
  ]);

  const PatronizingPositive = withMessage(
    Positive,
    _i => `Don't be so negative!`
  );

  t.deepEqual(reporter.report(PatronizingPositive.decode(-1)), [
    "Expecting Positive but instead got: -1 (Don't be so negative!)"
  ]);
});
