#import "PropertiesViewController.h"

@interface PropertiesViewController ()

@end

@implementation PropertiesViewController

{
    NSArray *tableKeys;
    NSArray *tableValues;
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    [self.tableView deselectRowAtIndexPath:[self.tableView indexPathForSelectedRow] animated:YES];
}


- (void)viewDidLoad {
    [super viewDidLoad];
    tableKeys = [self.properties allKeys];
    tableValues = [self.properties allValues];
    
    // init table view
    self.tableView = [[UITableView alloc] initWithFrame:self.view.bounds style:UITableViewStylePlain];
    self.tableView.rowHeight = 60.0f;
    
    // must set delegate & dataSource, otherwise the the table will be empty and not responsive
    self.tableView.delegate = self;
    self.tableView.dataSource = self;
    self.tableView.tableFooterView = [[UIView alloc] initWithFrame:CGRectZero];
    
    [self.navigationItem setTitle:self.name];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
    return 1;
}


- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return [tableKeys count];
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    static NSString *tableIdentifier = @"TableItem";
    
    UITableViewCell *cell = [self.tableView dequeueReusableCellWithIdentifier:tableIdentifier];
    
    if (cell == nil) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleValue1 reuseIdentifier:tableIdentifier];
        cell.textLabel.font = [UIFont systemFontOfSize:StyleDictionarySizeFontBase];
        cell.textLabel.textColor = [UIColor styleDictionaryColor:StyleDictionaryColorFontBase];
        cell.detailTextLabel.font = [UIFont systemFontOfSize:StyleDictionarySizeFontBase];
    }
    
    int count = [[[tableValues objectAtIndex:indexPath.row] allKeys] count];
    cell.textLabel.text = [tableKeys objectAtIndex:indexPath.row];
    
    NSDictionary *cellData = [tableValues objectAtIndex:indexPath.row];
    if ([cellData valueForKey:@"value"] == nil) {
        cell.detailTextLabel.text = [NSString stringWithFormat:@"%u", count];
    } else {
        cell.detailTextLabel.text = StyleDictionaryContentIconKeyboardArrowRight;
        cell.detailTextLabel.font = [UIFont iconFontOfSize:StyleDictionarySizeFontBase];
    }
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    NSDictionary *cellData = [tableValues objectAtIndex:indexPath.row];
    if ([cellData valueForKey:@"value"] != nil) {
        [self detailViewFor:cellData andName:[tableKeys objectAtIndex:indexPath.row]];
    } else {
        PropertiesViewController *controller = [[PropertiesViewController alloc] init];
        controller.name = [tableKeys objectAtIndex:indexPath.row];
        controller.properties = cellData;
        [self.navigationController pushViewController:controller animated:true];
    }
}

- (void)detailViewFor:(NSDictionary *)property andName:(NSString *)name {
    NSString *category = [property valueForKey:@"category"];
    NSString *type = [property valueForKey:@"type"];
    if ([category isEqualToString:@"color"]) {
        ColorDetailViewController *controller = [[ColorDetailViewController alloc] init];
        controller.name = name;
        controller.property = property;
        [self.navigationController pushViewController:controller animated:true];
    } else if ([category isEqualToString:@"content"] && [type isEqualToString:@"icon"]) {
        IconDetailViewController *controller = [[IconDetailViewController alloc] init];
        controller.name = name;
        controller.property = property;
        [self.navigationController pushViewController:controller animated:true];
    }
}

@end
