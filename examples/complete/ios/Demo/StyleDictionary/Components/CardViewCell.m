#import "CardViewCell.h"

@interface CardViewCell ()

//@property (nonatomic, retain) UILabel *titleLabel;
//@property (nonatomic, retain) UILabel *subtitleLabel;
//@property (nonatomic, retain) UILabel *iconLabel;

@end

@implementation CardViewCell

- (id)init {
    self = [super init];
    if (self) {
        NSLog(@"test");
    }
    return self;
}

- (id)initWithFrame:(CGRect)frame {
    self = [super initWithFrame:frame];
    if (self) {
        self.titleLabel = [[UILabel alloc] init];
        self.titleLabel.textAlignment = NSTextAlignmentLeft;
        self.titleLabel.font = [UIFont systemFontOfSize:StyleDictionarySizeFontLarge weight:UIFontWeightThin];
        
        float iconSize = frame.size.height - (StyleDictionarySizePaddingSmall * 2);
        self.iconLabel = [[UILabel alloc] initWithFrame:CGRectMake(StyleDictionarySizePaddingSmall, StyleDictionarySizePaddingSmall, iconSize, iconSize)];
        self.iconLabel.font = [UIFont iconFontOfSize:StyleDictionarySizeFontXxl];
        self.iconLabel.textAlignment = NSTextAlignmentCenter;
        
        [self.contentView addSubview:self.titleLabel];
        [self.contentView addSubview:self.iconLabel];
        
        [self.titleLabel.leftAnchor constraintEqualToAnchor:self.iconLabel.rightAnchor constant:StyleDictionarySizePaddingSmall].active = YES;
        [self.titleLabel.heightAnchor constraintEqualToConstant:frame.size.height].active = YES;
        [self.titleLabel.topAnchor constraintEqualToAnchor:self.contentView.topAnchor].active = YES;
        
        self.contentView.translatesAutoresizingMaskIntoConstraints = false;
        self.titleLabel.translatesAutoresizingMaskIntoConstraints = false;
    }
    
    return self;
}

- (void)setTitle:(NSString *)title andSubtitle:(NSString *)subtitle andIcon:(NSString *)icon {
    [self.titleLabel setText:title];
    [self.subtitleLabel setText:subtitle];
    [self.iconLabel setText:icon];
}

//- (void)setHighlighted:(BOOL)highlighted {
//    [super setHighlighted:highlighted];
//    if (highlighted) {
//        self.backgroundColor = [UIColor styleDictionaryColor:StyleDictionaryColorBorderBase];
//    } else {
//        self.backgroundColor = [UIColor styleDictionaryColor:StyleDictionaryColorBackgroundBase];
//    }
//}

@end
