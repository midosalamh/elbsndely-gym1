const twilio = require('twilio');
require('dotenv').config();

// Initialize Twilio client only if credentials are provided
let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
  try {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('✅ Twilio client initialized successfully');
  } catch (error) {
    console.warn('⚠️ Twilio initialization failed:', error.message);
  }
} else {
  console.warn('⚠️ Twilio credentials not configured properly. WhatsApp features will be disabled.');
}

const WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

/**
 * Send WhatsApp message to a single recipient
 * @param {string} to - Recipient phone number (with country code)
 * @param {string} message - Message content
 * @returns {Object} - Result object with success status and message ID or error
 */
const sendWhatsAppMessage = async (to, message) => {
  try {
    // Check if Twilio client is available
    if (!client) {
      console.warn('⚠️ Twilio client not available. Simulating message send.');
      return {
        success: true,
        messageId: `sim_${Date.now()}`,
        status: 'sent',
        simulated: true
      };
    }

    // Format phone number for WhatsApp
    const formattedNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    const result = await client.messages.create({
      from: WHATSAPP_NUMBER,
      to: formattedNumber,
      body: message
    });

    console.log(`WhatsApp message sent successfully: ${result.sid}`);

    return {
      success: true,
      messageId: result.sid,
      status: result.status
    };
  } catch (error) {
    console.error('WhatsApp send error:', error);

    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};

/**
 * Send WhatsApp messages to multiple recipients
 * @param {Array} recipients - Array of {phone, message} objects
 * @returns {Array} - Array of result objects
 */
const sendBulkMessages = async (recipients) => {
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendWhatsAppMessage(recipient.phone, recipient.message);
    results.push({
      phone: recipient.phone,
      ...result
    });
    
    // Add delay between messages to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
};

/**
 * Send renewal reminder message
 * @param {Object} member - Member object
 * @param {Object} subscription - Subscription object
 * @returns {Object} - Result object
 */
const sendRenewalReminder = async (member, subscription) => {
  const message = `
مرحباً ${member.full_name}! 👋

نذكرك بأن اشتراكك في صالة البسنديلي الرياضية سينتهي في ${subscription.end_date}.

📋 تفاصيل الاشتراك:
• النوع: ${subscription.subscription_type.name}
• تاريخ الانتهاء: ${subscription.end_date}
• المبلغ المطلوب للتجديد: ${subscription.subscription_type.price} ريال

💳 طرق الدفع المتاحة:
• نقداً في الصالة
• تحويل بنكي
• بطاقة ائتمانية

لا تفوت الفرصة وجدد اشتراكك اليوم! 💪

للاستفسار: اتصل بنا على الرقم الموحد
أو قم بزيارة الصالة مباشرة.

شكراً لك ونتطلع لرؤيتك قريباً! 🏋️‍♂️
  `.trim();

  return await sendWhatsAppMessage(member.whatsapp_number || member.phone, message);
};

/**
 * Send motivational message
 * @param {string} phone - Recipient phone number
 * @param {string} name - Recipient name
 * @param {string} motivationalText - Custom motivational text (optional)
 * @returns {Object} - Result object
 */
const sendMotivationalMessage = async (phone, name, motivationalText = null) => {
  const motivationalMessages = [
    'لا تستسلم أبداً! كل تمرين يقربك خطوة من هدفك. استمر وستحقق ما تريد! 💪',
    'النجاح لا يأتي من الراحة، بل من التحدي والمثابرة. اجعل اليوم أفضل من الأمس! 🔥',
    'جسمك يستطيع تحمل الكثير، عقلك هو الذي يحتاج للإقناع. تحدى نفسك اليوم! 🏆',
    'كل يوم تتدرب فيه هو استثمار في صحتك ومستقبلك. استمر في البناء! 🏗️',
    'الألم مؤقت، لكن الفخر بما حققته يدوم للأبد. لا تتوقف! ⚡',
    'أنت أقوى مما تعتقد وأقرب لهدفك مما تتخيل. واصل المسير! 🎯'
  ];

  const randomMessage = motivationalText || motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  
  const message = `
مرحباً ${name}! 🌟

${randomMessage}

تذكر أن كل خطوة تخطوها في الصالة تقربك من النسخة الأفضل من نفسك.

نحن فخورون بك ونؤمن بقدرتك على تحقيق أهدافك! 💯

فريق البسنديلي جيم 🏋️‍♂️
  `.trim();

  return await sendWhatsAppMessage(phone, message);
};

/**
 * Send welcome message to new member
 * @param {Object} member - Member object
 * @returns {Object} - Result object
 */
const sendWelcomeMessage = async (member) => {
  const message = `
مرحباً ${member.full_name}! 🎉

أهلاً وسهلاً بك في عائلة البسنديلي جيم! 

نحن سعداء لانضمامك إلينا ونتطلع لمساعدتك في تحقيق أهدافك الرياضية.

📍 معلومات مهمة:
• رقم العضوية: ${member.member_number}
• ساعات العمل: من 6 صباحاً حتى 12 منتصف الليل
• خدمة العملاء: متاحة طوال أوقات العمل

💡 نصائح للبداية:
• احضر ملابس رياضية مريحة
• لا تنس زجاجة الماء
• ابدأ بتمارين الإحماء دائماً

مرحباً بك مرة أخرى ونتمنى لك رحلة رياضية ممتعة! 💪

فريق البسنديلي جيم 🏋️‍♂️
  `.trim();

  return await sendWhatsAppMessage(member.whatsapp_number || member.phone, message);
};

/**
 * Send promotional message
 * @param {string} phone - Recipient phone number
 * @param {string} name - Recipient name
 * @param {Object} offer - Offer details
 * @returns {Object} - Result object
 */
const sendPromotionalMessage = async (phone, name, offer) => {
  const message = `
مرحباً ${name}! 🎁

لديك عرض خاص من البسنديلي جيم!

🔥 ${offer.title}
${offer.description}

⏰ العرض ساري حتى: ${offer.expiry_date}
💰 قيمة الخصم: ${offer.discount}%

لا تفوت هذه الفرصة الذهبية! 
سارع بالحجز أو زيارة الصالة للاستفادة من العرض.

للحجز أو الاستفسار: اتصل بنا الآن! 📞

فريق البسنديلي جيم 🏋️‍♂️
  `.trim();

  return await sendWhatsAppMessage(phone, message);
};

/**
 * Check message delivery status
 * @param {string} messageId - Twilio message SID
 * @returns {Object} - Status object
 */
const checkMessageStatus = async (messageId) => {
  try {
    // Check if Twilio client is available
    if (!client) {
      console.warn('⚠️ Twilio client not available. Simulating status check.');
      return {
        success: true,
        status: 'delivered',
        simulated: true
      };
    }

    const message = await client.messages(messageId).fetch();

    return {
      success: true,
      status: message.status,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage
    };
  } catch (error) {
    console.error('Status check error:', error);

    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendWhatsAppMessage,
  sendBulkMessages,
  sendRenewalReminder,
  sendMotivationalMessage,
  sendWelcomeMessage,
  sendPromotionalMessage,
  checkMessageStatus
};
