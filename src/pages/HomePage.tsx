import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ProductCard, Product } from "@/components/ProductCard";
import { Cart, CartItem } from "@/components/Cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Import product images
import cookiesImg from "@/assets/cookies.jpg";
import breadImg from "@/assets/bread.jpg";
import muffinsImg from "@/assets/muffins.jpg";
import cakeImg from "@/assets/cake.jpg";

const products: Product[] = [
  {
    id: "1",
    name: "Chocolate Chip Cookies",
    description: "Warm, gooey chocolate chip cookies made with premium Belgian chocolate and organic flour.",
    price: 12.99,
    image: cookiesImg,
    category: "Cookies",
    isNew: true,
    rating: 4.9
  },
  {
    id: "2",
    name: "Artisan Sourdough Bread",
    description: "Traditional sourdough with a crispy crust and tender, tangy interior. 48-hour fermentation process.",
    price: 8.99,
    image: breadImg,
    category: "Bread",
    rating: 4.8
  },
  {
    id: "3",
    name: "Blueberry Muffins",
    description: "Fluffy muffins bursting with fresh Maine blueberries and a hint of lemon zest.",
    price: 15.99,
    image: muffinsImg,
    category: "Muffins",
    rating: 4.7
  },
  {
    id: "4",
    name: "Chocolate Layer Cake",
    description: "Decadent three-layer chocolate cake with rich buttercream frosting. Perfect for celebrations.",
    price: 45.99,
    image: cakeImg,
    category: "Cakes",
    isNew: true,
    rating: 5.0
  },
];

export const HomePage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const { toast } = useToast();

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = selectedCategory === "All" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
    
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      removeItem(id);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
      />
      
      <main>
        <section id="home">
          <HeroSection />
        </section>

        <section id="products" className="py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-coffee-brown mb-4">
                Our Fresh Daily Menu
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Every item is baked fresh to order using the finest ingredients and traditional techniques passed down through generations.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "warm"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="transition-all duration-300"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 px-4 bg-gradient-to-br from-warm-cream to-accent/20">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-coffee-brown mb-6">
                Our Story
              </h2>
              <div className="text-lg text-muted-foreground space-y-4 leading-relaxed">
                <p>
                  At Cozy Bakes, we believe that the best baked goods come from the heart. 
                  Our journey began in a small kitchen with a simple philosophy: use the finest ingredients, 
                  time-honored techniques, and bake everything fresh to order.
                </p>
                <p>
                  Every morning, we hand-select premium ingredients from local suppliers. 
                  Our sourdough starter has been nurtured for over 20 years, and our recipes 
                  have been perfected through generations of passionate baking.
                </p>
                <p>
                  When you place an order with us, we don't just pull something from a shelf. 
                  We fire up the ovens and create your treats with the same care and attention 
                  we'd give to our own family.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Cart
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onClose={() => setIsCartOpen(false)}
        isOpen={isCartOpen}
      />
    </div>
  );
};