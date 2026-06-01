import { parsePhoneNumber } from 'libphonenumber-js';

const disposableDomains = new Set([
  'mailinator.com', 'guerrillamail.com', 'sharklasers.com', 'grr.la',
  'guerrillamail.org', 'guerrillamail.net', 'guerrillamail.biz',
  'guerrillamail.de', 'guerrillamail.co.uk', 'guerrillamailblock.com',
  'tempmail.com', 'temp-mail.org', 'temp-mail.ru', '10minutemail.com',
  '10minutemail.net', 'throwaway.email', 'throwawaymail.com',
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'yopmail.org',
  'mailnator.com', 'maillinator.com', 'getairmail.com',
  'airmailhub.com', 'emailondeck.com', 'mail-temp.com',
  'tempmail.net', 'tempemail.co', 'tempemail.com',
  'dispostable.com', 'maildrop.cc', 'getnada.com',
  'inboxkitten.com', 'anonbox.net', 'hmail.us',
  'spamgourmet.com', 'spam.la', 'spam4.me',
  'trashmail.com', 'trashmail.net', 'trashmail.org',
  'mytrashmail.com', 'wegwerfmail.de', 'wegwerfmail.net',
  'wegwerfmail.org', 'fakemailgenerator.com', 'fakeinbox.com',
  'emailfake.com', 'emailsfake.com', 'fake-mail.net',
  'mailmetrash.com', 'mailexpire.com', 'burnermail.io',
  'mohmal.com', 'mohmal.im', 'mohmal.in',
  'mohmal.tech', 'mailcatch.com', 'tempinbox.com',
  'mailnesia.com', 'mailetas.com', 'mailmetrash.com',
  'jetable.org', 'jetable.com', 'jetable.net',
  'poqv.com', 'filzmail.com', 'mintemail.com',
  'spambox.us', 'spambox.info', 'spambox.me',
  'thankyou2010.com', 'dontreg.com', 'sneakmail.com',
  'discard.email', 'discardmail.com', 'discardmail.de',
  'mailnull.com', 'trash2009.com', 'trashymail.com',
  'trashymail.net', 'tyldd.com', 'uggsrock.com',
  'weg-werf-mail.de', 'wh4f.org', 'whyspam.me',
  'willselfdestruct.com', 'winemaven.info', 'wronghead.com',
  'wuzup.net', 'xagloo.com', 'xemaps.com', 'xents.com',
  'xmaily.com', 'xoxy.net', 'yep.it', 'yogamaven.com',
  'yopmail.fr', 'yopmail.net', 'ypmail.webarnak.com.eu.org',
  'yuurok.com', 'zehnminutenmail.de', 'zippymail.info',
  'zoaxe.com', 'zoemail.org', 'dumpmail.com',
  'dumpmail.de', 'emailgo.de', 'fake-mail.net',
  'flash-mail.net', 'gishpuppy.com', 'howtolearnit.com',
  'isdaq.com', 'kasmail.com', 'mailms.com',
  'mailmetrash.com', 'myspaceinc.com', 'mytrashmail.net',
  'netzidiot.de', 'no-brainer.us', 'oneoffemail.com',
  'ozql.com', 'rcpt.at', 'schrott-mail.de',
  'shortmail.net', 'sibmail.com', 'socks.net',
  'spamherelots.com', 'spamhereplease.com', 'spamspame.com',
  'spamthisplease.com', 'streetwisemail.com', 'suremail.info',
  'thisisnotmyrealemail.com', 'tittbit.net', 'trash-me.com',
  'trash2009.com', 'undef.in', 'upliftnow.com',
  'veryrealemail.com', 'webm4il.info', 'winemaven.info',
  'xww.ro', 'yo.la', 'z1p.biz', 'zippymail.info',
  '30minutemail.com', '33mail.com', 'meltmail.com',
  'spam.la', 'spam.su', 'temp-mail.org',
  'mailexpire.com', 'mytrashmail.com', 'spamspot.com',
]);

export const isDisposableEmail = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  return disposableDomains.has(domain);
};

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return 'Email is required.';
  const trimmed = email.trim();
  if (!trimmed) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Enter a valid email address.';
  if (trimmed.length > 254) return 'Email is too long.';
  const [local, domain] = trimmed.split('@');
  if (local.length > 64) return 'Email local part is too long.';
  if (!/^[a-zA-Z0-9._%+-]+$/.test(local)) return 'Email contains invalid characters.';
  if (!domain.includes('.') || domain.endsWith('.')) return 'Enter a valid email address.';
  const domainParts = domain.split('.');
  if (domainParts.some(p => p.length < 2)) return 'Enter a valid email address.';
  if (isDisposableEmail(trimmed)) return 'Disposable email addresses are not allowed.';
  return null;
};

export const validatePhone = (phone, countryCode) => {
  if (!phone || typeof phone !== 'string') return 'Phone number is required.';
  const trimmed = phone.trim();
  if (!trimmed) return 'Phone number is required.';
  try {
    const parsed = parsePhoneNumber(trimmed, countryCode || undefined);
    if (!parsed || !parsed.isValid()) return 'Enter a valid phone number.';
    return null;
  } catch {
    try {
      const parsed = parsePhoneNumber(trimmed);
      if (parsed && parsed.isValid()) return null;
    } catch {}
    return 'Enter a valid phone number including country code.';
  }
};

export const validateRequired = (value, label) => {
  if (!value || !value.toString().trim()) return `${label} is required.`;
  return null;
};
