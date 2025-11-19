
class Product(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    image = models.ImageField(upload_to='images/',default='images/dummy.jpg')
    price = models.FloatField()
    seller = models.CharField(max_length=255)
    stock = models.IntegerField()
    def __str__(self):
        return self.name+" "+str(self.id)
    


class Cart(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    products = models.ManyToManyField(Product, through='CartItem')

    def __str__(self):
        return f"Cart for {self.user.username}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    
    def remove_from_cart(self):
        self.delete()

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in Cart #{self.cart.id}"

class Order(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    products = models.ManyToManyField(Product, through='OrderItem')
    created_at = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=20, decimal_places=2)
    delivery_address = models.TextField()
    order_description = models.TextField(blank=True)
    estimated_delivery_time = models.DateTimeField(null=True, blank=True)
    seller_info = models.CharField(max_length=100, blank=True)
    payment_status = models.BooleanField(default=False)
    payment_recieved = models.DecimalField(max_digits=10, decimal_places=2,default=0)
    wallet_used=models.TextField()

    def __str__(self):
        return f"Order #{self.id} by {self.user}"

class OrderItem(models.Model):
    STATUS_CHOICES = [
        ('Processing', 'Processing'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    ]
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Processing')
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in Order #{self.order.id}"

class Feedback(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    rating = models.IntegerField()  # Rating can be from 1 to 5
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Feedback from {self.user.username} - {self.created_at}'

# class Order(models.Model):
#     STATUS_CHOICES = (
#         ('Processing', 'Processing'),
#         ('Shipped', 'Shipped'),
#         ('Delivered', 'Delivered'),
#     )

#     user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
#     products = models.ManyToManyField(Product, through='OrderItem')
#     seller = models.ForeignKey(Seller, on_delete=models.CASCADE)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Processing')
#     delivery_address = models.TextField()
#     delivery_description = models.TextField(blank=True)
#     estimated_delivery_time = models.DateTimeField()
#     total_amount = models.DecimalField(max_digits=10, decimal_places=2)

#     def __str__(self):
#         return f"Order #{self.id} by {self.user.username}"