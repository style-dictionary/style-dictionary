#import "StyleDictionary.h"

@implementation StyleDictionary

+ (NSAttributedString *)getIcon:(NSString *)icon
                       withSize:(CGFloat)size
                       andColor:(UIColor *)color {
    if (!icon) {
        return nil;
    }
    
    UIFont *iconFont = [UIFont fontWithName:@"MaterialIcons-Regular"
                                       size:size];
    
    NSDictionary *iconFontAttributes = @{
                                         NSFontAttributeName: iconFont,
                                         NSForegroundColorAttributeName: color
                                         };
    
    return [[NSAttributedString alloc] initWithString:icon
                                           attributes:iconFontAttributes];
}

@end
