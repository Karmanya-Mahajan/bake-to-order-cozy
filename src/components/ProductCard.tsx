import { Plus, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isNew?: boolean;
  rating?: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  return (
    <Card className="group hover:shadow-warm transition-all duration-300 hover:-translate-y-1 bg-gradient-to-b from-card to-accent/10 border-golden/20">
      <CardHeader className="relative p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.isNew && (
            <Badge className="absolute top-3 left-3 bg-golden text-coffee-brown">
              New
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-3 right-3 h-8 w-8 bg-white/90 hover:bg-white text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-lg font-semibold text-coffee-brown group-hover:text-primary transition-colors">
            {product.name}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {product.category}
          </Badge>
        </div>
        
        <CardDescription className="text-muted-foreground mb-3 line-clamp-2">
          {product.description}
        </CardDescription>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            {product.rating && (
              <div className="flex items-center">
                <span className="text-golden">★</span>
                <span className="text-sm text-muted-foreground ml-1">
                  {product.rating}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          variant="warm" 
          className="w-full"
          onClick={() => onAddToCart(product)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};