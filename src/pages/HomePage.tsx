import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ProductCard, Product } from "@/components/ProductCard";
import { Cart, CartItem } from "@/components/Cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";


export const HomePage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_available", true)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Transform the data to match our Product interface
        const transformedProducts: Product[] = data.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description || "",
          price: parseFloat(product.price.toString()),
          image: product.image_url || "",
          category: product.category,
          isNew: product.is_new || false,
          rating: parseFloat(product.rating.toString()) || 0,
        }));

        setProducts(transformedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error loading products",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

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
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted h-64 rounded-lg mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            )}
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