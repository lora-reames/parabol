import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import TimelineEvent from './TimelineEvent'

export const ArchiveTimelineEventSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'ArchiveTimelineEventSuccess',
  fields: () => ({
    timelineEvent: {
      type: GraphQLNonNull(TimelineEvent),
      description: 'the archived timelineEvent',
      resolve: async ({timelineEventId}, _args, {dataLoader}) => {
        return dataLoader.get('timelineEvents').load(timelineEventId)
      }
    }
  })
})

const ArchiveTimelineEventPayload = makeMutationPayload(
  'ArchiveTimelineEventPayload',
  ArchiveTimelineEventSuccess
)

export default ArchiveTimelineEventPayload
