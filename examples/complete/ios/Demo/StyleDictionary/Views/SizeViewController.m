#import "SizeViewController.h"
#import <StyleDictionary/StyleDictionary.h>

@interface SizeViewController ()

@end

@implementation SizeViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    [self.navigationItem setTitle:@"Sizes"];
    self.view.backgroundColor = [UIColor styleDictionaryColor:StyleDictionaryColorBackgroundBase];
    
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

@end
