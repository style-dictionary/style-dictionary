#import <CoreText/CoreText.h>
#import "UIFont+MaterialIcons.h"

@interface FontLoader : NSObject

+ (void)loadFontWithName:(NSString *)fontName;

@end

@implementation FontLoader

+ (void)loadFontWithName:(NSString *)fontName {
    NSURL *bundleURL = [[NSBundle bundleForClass:[self class]] URLForResource:@"StyleDictionary" withExtension:@"bundle"];
    NSBundle *bundle = [NSBundle bundleWithURL:bundleURL];
    NSURL *fontURL = [bundle URLForResource:fontName withExtension:@"ttf"];
    NSData *fontData = [NSData dataWithContentsOfURL:fontURL];
    
    CGDataProviderRef provider = CGDataProviderCreateWithCFData((CFDataRef)fontData);
    CGFontRef font = CGFontCreateWithDataProvider(provider);
    
    if (font) {
        CFErrorRef error = NULL;
        if (CTFontManagerRegisterGraphicsFont(font, &error) == NO) {
            CFStringRef errorDescription = CFErrorCopyDescription(error);
            @throw [NSException exceptionWithName:NSInternalInconsistencyException reason:(__bridge NSString *)errorDescription userInfo:@{ NSUnderlyingErrorKey: (__bridge NSError *)error }];
        }
        
        CFRelease(font);
    }
    
    CFRelease(provider);
}

@end

@implementation UIFont (MaterialIcons)

+ (instancetype)loadAndReturnFont:(NSString *)fontName
                             size:(CGFloat)fontSize
                        onceToken:(dispatch_once_t *)onceToken
                     fontFileName:(NSString *)fontFileName {
    
    dispatch_once(onceToken, ^{
        [FontLoader loadFontWithName:fontFileName];
    });
    
    return [self fontWithName:fontName
                         size:fontSize];
}

+ (instancetype)iconFontOfSize:(CGFloat)size {
    static dispatch_once_t onceToken;
    return [self loadAndReturnFont:@"MaterialIcons-Regular"
                              size:size
                         onceToken:&onceToken
                      fontFileName:@"MaterialIcons-Regular"];
}

@end
