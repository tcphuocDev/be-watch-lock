import * as client from 'twilio';
import { twilio } from '../config/config';

export const sendSMS = async (phoneTo: string, message: string) => {
  const sendSms = client(twilio.sid, twilio.token);

  await sendSms.messages.create({
    to: `+84${phoneTo}`,
    body: message,
    messagingServiceSid: twilio.service,
  });
};
