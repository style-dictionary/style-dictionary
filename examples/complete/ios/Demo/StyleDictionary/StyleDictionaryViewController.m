#import "StyleDictionaryViewController.h"

@interface StyleDictionaryViewController ()

@end

@implementation StyleDictionaryViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor styleDictionaryColor:StyleDictionaryColorFontError];
	// Do any additional setup after loading the view, typically from a nib.
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
