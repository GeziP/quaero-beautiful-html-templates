export const indexFields = ['slug', 'name', 'tagline', 'mood', 'occasion', 'tone', 'formality', 'density', 'scheme', 'best_for', 'avoid_for', 'slide_count'];
export function validateMetadata(meta, slug) {
  const errors = [];
  for (const field of ['slug', 'name', 'tagline', 'formality', 'density', 'scheme', 'best_for', 'avoid_for', 'navigation']) {
    if (typeof meta[field] !== 'string' || !meta[field].trim()) errors.push(`${slug}: ${field} must be a nonempty string`);
  }
  if (meta.slug !== slug) errors.push(`${slug}: slug does not match folder`);
  for (const field of ['mood', 'occasion', 'tone']) {
    if (!Array.isArray(meta[field]) || !meta[field].length || meta[field].some(value => typeof value !== 'string' || !value.trim())) {
      errors.push(`${slug}: ${field} must be an array of nonempty strings`);
    }
  }
  if (!['light', 'dark', 'mixed'].includes(meta.scheme)) errors.push(`${slug}: invalid scheme`);
  if (!Number.isInteger(meta.slide_count) || meta.slide_count < 1) errors.push(`${slug}: invalid slide_count`);
  if (!meta.palette || !meta.typography || !Object.keys(meta.typography).some(key => key !== 'style' && typeof meta.typography[key] === 'string')) errors.push(`${slug}: missing design metadata`);
  return errors;
}
export function projectMetadata(meta) { return Object.fromEntries(indexFields.map(field => [field, meta[field]])); }
