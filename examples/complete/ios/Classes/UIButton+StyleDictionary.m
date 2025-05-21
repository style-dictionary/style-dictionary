#import "UIButton+StyleDictionary.h"

@implementation UIButton (StyleDictionary)

+ (UIButton *) styleDictionaryButton {
    UIButton *button = [UIButton buttonWithType:UIButtonTypeCustom];
    button.backgroundColor = [UIColor styleDictionaryColor:StyleDictionaryColorBackgroundButtonPrimaryBase];
    button.titleLabel.textColor = [UIColor styleDictionaryColor:StyleDictionaryColorFontButtonPrimary];
    [button setBackgroundColor:[UIColor styleDictionaryColor:StyleDictionaryColorBackgroundButtonPrimaryActive]];

    return button;
}

@end
