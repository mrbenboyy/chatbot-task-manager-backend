const SibApiV3Sdk = require('sib-api-v3-sdk');

// Configuration de l'API de Brevo
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const emailApiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendBrevoEmail = async (to, subject, htmlContent) => {
    try {
        const email = {
            sender: { email: 'mrbenboyyy@gmail.com', name: 'Abdelhakim Benbouanane' },
            to: [{ email: to }],
            subject: subject,
            htmlContent: htmlContent,
        };

        const response = await emailApiInstance.sendTransacEmail(email);
        console.log('Email envoyé avec succès :', response);
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email :', error.response.data);
    }
};

module.exports = sendBrevoEmail;
