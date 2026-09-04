import { cosineSimilarity } from './cosine';

describe('cosineSimilarity', () => {
  it('is 1 for vectors pointing the same way (any length)', () => {
    expect(cosineSimilarity([1, 0], [10, 0])).toBeCloseTo(1);
  });

  it('is 0 for perpendicular vectors', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });

  it('is -1 for opposite directions', () => {
    expect(cosineSimilarity([1, 1], [-1, -1])).toBeCloseTo(-1);
  });

  it('returns 0 when a vector is all zeros', () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });
});
