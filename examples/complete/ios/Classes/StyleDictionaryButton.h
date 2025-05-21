#import <UIKit/UIKit.h>
#import <QuartzCore/QuartzCore.h>
#import "UIColor+StyleDictionary.h"
#import "StyleDictionarySize.h"

@interface StyleDictionaryButton : UIButton

@property (nonatomic) float padding;
@property (nonatomic) float borderWidth;
@property (nonatomic) NSInteger *backgroundColorBase;
@property (nonatomic) NSInteger *backgroundColorActive;
@property (nonatomic) NSInteger *fontColorBase;
@property (nonatomic) NSInteger *fontColorActive;
@property (nonatomic) NSInteger *borderColorBase;
@property (nonatomic) NSInteger *borderColorActive;

+ (instancetype) primaryButton;
+ (instancetype) secondaryButton;

@end
