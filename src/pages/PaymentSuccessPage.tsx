import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowLeft, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [emailSent, setEmailSent] = useState(false);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Clear cart from localStorage
    localStorage.removeItem("cartItems");
    
    // Send order confirmation email
    if (sessionId && !emailSent) {
      sendOrderConfirmation();
    }
  }, [sessionId, emailSent]);

  const sendOrderConfirmation = async () => {
    try {
      // Find the order by stripe session ID
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id")
        .eq("stripe_session_id", sessionId)
        .single();

      if (orderError || !order) {
        console.error("Could not find order:", orderError);
        return;
      }

      // Send confirmation email
      const { error: emailError } = await supabase.functions.invoke("send-order-confirmation", {
        body: { orderId: order.id },
      });

      if (emailError) {
        console.error("Error sending confirmation email:", emailError);
        toast({
          title: "Email notification failed",
          description: "Your order was successful, but we couldn't send the confirmation email.",
          variant: "destructive",
        });
      } else {
        setEmailSent(true);
        toast({
          title: "Confirmation email sent!",
          description: "Check your email for order details.",
        });
      }
    } catch (error) {
      console.error("Error in sendOrderConfirmation:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-cream via-background to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-coffee-brown">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for your order. We're starting to bake your fresh treats right away!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 text-green-700">
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">
                {emailSent ? "Confirmation email sent!" : "Sending confirmation email..."}
              </span>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Your order will be freshly baked and ready within 2-3 hours</p>
            <p>• We'll contact you when your order is ready for delivery</p>
            <p>• Check your email for complete order details</p>
          </div>
          
          <div className="flex flex-col gap-2 pt-4">
            <Button 
              onClick={() => navigate("/")}
              className="w-full"
            >
              Continue Shopping
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate(-1)}
              className="w-full flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};