import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOrderConfirmationEmail = async ({ to, orderId, items, amount, address, paymentMethod }) => {
  const itemsHtml = `
  <table style="width: 100%; border-collapse: collapse;">
    <thead>
    <tr style="background-color: #f2f2f2;">
      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item</th>
      <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Quantity</th>
      <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Price Rs:</th>
    </tr>
    </thead>
    <tbody>
    ${items.map((item) => {
      const finalPrice = item.discount 
        ? (item.price * (1 - item.discount / 100)).toFixed(2)
        : item.price;
      return `
      <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">${item.name}${item.size ? ` (${item.size})` : ''}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${finalPrice}</td>
      </tr>
      `;
    }).join('')}
    </tbody>
  </table>
  `;

  const addressText = `
${address.firstName} ${address.lastName}
${address.street}
${address.city}, ${address.state}, ${address.zipcode}
${address.country}
Phone: ${address.phone}
`;

  const mailOptions = {
    from: `"Ogeeera.lk" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: `Order Confirmation - #${orderId}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
      <img src="${process.env.LOGO_URL || 'https://www.ogeeera.lk/assets/logo-BeuFy7XO.png'}" alt="Ogeeera.lk" style="max-width: 150px; height: auto;" />
      </div>
      
      <h2 style="color: #333; text-align: center;">Thank you for your order!</h2>
      <p style="color: #666;">Hi ${address.firstName},</p>
      <p style="color: #666;">Your order has been placed successfully.</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 5px 0;"><b>Order ID:</b> ${orderId}</p>
      <p style="margin: 5px 0;"><b>Payment Method:</b> ${paymentMethod}</p>
      <p style="margin: 5px 0;"><b>Total Amount:</b> Rs. ${amount}</p>
      </div>
      
      <h3 style="color: #333;">Items:</h3>
      <div>
      ${itemsHtml}
      </div>

      <h3 style="color: #333; margin-top: 20px;">Delivery Address:</h3>
      <pre style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">${addressText}</pre>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
      <p>Best regards,<br/><b>Ogeeera.lk Team</b></p>
      </div>
    </div>
    </div>
  `,
  };

  await transporter.sendMail(mailOptions);
};
