const faq=[
 ['how to register','Open the Player Registration page, complete the form, upload your photo and age proof, and submit it. Your status will remain Pending until an administrator reviews it.'],
 ['tournament','Upcoming tournaments are listed in the Tournaments section. Approved players can register from their player account.'],
 ['ranking','Rankings are grouped by weight category and age group and are updated from recorded tournament results.'],
 ['contact','Use the Contact Us page to send a message to the association.'],
 ['admin','Administrators sign in through the Google Sign-In button on the Admin Login page. Only approved administrator email addresses are allowed.'],
 ['weight','Your weight category is selected during player registration. If you are unsure, contact your coach or association official.']
];
export function faqAnswer(message){const m=message.toLowerCase(); const hit=faq.find(([key])=>m.includes(key)); return hit?.[1] || 'I can help with player registration, tournaments, rankings, announcements, contact details and admin login. Try asking about one of these topics.';}
