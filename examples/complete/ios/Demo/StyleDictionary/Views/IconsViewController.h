#import <UIKit/UIKit.h>
#import <StyleDictionary/StyleDictionary.h>
#import <StyleDictionary/StyleDictionaryProperties.h>
#import "IconViewCell.h"
#import "IconDetailViewController.h"

@interface IconsViewController : UITableViewController <UITableViewDelegate, UITableViewDataSource>

@property NSArray *tableData;

@end
