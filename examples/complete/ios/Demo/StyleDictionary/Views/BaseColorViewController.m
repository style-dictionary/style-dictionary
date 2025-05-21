#import "BaseColorViewController.h"

@interface BaseColorViewController ()

@property (nonatomic, strong) NSArray *dataArray;
@property (nonatomic, strong) NSDictionary *properties;
@property (nonatomic, strong) UICollectionView *collectionView;

@end

@implementation BaseColorViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    [self.navigationItem setTitle:@"Base Colors"];
    
    self.properties = [[StyleDictionaryProperties properties] valueForKeyPath:@"color.base"];
    NSArray *colorGroups = [self.properties allKeys];
    NSMutableArray *data = [[NSMutableArray alloc] init];
    NSSortDescriptor * descriptor = [NSSortDescriptor sortDescriptorWithKey:@"subitem"
                                                                  ascending:YES
                                                                   selector:@selector(localizedStandardCompare:)];
    
    for (int i=0; i<[colorGroups count]; i++) {
        if (![colorGroups[i] isEqualToString: @"white"] && ![colorGroups[i] isEqualToString:@"black"]) {
            NSArray *colors = [[[self.properties valueForKey:colorGroups[i]] allValues] sortedArrayUsingDescriptors:@[descriptor]];
            [data addObject:colors];
        }
    }
    
    self.dataArray = [data copy];
    self.view = [[UIView alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
    
    UICollectionViewFlowLayout *layout = [[UICollectionViewFlowLayout alloc] init];
    [layout setSectionInset:UIEdgeInsetsMake(0, 0, StyleDictionarySizePaddingBase, 0)];
    [layout setMinimumLineSpacing:0];

    self.collectionView = [[UICollectionView alloc] initWithFrame:self.view.frame collectionViewLayout:layout];
    [self.collectionView setDataSource:self];
    [self.collectionView setDelegate:self];
    [self.collectionView setContentInset:UIEdgeInsetsMake(StyleDictionarySizePaddingSmall, StyleDictionarySizePaddingSmall, StyleDictionarySizePaddingSmall, StyleDictionarySizePaddingSmall)];
    [self.collectionView registerClass:[ColorCell class] forCellWithReuseIdentifier:@"colorBoxCell"];
    [self.collectionView registerClass:[ColorCell class]
            forSupplementaryViewOfKind:UICollectionElementKindSectionHeader
                   withReuseIdentifier:@"HeaderView"];
    
    [self.collectionView setBackgroundColor:[UIColor styleDictionaryColor:StyleDictionaryColorBackgroundAlt]];
    [self.view addSubview:self.collectionView];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

-(NSInteger)numberOfSectionsInCollectionView:(UICollectionView *)collectionView {
    return [self.dataArray count];
}

-(NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section {
    NSMutableArray *sectionArray = [self.dataArray objectAtIndex:section];
    return [sectionArray count];
}

-(UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath {
    
    ColorCell *cell = (ColorCell *)[collectionView dequeueReusableCellWithReuseIdentifier:@"colorBoxCell" forIndexPath:indexPath];
    
    NSDictionary *cellData = [[self.dataArray objectAtIndex:indexPath.section] objectAtIndex:indexPath.row];
    [cell.keyLabel setText:[cellData valueForKey:@"subitem"]];
    CGFloat red = 0.0, green = 0.0, blue = 0.0, alpha = 0.0;
    [[cellData valueForKey:@"value"] getRed:&red green:&green blue:&blue alpha:&alpha];
    [cell.valueLabel setText:[NSString stringWithFormat:@"%.f, %.f, %.f", red*255, green*255, blue*255]];
    cell.backgroundColor = [cellData valueForKey:@"value"];
    
    if ([[cellData valueForKey:@"font"] isEqualToString:@"inverse"]) {
        cell.keyLabel.textColor = [UIColor styleDictionaryColor:StyleDictionaryColorFontInverseBase];
        cell.valueLabel.textColor = [UIColor styleDictionaryColor:StyleDictionaryColorFontInverseBase];
    } else {
        cell.keyLabel.textColor = [UIColor styleDictionaryColor:StyleDictionaryColorFontBase];
        cell.valueLabel.textColor = [UIColor styleDictionaryColor:StyleDictionaryColorFontBase];
    }
    
    // Return the cell
    return cell;
}

- (UICollectionReusableView *)collectionView:(UICollectionView *)collectionView
           viewForSupplementaryElementOfKind:(NSString *)kind
                                 atIndexPath:(NSIndexPath *)indexPath {
    if (kind == UICollectionElementKindSectionHeader) {
        ColorCell *header = (ColorCell *)[collectionView dequeueReusableSupplementaryViewOfKind:UICollectionElementKindSectionHeader withReuseIdentifier:@"HeaderView" forIndexPath:indexPath];
        
        NSString *colorName = [[[self.dataArray objectAtIndex:indexPath.section] objectAtIndex:0] valueForKey:@"item"];
        NSDictionary *cellData = [self.properties valueForKeyPath:[NSString stringWithFormat:@"%@.500",colorName]];
        [header.keyLabel setText:colorName];
        header.backgroundColor = [cellData valueForKey:@"value"];
        
        if ([[cellData valueForKey:@"font"] isEqualToString:@"inverse"]) {
            header.keyLabel.textColor = [UIColor styleDictionaryColor:StyleDictionaryColorFontInverseBase];
            header.valueLabel.textColor = [UIColor styleDictionaryColor:StyleDictionaryColorFontInverseBase];
        } else {
            header.keyLabel.textColor = [UIColor styleDictionaryColor:StyleDictionaryColorFontBase];
            header.valueLabel.textColor = [UIColor styleDictionaryColor:StyleDictionaryColorFontBase];
        }
        return header;
    }
    return nil;
}


- (CGSize)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout*)collectionViewLayout sizeForItemAtIndexPath:(NSIndexPath *)indexPath {
    return CGSizeMake(collectionView.frame.size.width - collectionView.contentInset.left - collectionView.contentInset.right, 50);
}

- (CGSize)collectionView:(UICollectionView *)collectionView layout:(nonnull UICollectionViewLayout *)collectionViewLayout referenceSizeForHeaderInSection:(NSInteger)section {
    return CGSizeMake(collectionView.frame.size.width - collectionView.contentInset.left - collectionView.contentInset.right, 100);
}

@end
