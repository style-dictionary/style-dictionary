#import "IconDetailViewController.h"


@implementation IconDetailViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    [self.navigationItem setTitle:[self.property valueForKey:@"item"]];
    self.view.backgroundColor = [UIColor styleDictionaryColor:StyleDictionaryColorBackgroundBase];
    
    CGFloat height = self.view.frame.size.height / 2;
    
    UIView *color = [[UIView alloc] initWithFrame:CGRectMake(0, 0, self.view.frame.size.width, height)];
    color.backgroundColor = [UIColor styleDictionaryColor:StyleDictionaryColorBackgroundAlt];
    [self.view addSubview:color];
    
    UIScrollView *scrollView = [[UIScrollView alloc] initWithFrame:CGRectMake(0, height, self.view.frame.size.width, height)];
    [self.view addSubview:scrollView];
    
    UIStackView *stackView = [[UIStackView alloc] init];
    [scrollView addSubview:stackView];
    stackView.axis = UILayoutConstraintAxisVertical;
    stackView.distribution = UIStackViewDistributionEqualSpacing;
    stackView.alignment = UIStackViewAlignmentLeading;
    stackView.spacing = StyleDictionarySizePaddingBase;
    stackView.translatesAutoresizingMaskIntoConstraints = false;
    [stackView.topAnchor constraintEqualToAnchor:scrollView.topAnchor constant:StyleDictionarySizePaddingBase].active = true;
    [stackView.leftAnchor constraintEqualToAnchor:scrollView.leftAnchor constant:StyleDictionarySizePaddingBase].active = true;
    [stackView.rightAnchor constraintEqualToAnchor:scrollView.rightAnchor constant:StyleDictionarySizePaddingBase].active = true;
    [stackView.bottomAnchor constraintEqualToAnchor:scrollView.bottomAnchor].active = true;
    [stackView.widthAnchor constraintEqualToConstant:scrollView.frame.size.width - (StyleDictionarySizePaddingBase *2)].active = true;
    
    UILabel *icon = [[UILabel alloc] initWithFrame:CGRectMake(0, 0, self.view.frame.size.width, height)];
 
    icon.textColor = [UIColor styleDictionaryColor:StyleDictionaryColorFontBase];
    icon.font = [UIFont iconFontOfSize:100.0f];
    icon.text = [self.property valueForKey:@"value"];
    icon.textAlignment = NSTextAlignmentCenter;
    [self.view addSubview:icon];
    
    
    UILabel *title = [[UILabel alloc] init];
    title.text = self.name;
    title.font = [UIFont systemFontOfSize:StyleDictionarySizeFontLarge weight:UIFontWeightLight];
    
    [stackView addArrangedSubview:title];
    [title.widthAnchor constraintEqualToAnchor:stackView.widthAnchor].active = YES;
    
    UILabel *label = [[UILabel alloc] init];
    [stackView addArrangedSubview:label];
    label.autoresizingMask = UIViewAutoresizingFlexibleHeight;
    label.numberOfLines = 0;
    label.preferredMaxLayoutWidth = scrollView.frame.size.width - (StyleDictionarySizePaddingBase *2);
    [label setLineBreakMode:NSLineBreakByCharWrapping];
    [label.widthAnchor constraintEqualToAnchor:stackView.widthAnchor].active = YES;
    label.text = [self getText];
    label.font = [UIFont systemFontOfSize:StyleDictionarySizeFontSmall weight:UIFontWeightMedium];
    label.textColor = [UIColor styleDictionaryColor:StyleDictionaryColorFontSecondary];
}


- (NSString *) getText {
    NSString *name = [self.property valueForKey:@"name"];
    NSString *import = @"#import <StyleDictionary/StyleDictionary.h>";
    return [NSString stringWithFormat:@"%@\n....\n\nUILabel *icon = [[UILabel alloc] init];\nicon.font = [UIFont iconFontOfSize:StyleDictionarySizeIconBase];\nicon.text = %@;",import,name];
}


@end
