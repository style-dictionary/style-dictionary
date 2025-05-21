#import "TextColorViewController.h"

@interface TextColorViewController ()
@property (nonatomic, strong) NSArray *dataArray;
@property (nonatomic, strong) NSArray *allColors;
@property (nonatomic, strong) UICollectionView *collectionView;
@end

@implementation TextColorViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    [self.navigationItem setTitle:@"Text Colors"];
    
    self.allColors = [[[StyleDictionaryProperties properties] valueForKeyPath:@"color.font"] allValues];

    NSMutableArray *baseFontColors = [[NSMutableArray alloc] init];
    NSArray *inverseFontColors = [[[StyleDictionaryProperties properties] valueForKeyPath:@"color.font.inverse"] allValues];
    
    for (int i=0; i<[self.allColors count]; i++) {
        if ([self.allColors[i] valueForKey:@"subitem"] == nil) {
            [baseFontColors addObject:self.allColors[i]];
        }
    }

    self.dataArray = [NSArray arrayWithObjects:baseFontColors, inverseFontColors, nil];
    self.view = [[UIView alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
    
    UICollectionViewFlowLayout *layout = [[UICollectionViewFlowLayout alloc] init];
    [layout setSectionInset:UIEdgeInsetsMake(0, 0, StyleDictionarySizePaddingSmall, 0)];
    [layout setMinimumLineSpacing:StyleDictionarySizePaddingSmall];
    [layout setHeaderReferenceSize:CGSizeMake(self.view.frame.size.width - (2 * StyleDictionarySizePaddingSmall), 50)];
    [layout setScrollDirection:UICollectionViewScrollDirectionVertical];
    
    self.collectionView = [[UICollectionView alloc] initWithFrame:self.view.frame collectionViewLayout:layout];
    [self.collectionView setDataSource:self];
    [self.collectionView setDelegate:self];
    [self.collectionView setAllowsSelection:YES];
    [self.collectionView registerClass:[CardViewCell class] forCellWithReuseIdentifier:@"fontCell"];
    [self.collectionView registerClass:[HeaderCollectionViewCell class]
            forSupplementaryViewOfKind: UICollectionElementKindSectionHeader
                   withReuseIdentifier:@"HeaderView"];
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
    controller.name = [cellData valueForKey:@"name"];
    [self.navigationController pushViewController:controller animated:true];
}

- (void)collectionView:(UICollectionView *)collectionView didHighlightItemAtIndexPath:(NSIndexPath *)indexPath {
    CardViewCell *cell = (CardViewCell *)[collectionView dequeueReusableCellWithReuseIdentifier:@"fontCell" forIndexPath:indexPath];
    cell.backgroundColor = [UIColor styleDictionaryColor:StyleDictionaryColorBrandPrimaryLight];
}

-(NSInteger)numberOfSectionsInCollectionView:(UICollectionView *)collectionView {
    return [self.dataArray count];
}

-(NSInteger)collectionView:(UICollectionView *)collectionView
    numberOfItemsInSection:(NSInteger)section {
    NSMutableArray *sectionArray = [self.dataArray objectAtIndex:section];
    return [sectionArray count];
}

-(UICollectionViewCell *)collectionView:(UICollectionView *)collectionView
                 cellForItemAtIndexPath:(NSIndexPath *)indexPath {
    
    CardViewCell *cell = (CardViewCell *)[collectionView dequeueReusableCellWithReuseIdentifier:@"fontCell" forIndexPath:indexPath];
    
    NSDictionary *cellData = [[self.dataArray objectAtIndex:indexPath.section] objectAtIndex:indexPath.row];
    cell.titleLabel.textColor = [cellData valueForKey:@"value"];
    [cell.iconLabel setText:StyleDictionaryContentIconFormatSize];
    cell.iconLabel.textColor = [cellData valueForKey:@"value"];
    
    if (indexPath.section == 1) {
        cell.backgroundColor = [UIColor styleDictionaryColor:StyleDictionaryColorBackgroundInverse];
        [cell.titleLabel setText:[cellData valueForKey:@"subitem"]];
    } else {
        cell.backgroundColor = [UIColor styleDictionaryColor:StyleDictionaryColorBackgroundBase];
        [cell.titleLabel setText:[cellData valueForKey:@"item"]];
    }
    
    // Return the cell
    return cell;
    
}

- (UICollectionReusableView *)collectionView:(UICollectionView *)collectionView
           viewForSupplementaryElementOfKind:(NSString *)kind
                                 atIndexPath:(NSIndexPath *)indexPath {
    
    if (kind == UICollectionElementKindSectionHeader) {
        HeaderCollectionViewCell *header = (HeaderCollectionViewCell *)[collectionView dequeueReusableSupplementaryViewOfKind:UICollectionElementKindSectionHeader withReuseIdentifier:@"HeaderView" forIndexPath:indexPath];
        
        if (indexPath.section == 0) {
            [header.titleLabel setText:@"Base Font Colors"];
        } else {
            [header.titleLabel setText:@"Inverse Font Colors"];
        }
        
        return header;
    }
    
    return nil;
}


- (CGSize)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout*)collectionViewLayout sizeForItemAtIndexPath:(NSIndexPath *)indexPath {
    return CGSizeMake(collectionView.frame.size.width - collectionView.contentInset.left - collectionView.contentInset.right, 100);
}

@end
