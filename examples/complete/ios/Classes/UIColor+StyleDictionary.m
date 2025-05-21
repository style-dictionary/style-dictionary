#import "UIColor+StyleDictionary.h"

@implementation UIColor (StyleDictionaryColor)

+ (instancetype)styleDictionaryColor:(StyleDictionaryColorName)color{
    return [StyleDictionaryColor color:color];
}

@end
