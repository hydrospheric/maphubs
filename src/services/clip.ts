import { point, lineString } from '@turf/helpers'
import inside from '@turf/inside'

// clip the given LineString features to the given polygon.
// returns a new list of LineStrings, possibly longer than the original
// since a single line might get clipped into multiple lines.
module.exports = function clip(
  lines: Array<Record<string, any>>,
  polygon: Record<string, any>
) {
  const result = []
  lines.forEach((feat) => {
    const coords = feat.geometry.coordinates
    // array of coordinate pairs of linestring we're building
    let current = []

    function pushLine() {
      if (current.length > 0) {
        result.push(lineString(current, feat.properties))
        current = []
      }
    }

    // scan through the current input linestring, adding clipped
    // lines to the output as we hit the boundaries of the mask
    for (const element of coords) {
      const ins = inside(point(element), polygon)

      if (ins) {
        current.push(element)
      } else {
        pushLine()
      }
    }

    pushLine()
  })
  return result
}