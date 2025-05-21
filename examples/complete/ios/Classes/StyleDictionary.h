#import <Foundation/Foundation.h>
#import "StyleDictionaryColor.h"
#import "StyleDictionaryIcons.h"
#import "StyleDictionarySize.h"
#import "UIFont+MaterialIcons.h"
#import "UIColor+StyleDictionary.h"
#import "UIButton+StyleDictionary.h"
#import "StyleDictionaryButton.h"


@interface StyleDictionary : NSObject


+ (NSAttributedString *)getIcon:(NSString *)icon
                       withSize:(CGFloat)size
                       andColor:(UIColor *)color;

@end
