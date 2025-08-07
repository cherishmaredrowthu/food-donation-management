import nodemailer from 'nodemailer';

// Create email transporter
const createTransporter = () => {
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else if (process.env.EMAIL_SERVICE === 'sendgrid') {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  } else {
    // For development/demo, log to console
    console.log('📧 Email service not configured - emails will be logged to console');
    return null;
  }
};

export async function sendDonationNotification(donation, receiver) {
  const transporter = createTransporter();
  
  const donationLink = `${process.env.CLIENT_URL}/api/auth/login`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${donation.location.coordinates[0]},${donation.location.coordinates[1]}`;
  
  const emailContent = {
    from: process.env.EMAIL_FROM || 'noreply@foodshare.com',
    to: receiver.email,
    subject: `🍽️ New Food Donation Available - ${donation.foodType}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; }
            .donation-card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10B981; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #555; }
            .button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .button-secondary { background: #3B82F6; }
            .urgent { background: #F59E0B; color: white; padding: 8px 12px; border-radius: 4px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍽️ New Food Donation Available</h1>
              <p>A donation matching your preferences is now available!</p>
            </div>
            
            <div class="content">
              <div class="donation-card">
                <h2>${donation.foodType}</h2>
                <div class="detail-row">
                  <span class="label">Quantity:</span> ${donation.quantity} servings
                </div>
                <div class="detail-row">
                  <span class="label">Description:</span> ${donation.description}
                </div>
                <div class="detail-row">
                  <span class="label">Location:</span> ${donation.location.address}
                </div>
                <div class="detail-row">
                  <span class="label">Distance:</span> ${receiver.distance?.toFixed(1)} km from your location
                </div>
                <div class="detail-row">
                  <span class="label">Expires:</span> ${new Date(donation.expiryTime).toLocaleString()}
                  ${new Date(donation.expiryTime) - Date.now() < 2 * 60 * 60 * 1000 ? '<span class="urgent">URGENT</span>' : ''}
                </div>
                <div class="detail-row">
                  <span class="label">Donor:</span> ${donation.donor.name}
                </div>
                <div class="detail-row">
                  <span class="label">Contact:</span> ${donation.donor.phone}
                </div>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${donationLink}" class="button">Accept Donation</a>
                <a href="${mapsLink}" class="button button-secondary">View Location</a>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                This donation was matched to you based on your location, food preferences, and capacity.
                Please respond quickly if you're interested, as donations are offered on a first-come, first-served basis.
              </p>
              
              <p style="color: #666; font-size: 12px;">
                You're receiving this because you're registered as a receiver with FoodShare.
                To manage your preferences, log in to your dashboard.
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  if (transporter) {
    try {
      await transporter.sendMail(emailContent);
      console.log(`📧 Email sent to ${receiver.email} for donation ${donation._id}`);
    } catch (error) {
      console.error(`❌ Failed to send email to ${receiver.email}:`, error);
      throw error;
    }
  } else {
    // Log email content for development
    console.log('\n📧 ===== EMAIL NOTIFICATION (DEMO) =====');
    console.log(`To: ${receiver.email}`);
    console.log(`Subject: ${emailContent.subject}`);
    console.log(`Donation: ${donation.foodType} - ${donation.quantity} servings`);
    console.log(`Location: ${donation.location.address}`);
    console.log(`Distance: ${receiver.distance?.toFixed(1)} km`);
    console.log(`Donor: ${donation.donor.name} (${donation.donor.phone})`);
    console.log('========================================\n');
  }
}

export async function sendDonationUpdateEmail(donation, receiver, status) {
  const transporter = createTransporter();
  
  let subject, message;
  if (status === 'accepted') {
    subject = '✅ Donation Accepted - Contact Information';
    message = `Your food donation has been accepted by ${receiver.name}. Please contact them at ${receiver.phone} to coordinate pickup.`;
  } else if (status === 'completed') {
    subject = '🎉 Donation Completed - Thank You!';
    message = `Your food donation has been successfully completed. Thank you for helping reduce food waste!`;
  }

  const emailContent = {
    from: process.env.EMAIL_FROM || 'noreply@foodshare.com',
    to: donation.donor.email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>${subject}</h2>
        <p>${message}</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Donation Details:</h3>
          <p><strong>Food Type:</strong> ${donation.foodType}</p>
          <p><strong>Quantity:</strong> ${donation.quantity} servings</p>
          <p><strong>Location:</strong> ${donation.location.address}</p>
        </div>
      </div>
    `
  };

  if (transporter) {
    await transporter.sendMail(emailContent);
  } else {
    console.log(`📧 Email would be sent: ${subject} to ${donation.donor.email}`);
  }
}