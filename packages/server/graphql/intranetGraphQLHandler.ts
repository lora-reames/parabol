import RethinkDataLoader from '../utils/RethinkDataLoader'
import graphql from './graphql'
import IntranetSchema from './intranetSchema/intranetSchema'
import sanitizeGraphQLErrors from '../utils/sanitizeGraphQLErrors'
import sendToSentry from '../utils/sendToSentry'
import {getUserId} from '../utils/authorization'
import DataLoaderWarehouse from 'dataloader-warehouse'
import {RequestHandler} from 'express'
import RateLimiter from './RateLimiter'

const intranetHttpGraphQLHandler = (sharedDataLoader: DataLoaderWarehouse, rateLimiter: RateLimiter, sendResult?: boolean): RequestHandler => async (req, res) => {
  const {query, variables} = req.body
  const authToken = (req as any).user || {}
  const dataLoader = sharedDataLoader.add(new RethinkDataLoader(authToken))
  const context = {authToken, dataLoader, socketId: '', rateLimiter}
  const result = await graphql(IntranetSchema, query, {}, context, variables)
  dataLoader.dispose()
  if (result.errors) {
    const viewerId = getUserId(authToken)
    sendToSentry(result.errors[0], {tags: {query, variables}, userId: viewerId})
  }
  const sanitizedResult = sanitizeGraphQLErrors(result)
  if (sendResult) {
    res.send(sanitizedResult)
  } else {
    return sanitizedResult
  }
}

export default intranetHttpGraphQLHandler