#import "ColorCell.h"
#import <StyleDictionary/StyleDictionary.h>

@implementation ColorCell

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        CGRect frame = CGRectMake(StyleDictionarySizePaddingBase,
                                  StyleDictionarySizePaddingBase,
                                  self.frame.size.width - (StyleDictionarySizePaddingBase*2),
                                  self.frame.size.height - (StyleDictionarySizePaddingBase*2));
        
        self.keyLabel = [[UILabel alloc] initWithFrame:frame];
        self.keyLabel.textAlignment = NSTextAlignmentLeft;
        self.valueLabel = [[UILabel alloc] initWithFrame:frame];
        self.valueLabel.textAlignment = NSTextAlignmentRight;

        [self.contentView addSubview:self.keyLabel];
        [self.contentView addSubview:self.valueLabel];
    }
    
    return self;
    
}


@end
