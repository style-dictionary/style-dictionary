import { expect } from 'chai';
import usesReferences from '../../../lib/utils/references/usesReferences.js';

describe('usesReferences()', () => {
  it(`returns false for non-strings`, () => {
    expect(usesReferences(42)).to.be.false;
  });

  it(`returns false if value uses no reference`, () => {
    expect(usesReferences('foo.bar')).to.be.false;
  });

  it(`returns true if value is a reference`, () => {
    expect(usesReferences('{foo.bar}')).to.be.true;
  });

  it(`should return true if value uses a reference`, () => {
    expect(usesReferences('baz {foo.bar}')).to.be.true;
  });

  it(`returns true if an object uses a reference`, () => {
    expect(usesReferences({ foo: '{bar}' })).to.be.true;
  });

  it(`returns false if an object doesn't have a reference`, () => {
    expect(usesReferences({ foo: 'bar' })).to.be.false;
  });

  it(`returns true if a nested object has a reference`, () => {
    expect(usesReferences({ foo: { bar: '{bar}' } })).to.be.true;
  });

  it(`returns true if an array uses a reference`, () => {
    expect(usesReferences(['foo', '{bar}'])).to.be.true;
  });

  it(`returns false if an array doesn't use a reference`, () => {
    expect(usesReferences(['foo', 'bar'])).to.be.false;
  });
});
