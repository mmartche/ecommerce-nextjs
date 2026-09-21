/** @type {import('next').NextConfig} */

const createNextIntlPlugin =
  require(
    "next-intl/plugin"
  );

const withNextIntl =
  createNextIntlPlugin(
    "./app/i18n/request.js"
  );

const nextConfig = {
  allowedDevOrigins: ["localhost"],
};

module.exports = withNextIntl(nextConfig);