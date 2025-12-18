// api/payments/payfast/create.js
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

function generateSignature(data, passPhrase) {
    let pfOutput = '';
    for (let key in data) {
        if (data[key] !== '') {
            pfOutput += `${key}=${encodeURIComponent(data[key].toString().trim()).replace(/%20/g, '+')}&`;
        }
    }
    let getString = pfOutput.slice(0, -1);
    if (passPhrase) {
        getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, '+')}`;
    }
    return crypto.createHash('md5').update(getString).digest('hex');
}

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { order, customer } = req.body;
        
        if (!order || !customer) {
            return res.status(400).json({ error: 'Missing order or customer data' });
        }

        const orderId = 'ORD-' + Date.now();
        const paymentId = 'PAY-' + Date.now();
        
        // Save to Supabase
        await supabase.from('orders').insert({
            order_id: orderId,
            customer_email: customer.email,
            customer_first_name: customer.firstName,
            customer_last_name: customer.lastName,
            customer_phone: customer.phone,
            shipping_address: customer.address || '',
            shipping_city: customer.city || '',
            shipping_province: customer.province || '',
            shipping_postal_code: customer.postalCode || '',
            payment_method: 'payfast',
            payment_status: 'pending',
            payment_id: paymentId,
            subtotal: order.subtotal,
            shipping_cost: order.shipping || 0,
            total: order.total,
            created_at: new Date().toISOString()
        });

        // Save order items
        if (order.items) {
            const items = order.items.map(item => ({
                order_id: orderId,
                product_id: item.id,
                product_name: item.name,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.price * item.quantity
            }));
            await supabase.from('order_items').insert(items);
        }

        // PayFast data
        const host = req.headers.host;
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;

        const paymentData = {
            merchant_id: process.env.PAYFAST_MERCHANT_ID,
            merchant_key: process.env.PAYFAST_MERCHANT_KEY,
            return_url: `${baseUrl}/paymentsuccess.html?order=${orderId}`,
            cancel_url: `${baseUrl}/paymentcancel.html?order=${orderId}`,
            notify_url: `${baseUrl}/api/payments/notify`,
            name_first: customer.firstName,
            name_last: customer.lastName,
            email_address: customer.email,
            cell_number: customer.phone?.replace(/\s+/g, ''),
            m_payment_id: paymentId,
            amount: parseFloat(order.total).toFixed(2),
            item_name: `LuxHair Order #${orderId}`,
            item_description: `Order with ${order.items?.length || 0} items`,
            custom_str1: orderId,
            email_confirmation: 1,
            confirmation_address: customer.email
        };
        
        paymentData.signature = generateSignature(paymentData, process.env.PAYFAST_PASSPHRASE);
        
        res.json({
            success: true,
            orderId,
            paymentUrl: process.env.PAYFAST_URL,
            paymentData
        });
        
    } catch (error) {
        console.error('PayFast error:', error);
        res.status(500).json({ error: error.message });
    }
};