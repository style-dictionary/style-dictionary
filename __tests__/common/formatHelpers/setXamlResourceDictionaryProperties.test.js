import { expect } from 'chai';
import setXamlResourceDictionaryProperties from '../../../lib/common/formatHelpers/setXamlResourceDictionaryProperties.js';

describe('setXamlResourceDictionaryProperties', () => {
  it('should set the default options', () => {
    const options = setXamlResourceDictionaryProperties({});

    expect(options.outputColorBrushes).to.equal(false);
    expect(options.brushSuffix).to.equal('Brush');
    expect(options.resourceReferenceType).to.equal('StaticResource');
    expect(options.preset).to.equal('maui');
    expect(options.referenceKeyAttribute).to.equal('Key');
    expect(options.namespaces).to.deep.equal({
      default: 'http://schemas.microsoft.com/dotnet/2021/maui',
      x: 'http://schemas.microsoft.com/winfx/2009/xaml',
    });
    expect(options.rootAttributes).to.deep.equal({});
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

  it('should set WPF preset defaults', () => {
    const options = setXamlResourceDictionaryProperties({
      preset: 'wpf',
    });

    expect(options.referenceKeyAttribute).to.equal('ResourceKey');
    expect(options.namespaces).to.deep.equal({
      default: 'http://schemas.microsoft.com/winfx/2006/xaml/presentation',
      x: 'http://schemas.microsoft.com/winfx/2006/xaml',
    });
  });

  it('should throw when a prefixed root attribute has no matching namespace', () => {
    expect(() =>
      setXamlResourceDictionaryProperties({
        rootAttributes: {
          'mc:Ignorable': 'd',
        },
      }),
    ).to.throw(
      'xaml/resourceDictionary rootAttributes["mc:Ignorable"] uses namespace prefix "mc" but options.namespaces does not declare it',
    );
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

  it('should throw for invalid preset values', () => {
    expect(() =>
      setXamlResourceDictionaryProperties({
        preset: 'avalonia',
      }),
    ).to.throw('xaml/resourceDictionary preset must be either "maui" or "wpf"');
  });
});
