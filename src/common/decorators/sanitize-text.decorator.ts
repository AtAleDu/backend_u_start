import { Transform } from 'class-transformer';
import { stripHtmlTags } from '../lib/strip-html';

/** Strips HTML from string DTO fields before validation. */
export const SanitizeText = () =>
  Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') {
      return value;
    }

    return stripHtmlTags(value);
  });
