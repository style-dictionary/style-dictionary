#import "IconsViewController.h"


@implementation IconsViewController

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    [self.tableView deselectRowAtIndexPath:[self.tableView indexPathForSelectedRow] animated:YES];
}


- (void)viewDidLoad {
    [super viewDidLoad];
    NSSortDescriptor *descriptor = [NSSortDescriptor sortDescriptorWithKey:@"name"
                                                                  ascending:YES
                                                                   selector:@selector(localizedStandardCompare:)];
    self.tableData = [[[[StyleDictionaryProperties properties] valueForKeyPath:@"content.icon"] allValues] sortedArrayUsingDescriptors:@[descriptor]];
    
    // init table view
    self.tableView = [[UITableView alloc] initWithFrame:self.view.bounds style:UITableViewStylePlain];
    self.tableView.rowHeight = 60.0f;
    
    // must set delegate & dataSource, otherwise the the table will be empty and not responsive
    self.tableView.delegate = self;
    self.tableView.dataSource = self;
    
    [self.navigationItem setTitle:@"Icons"];
}


- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return [self.tableData count];
}


- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    static NSString *tableIdentifier = @"TableItem";
    
    IconViewCell *cell = [tableView dequeueReusableCellWithIdentifier:tableIdentifier];
    
    if (cell == nil) {
        cell = [[IconViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:tableIdentifier];
    }
    
    cell.valueLabel.text = [[self.tableData objectAtIndex:indexPath.row]  valueForKey:@"value"];
    cell.keyLabel.text = [[self.tableData objectAtIndex:indexPath.row]  valueForKey:@"item"];
    
    return cell;
}


- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    IconDetailViewController *controller = [[IconDetailViewController alloc] init];
    
    controller.property = [self.tableData objectAtIndex:indexPath.row];
    [self.navigationController pushViewController:controller animated:true];
}

@end
