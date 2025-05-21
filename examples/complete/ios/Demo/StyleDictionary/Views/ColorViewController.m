#import "ColorViewController.h"

@implementation ColorViewController
{
    NSArray *array;
    NSArray *titles;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    [self.navigationItem setTitle:@"Colors"];
    array = @[[BaseColorViewController class], [TextColorViewController class], [BackgroundColorsViewController class]];
    titles = @[@"Base Colors", @"Text Colors", @"Background Colors"];

    
    UIScrollView *scrollView = [[UIScrollView alloc] initWithFrame:self.view.frame];
    [self.view addSubview:scrollView];
    
    UIStackView *stackView = [[UIStackView alloc] init];
    stackView.axis = UILayoutConstraintAxisVertical;
    stackView.distribution = UIStackViewDistributionEqualSpacing;
    stackView.alignment = UIStackViewAlignmentLeading;
    stackView.spacing = StyleDictionarySizePaddingLarge;
    stackView.translatesAutoresizingMaskIntoConstraints = false;
    [scrollView addSubview:stackView];
    
    // Pin the edges of the stack view to the edges of the scroll view that contains it
    [stackView.topAnchor constraintEqualToAnchor:scrollView.topAnchor constant:StyleDictionarySizePaddingBase].active = true;
    [stackView.leftAnchor constraintEqualToAnchor:scrollView.leftAnchor constant:StyleDictionarySizePaddingBase].active = true;
    [stackView.rightAnchor constraintEqualToAnchor:scrollView.rightAnchor constant:StyleDictionarySizePaddingBase].active = true;
    [stackView.bottomAnchor constraintEqualToAnchor:scrollView.bottomAnchor].active = true;
    [stackView.widthAnchor constraintEqualToConstant:scrollView.frame.size.width - (StyleDictionarySizePaddingBase *2)].active = true;
    
    for (int i = 0; i < [titles count]; i++) {
        StyleDictionaryButton *button = [StyleDictionaryButton primaryButton];
        [button setTitle:titles[i] forState:UIControlStateNormal];
        [button addTarget:self action:@selector(linkAction:) forControlEvents:UIControlEventTouchUpInside];
        [stackView addArrangedSubview:button];
        [button.widthAnchor constraintEqualToAnchor:stackView.widthAnchor].active = YES;
    }
    
    self.view.backgroundColor = [UIColor styleDictionaryColor:StyleDictionaryColorBackgroundBase];
}


- (void)linkAction:(StyleDictionaryButton *)sender {
    NSUInteger index = [titles indexOfObject:sender.titleLabel.text];
    id nextController = [[array[index] alloc] init];
    [[self navigationController] pushViewController:nextController animated:YES];
}

@end
