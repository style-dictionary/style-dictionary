import { expect } from 'chai';
import { GroupMessages } from '../../lib/utils/groupMessages.js';

// TODO: add more tests

describe('groupMessage', () => {
  it('should allow removing messages', () => {
    const grpMessages = new GroupMessages();
    const FILTER_WARNINGS = grpMessages.GROUP.FilteredOutputReferences;
    grpMessages.add(FILTER_WARNINGS, '{foo.bar}');
    grpMessages.add(FILTER_WARNINGS, '{baz.qux}');
    grpMessages.add(FILTER_WARNINGS, '{another.one}');

    expect(grpMessages.count(FILTER_WARNINGS)).to.equal(3);
    grpMessages.remove(FILTER_WARNINGS, '{baz.qux}');
    expect(grpMessages.count(FILTER_WARNINGS)).to.equal(2);
    expect(grpMessages.fetchMessages(FILTER_WARNINGS)).to.eql(['{foo.bar}', '{another.one}']);
  });
});
