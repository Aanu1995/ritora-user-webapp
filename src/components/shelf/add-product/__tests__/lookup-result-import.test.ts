import { buildLookupReviewFields } from '../lookup-result-import';
import {
  CatalogueSource,
  DataProvenance,
  ApplicationMethod,
  LookupConfidence,
  LookupWarningCode,
  ProductCategory,
  type ResolvedLookup,
} from '@/types/shelf';

function createResolvedLookup(): ResolvedLookup {
  return {
    identity: {
      brand: 'Eucerin',
      name: 'Oil Control SPF 50+',
      category: ProductCategory.SunProtection,
      sizeMl: 50,
    },
    guidance: {},
    manufacturer: {},
    provenance: DataProvenance.PhotoLookup,
    source: CatalogueSource.UserPhotos,
    confidence: LookupConfidence.Medium,
    reviewRequired: true,
    warnings: [],
    evidence: [],
  };
}

describe('buildLookupReviewFields', () => {
  it('marks category for review when lookup data needs review', () => {
    expect(buildLookupReviewFields(createResolvedLookup())).toMatchObject({
      'identity.category': true,
      'identity.sizeMl': true,
    });
  });

  it('marks guidance for review when lookup only extracts a method', () => {
    const resolved = createResolvedLookup();
    resolved.reviewRequired = false;
    resolved.guidance = { applicationMethod: ApplicationMethod.CottonPad };
    resolved.warnings = [LookupWarningCode.GuidanceUnverified];

    expect(buildLookupReviewFields(resolved)).toMatchObject({
      guidance: true,
    });
  });
});
