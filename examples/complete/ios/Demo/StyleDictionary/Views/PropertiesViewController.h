#import <UIKit/UIKit.h>
#import <StyleDictionary/StyleDictionary.h>
#import "ColorDetailViewController.h"
#import "IconDetailViewController.h"

@interface PropertiesViewController : UITableViewController <UITableViewDelegate, UITableViewDataSource>

@property NSDictionary *properties;
@property NSString *name;

@end
