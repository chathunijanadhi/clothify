const placeholderSecrets = new Set([
  'change_me_for_development_only',
  'changeme',
  'your-secret',
  'your-secret-key',
  'your_jwt_secret_here',
  'secret',
  'placeholder',
  'replace_me_with_a_secure_secret',
  'development_secret',
  'example_only_replace_with_a_random_secret_of_32_plus_characters',
]);

export function validateStartupConfig(): void {
  if (process.env.NODE_ENV !== 'production') return;

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32 || placeholderSecrets.has(jwtSecret.toLowerCase())) {
    throw new Error('JWT_SECRET must be configured with at least 32 non-placeholder characters in production.');
  }

  const databaseUrl = process.env.HostDatabase || process.env.DATABASE_URL;
  const requiredDatabaseVars = databaseUrl
    ? []
    : ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'];
  const missing = requiredDatabaseVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required database configuration: ${missing.join(', ')}.`);
  }

  if (!databaseUrl && !/^[1-9]\d*$/.test(process.env.DB_PORT || '')) {
    throw new Error('DB_PORT must be a positive integer.');
  }
}
