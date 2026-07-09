import { expect } from 'chai';
import setXamlResourceDictionaryProperties from '../../../lib/common/formatHelpers/setXamlResourceDictionaryProperties.js';

describe('setXamlResourceDictionaryProperties', () => {
  it('should set the default options', () => {
    const options = setXamlResourceDictionaryProperties({});

    expect(options.outputColorBrushes).to.equal(false);
    expect(options.brushSuffix).to.equal('Brush');
    expect(options.resourceReferenceType).to.equal('StaticResource');
    expect(options.resourceTypeMap).to.deep.equal({
      color: 'Color',
      dimension: 'x:Double',
      fontSize: 'x:Double',
      number: 'x:Double',
      string: 'x:String',
      content: 'x:String',
      boolean: 'x:Boolean',
    });
  });

  it('should merge custom resource type map values', () => {
    const options = setXamlResourceDictionaryProperties({
      resourceTypeMap: {
        dimension: 'x:Int32',
        brandColor: 'Color',
      },
    });

    expect(options.resourceTypeMap).to.deep.equal({
      color: 'Color',
      dimension: 'x:Int32',
      fontSize: 'x:Double',
      number: 'x:Double',
      string: 'x:String',
      content: 'x:String',
      boolean: 'x:Boolean',
      brandColor: 'Color',
    });
  });

  it('should throw for invalid resourceReferenceType values', () => {
    expect(() =>
      setXamlResourceDictionaryProperties({
        resourceReferenceType: 'InvalidResourceType',
      }),
    ).to.throw(
      'xaml/resourceDictionary resourceReferenceType must be either "StaticResource" or "DynamicResource"',
    );
  });
});
