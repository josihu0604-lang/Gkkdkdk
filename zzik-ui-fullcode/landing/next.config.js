const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();
module.exports = withNextIntl({
  output: 'standalone',
  i18n: { locales: ['ko','zh-CN','ja-JP'], defaultLocale: 'ko' },
  images: { domains: ['cdn.zzik.com'] }
});
