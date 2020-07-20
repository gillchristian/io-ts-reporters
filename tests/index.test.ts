import test from 'ava';
import * as iots from 'io-ts';
import { withMessage } from 'io-ts-types/lib/withMessage';

import Reporter, { TYPE_MAX_LEN } from '../src';

test('reports an empty array when the result doesn’t contain errors', t => {
  const PrimitiveType = iots.string;
  const result = PrimitiveType.decode('foo');

  t.deepEqual(Reporter.report(result), []);
});

test('formats a top-level primitve type correctly', t => {
  const PrimitiveType = iots.string;
  const result = PrimitiveType.decode(42);

  t.deepEqual(Reporter.report(result), [
    'Expecting string but instead got: 42'
  ]);
});

test('formats array items', t => {
  const NumberGroups = iots.array(iots.array(iots.number));
  const result = NumberGroups.decode({});

  t.deepEqual(Reporter.report(result), [
    'Expecting Array<Array<number>> but instead got: {}'
  ]);
});

test('formats nested array item mismatches correctly', t => {
  const NumberGroups = iots.array(iots.array(iots.number));
  const result = NumberGroups.decode([[{}]]);

  t.deepEqual(Reporter.report(result), [
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

  t.deepEqual(Reporter.report(Positive.decode(-1)), [
    'Expecting Positive but instead got: -1'
  ]);

  const PatronizingPositive = withMessage(
    Positive,
    _i => "Don't be so negative!"
  );

  t.deepEqual(Reporter.report(PatronizingPositive.decode(-1)), [
    "Expecting Positive but instead got: -1 (Don't be so negative!)"
  ]);
});

test('truncates really long types', t => {
  const longType = iots.type({
    '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890':
      iots.number
  });
  const messages = Reporter.report(longType.decode(null));
  t.is(messages.length, 1);
  t.regex(
    messages[0],
    new RegExp(
      `^Expecting .{${TYPE_MAX_LEN - 3}}\\.{3} but instead got: null$`
    ),
    'Should be truncated'
  );
});

test('doesn’t truncate really long types when truncating is disabled', t => {
  const longTypeName =
    '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890';
  const longType = iots.type({
    [longTypeName]: iots.number
  });
  const messages = Reporter.report(longType.decode(null), {
    truncateLongTypes: false
  });
  t.is(messages.length, 1);
  t.is(
    messages[0],
    `Expecting { ${longTypeName}: number } but instead got: null`,
    'Should not be truncated'
  );
});
