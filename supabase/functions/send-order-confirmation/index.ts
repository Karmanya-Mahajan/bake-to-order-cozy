import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      throw new Error("Order ID is required");
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Fetch order details with items
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (name, description, price)
        )
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", order.user_id)
      .single();

    if (profileError) {
      console.warn("Could not fetch user profile:", profileError);
    }

    // Get user email from auth
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(order.user_id);
    
    if (userError || !user?.user?.email) {
      throw new Error("Could not find user email");
    }

    const customerName = profile?.full_name || "Valued Customer";
    const customerEmail = user.user.email;

    // Generate order items HTML
    const orderItemsHtml = order.order_items
      .map((item: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            ${item.products.name}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
            $${item.price_per_item.toFixed(2)}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
            $${(item.price_per_item * item.quantity).toFixed(2)}
          </td>
        </tr>
      `)
      .join("");

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8B4513; margin: 0;">Cozy Bakes</h1>
          <p style="color: #666; margin: 5px 0;">Fresh baked goods, made to order</p>
        </div>
        
        <h2 style="color: #8B4513;">Order Confirmation</h2>
        
        <p>Dear ${customerName},</p>
        
        <p>Thank you for your order! We're excited to start baking your fresh treats. Your order details are below:</p>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #8B4513;">Order #${order.id.slice(0, 8)}</h3>
          <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
          <p><strong>Delivery Address:</strong> ${order.delivery_address}</p>
          <p><strong>Phone:</strong> ${order.phone}</p>
          ${order.special_instructions ? `<p><strong>Special Instructions:</strong> ${order.special_instructions}</p>` : ''}
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #8B4513; color: white;">
              <th style="padding: 12px; text-align: left;">Item</th>
              <th style="padding: 12px; text-align: center;">Qty</th>
              <th style="padding: 12px; text-align: right;">Price</th>
              <th style="padding: 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${orderItemsHtml}
            <tr style="background: #f9f9f9; font-weight: bold;">
              <td colspan="3" style="padding: 12px; text-align: right;">Total:</td>
              <td style="padding: 12px; text-align: right;">$${order.total_amount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2d5a2d;">What happens next?</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>We'll start baking your order fresh to ensure maximum quality</li>
            <li>Your order will be ready for delivery within 2-3 hours</li>
            <li>We'll send you an update when your order is out for delivery</li>
          </ul>
        </div>
        
        <p>If you have any questions about your order, please don't hesitate to contact us.</p>
        
        <p>Thank you for choosing Cozy Bakes!</p>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
          <p>Cozy Bakes - Fresh baked goods made with love</p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Cozy Bakes <orders@cozybakes.com>",
      to: [customerEmail],
      subject: `Order Confirmation - Cozy Bakes (#${order.id.slice(0, 8)})`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-order-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});