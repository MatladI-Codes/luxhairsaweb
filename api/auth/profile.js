// api/auth/profile.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: 'Email required' });
        }

        // GET - Fetch profile
        if (req.method === 'GET') {
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('id, name, email, phone, created_at')
                .eq('email', email)
                .single();

            if (userError) throw userError;

            // Get user addresses
            const { data: addresses } = await supabase
                .from('user_addresses')
                .select('*')
                .eq('user_id', user.id);

            return res.json({
                success: true,
                user,
                addresses: addresses || []
            });
        }

        // PUT - Update profile
        if (req.method === 'PUT') {
            const { name, phone, address } = req.body;

            // Get user ID
            const { data: user } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .single();

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Update user
            await supabase
                .from('users')
                .update({ name, phone })
                .eq('email', email);

            // Update or create address
            if (address && address.address) {
                const { data: existingAddress } = await supabase
                    .from('user_addresses')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('is_default', true)
                    .single();

                if (existingAddress) {
                    await supabase
                        .from('user_addresses')
                        .update({
                            address: address.address,
                            city: address.city,
                            province: address.province,
                            postal_code: address.postalCode
                        })
                        .eq('id', existingAddress.id);
                } else {
                    await supabase
                        .from('user_addresses')
                        .insert({
                            user_id: user.id,
                            address: address.address,
                            city: address.city,
                            province: address.province,
                            postal_code: address.postalCode,
                            is_default: true
                        });
                }
            }

            return res.json({
                success: true,
                message: 'Profile updated successfully'
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });
        
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: error.message });
    }
};