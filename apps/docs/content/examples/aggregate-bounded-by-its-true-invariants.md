```pseudo title="Avoid"
# catalog/domain/product/entities/product.aggregate
type Product = {
  id: ProductId,
  price: Money,
  reviews: Review[]
}
```

```pseudo title="Prefer"
# catalog/domain/product/entities/product.aggregate
type Product = {
  id: ProductId,
  price: Money
}

# catalog/domain/review/entities/review.aggregate
type Review = {
  id: ReviewId,
  productId: ProductId,
  rating: Rating
}
```
