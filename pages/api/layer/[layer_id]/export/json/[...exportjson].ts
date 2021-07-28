import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import { isMember } from '../../../../../../src/auth/check-user'
import LayerModel from '../../../../../../src/models/layer'
import { apiError } from '../../../../../../src/services/error-response'

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const handler: NextApiHandler = async (req, res) => {
  const layer_id = Number.parseInt(req.query.layer_id as string)

  const user = (await jwt.getToken({
    req,
    signingKey
  })) as { sub: string }

  if (
    process.env.NEXT_PUBLIC_REQUIRE_LOGIN &&
    (!user?.sub || !isMember(user))
  ) {
    return res.status(401).json({
      error: 'Login required'
    })
  }
  let aggFields

  if (req.query.agg) {
    const agg = req.query.agg as string
    aggFields = agg.split(',')
  }

  try {
    const geoJSON = await (aggFields
      ? LayerModel.getGeoJSONAgg(layer_id, aggFields)
      : LayerModel.getGeoJSON(layer_id))

    return res.status(200).send(geoJSON)
  } catch (err) {
    apiError(res, 200)(err)
  }
}
export default handler
