// src/utils/splitAtIDL.js

/**
 * Always split between EAST → WEST across the International Date Line (IDL).
 *
 * @param {number[]} a - First airport [lon, lat]
 * @param {number[]} b - Second airport [lon, lat]
 * @returns {{ line1: number[][], line2: number[][], idlPointEast: number[], idlPointWest: number[] }}
 */
export const splitAtIDL = (a, b) => {
  // Pick east and west explicitly
  const east = a[0] > b[0] ? a : b; // larger longitude → east
  const west = a[0] > b[0] ? b : a; // smaller longitude → west

  let [lon1, lat1] = east;
  let [lon2, lat2] = west;

  // Adjust for crossing IDL
  if (Math.abs(lon1 - lon2) > 180) {
    lon2 += 360;
  }

  // Interpolated latitude at lon = 180
  const latAtIDL = lat1 + ((lat2 - lat1) * (180 - lon1)) / (lon2 - lon1);

  const idlPointEast = [180, latAtIDL];
  const idlPointWest = [-180, latAtIDL];

  // Always same order: east → IDL, IDL → west
  const line1 = [east, idlPointEast];
  const line2 = [idlPointWest, west];

  return { line1, line2, idlPointEast, idlPointWest };
};
