#import "StyleDictionaryButton.h"

@implementation StyleDictionaryButton

+ (instancetype)primaryButton {
    StyleDictionaryButton *button = [[StyleDictionaryButton alloc] init];
    button.padding = StyleDictionarySizePaddingBase;
    button.backgroundColorBase = StyleDictionaryColorBackgroundButtonPrimaryBase;
    button.backgroundColorActive = StyleDictionaryColorBackgroundButtonPrimaryActive;
    button.fontColorBase = StyleDictionaryColorBaseLimeA100;
    button.fontColorActive = StyleDictionaryColorBaseLimeA100;
    
    [button setTitleColor:[UIColor styleDictionaryColor:StyleDictionaryColorFontButtonPrimary] forState:UIControlStateNormal];
    button.titleLabel.font = [UIFont systemFontOfSize:StyleDictionarySizeFontLarge];
    UIEdgeInsets contentInsets = UIEdgeInsetsMake(StyleDictionarySizePaddingBase, StyleDictionarySizePaddingBase, StyleDictionarySizePaddingBase, StyleDictionarySizePaddingBase);
    button.contentEdgeInsets = contentInsets;
    [button adjustButtonColor];
    
    return button;
}

+ (instancetype)secondaryButton {
    StyleDictionaryButton *button = [[StyleDictionaryButton alloc] init];
    button.padding = StyleDictionarySizePaddingBase;
    button.backgroundColorBase = StyleDictionaryColorBackgroundButtonSecondaryBase;
    button.backgroundColorActive = StyleDictionaryColorBackgroundButtonSecondaryActive;

    [button setTitleColor:[UIColor styleDictionaryColor:StyleDictionaryColorFontButtonSecondary] forState:UIControlStateNormal];
    button.titleLabel.font = [UIFont systemFontOfSize:StyleDictionarySizeFontLarge];

    UIEdgeInsets contentInsets = UIEdgeInsetsMake(StyleDictionarySizePaddingBase, StyleDictionarySizePaddingBase, StyleDictionarySizePaddingBase, StyleDictionarySizePaddingBase);
    button.contentEdgeInsets = contentInsets;

    [button adjustButtonColor];
    
    [[button layer] setBorderWidth:2.0f];
    [[button layer] setBorderColor:[UIColor styleDictionaryColor:StyleDictionaryColorBorderButtonSecondaryBase].CGColor];
    
    return button;
}


- (void)setSelected:(BOOL)selected {
    [super setSelected:selected];
    [self adjustButtonColor];
}

- (void)setHighlighted:(BOOL)highlighted {
    [super setHighlighted:highlighted];
    [self adjustButtonColor];
}

- (void)adjustButtonColor {
    if (self.selected || self.highlighted) {
        self.backgroundColor = [UIColor styleDictionaryColor:self.backgroundColorActive];
    } else {
        self.backgroundColor = [UIColor styleDictionaryColor:self.backgroundColorBase];
    }
}

@end
