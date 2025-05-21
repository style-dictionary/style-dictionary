#import "BackgroundColorsViewController.h"

@interface BackgroundColorsViewController ()
@property (nonatomic, strong) NSArray *dataArray;
@property (nonatomic, strong) NSArray *allColors;
@property (nonatomic, strong) UICollectionView *collectionView;
@end

@implementation BackgroundColorsViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    [self.navigationItem setTitle:@"Background Colors"];
    
    self.allColors = [[[StyleDictionaryProperties properties] valueForKeyPath:@"color.background"] allValues];
    NSMutableArray *backgroundColors = [[NSMutableArray alloc] init];
    
    for (int i=0; i<[self.allColors count]; i++) {
        if ([[self.allColors[i] valueForKey:@"type"] isEqualToString:@"background"]) {
            if ([self.allColors[i] valueForKey:@"subitem"] == nil) {
                [backgroundColors addObject:self.allColors[i]];
            }
        }
    }
    
    self.dataArray = [NSArray arrayWithObjects:backgroundColors, nil];
    self.view = [[UIView alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
    
    UICollectionViewFlowLayout *layout = [[UICollectionViewFlowLayout alloc] init];
    [layout setSectionInset:UIEdgeInsetsMake(0, 0, StyleDictionarySizePaddingSmall, 0)];
    [layout setMinimumLineSpacing:StyleDictionarySizePaddingSmall];
    [layout setScrollDirection:UICollectionViewScrollDirectionVertical];
    
    self.collectionView = [[UICollectionView alloc] initWithFrame:self.view.frame collectionViewLayout:layout];
    [self.collectionView setDataSource:self];
    [self.collectionView setDelegate:self];
    [self.collectionView registerClass:[CardViewCell class] forCellWithReuseIdentifier:@"fontCell"];
    [self.collectionView setContentInset:UIEdgeInsetsMake(StyleDictionarySizePaddingSmall, StyleDictionarySizePaddingSmall, StyleDictionarySizePaddingSmall, StyleDictionarySizePaddingSmall)];
    [self.collectionView setBackgroundColor:[UIColor styleDictionaryColor:StyleDictionaryColorBackgroundAlt]];
    [self.view addSubview:self.collectionView];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
}

- (void)collectionView:(UICollectionView *)collectionView didSelectItemAtIndexPath:(NSIndexPath *)indexPath {
    ColorDetailViewController *controller = [[ColorDetailViewController alloc] init];
    NSDictionary *cellData = [[self.dataArray objectAtIndex:indexPath.section] objectAtIndex:indexPath.row];
    controller.property = cellData;
    controller.name = [cellData valueForKey:@"item"];
    [self.navigationController pushViewController:controller animated:true];
}

-(NSInteger)numberOfSectionsInCollectionView:(UICollectionView *)collectionView {
    return [self.dataArray count];
}

-(NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section {
    NSMutableArray *sectionArray = [self.dataArray objectAtIndex:section];
    return [sectionArray count];
}

-(UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath {
    
    CardViewCell *cell = (CardViewCell *)[collectionView dequeueReusableCellWithReuseIdentifier:@"fontCell" forIndexPath:indexPath];
    
    NSDictionary *cellData = [[self.dataArray objectAtIndex:indexPath.section] objectAtIndex:indexPath.row];
    cell.backgroundColor = [UIColor styleDictionaryColor:StyleDictionaryColorBackgroundBase];
    cell.iconLabel.backgroundColor = [cellData valueForKey:@"value"];
    [cell.subtitleLabel setText:@"subtitle"];
    [cell.titleLabel setText:[cellData valueForKey:@"item"]];
    
    // Return the cell
    return cell;
}


- (CGSize)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout*)collectionViewLayout sizeForItemAtIndexPath:(NSIndexPath *)indexPath {
    return CGSizeMake(collectionView.frame.size.width - collectionView.contentInset.left - collectionView.contentInset.right, 100);
}


@end
