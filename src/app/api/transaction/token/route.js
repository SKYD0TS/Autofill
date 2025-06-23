import prisma from '@/app/lib/prisma';
const PRICE = 500
export async function POST(req) {
  try {
    const { email, tokenAmount, voucherCode } = await req.json();

    // 1. Fetch Google User by email
    const googleUser = await prisma.googleUser.findFirst({
      where: { email },
      include: {
        tokens: true,  // Include the user's tokens
      },
    });
    console.log(email, tokenAmount, voucherCode, googleUser)

    if (!googleUser) {
      return new Response(JSON.stringify({ error: 'Google user not found' }), { status: 404 });
    }

    // Fetch the associated Token record for the GoogleUser
    const token = await prisma.token.findFirst({
      where: { token_id: googleUser.token_id },
    });

    if (!token) {
      return new Response(JSON.stringify({ error: 'Token record not found' }), { status: 404 });
    }

    // Start a Prisma transaction
    const result = await prisma.$transaction(async (prisma) => {
      // 2. Create Token Purchase record
      const purchasePrice = parseInt(tokenAmount) * PRICE // ad logics for different pricings
      const purchase = await prisma.tokenPurchase.create({
        data: {
          token_amount: parseInt(tokenAmount),
          purchase_amount: purchasePrice,  // Example: Each token costs 10 units of currency
          google_user_id: googleUser.id,
        },
      });

      // 3. Handle Voucher Usage if applicable
      let voucherUsage = null;
      if (voucherCode) {
        const voucher = await prisma.voucher.findUnique({
          where: { voucher_code: voucherCode },
        });

        if (!voucher) {
          return new Response(JSON.stringify({ error: 'Voucher not found' }), { status: 404 });
        }

        // Create Voucher Usage record
        voucherUsage = await prisma.voucherUsage.create({
          data: {
            voucher_id: voucher.voucher_id,
            user_id: googleUser.user_id,
            google_user_id: googleUser.id,
          },
        });
      }

      // 4. Update Token count after purchase
      const updatedToken = await prisma.token.update({
        where: { token_id: token.token_id },
        data: {
          token_count: token.token_count + parseInt(tokenAmount),  // Add purchased tokens
          last_updated: new Date(),
        },
      });

      // Return results
      return {
        purchase,
        voucherUsage,
        updatedToken,
      };
    });

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error('Error in token purchase flow:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
