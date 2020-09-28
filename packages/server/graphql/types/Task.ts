import {
  GraphQLFloat,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import {ThreadSourceEnum} from 'parabol-client/types/graphql'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import AgendaItem from './AgendaItem'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import PageInfoDateCursor from './PageInfoDateCursor'
import TaskEditorDetails from './TaskEditorDetails'
import TaskIntegration from './TaskIntegration'
import TaskStatusEnum from './TaskStatusEnum'
import Team from './Team'
import Threadable, {threadableFields} from './Threadable'

const Task = new GraphQLObjectType<any, GQLContext>({
  name: 'Task',
  description: 'A long-term task shared across the team, assigned to a single user ',
  interfaces: () => [Threadable],
  fields: () => ({
    ...threadableFields(),
    agendaItem: {
      type: AgendaItem,
      description: 'The agenda item that the task was created in, if any',
      resolve: ({threadId, threadSource}, _args, {dataLoader}) => {
        const agendaId = threadSource === ThreadSourceEnum.AGENDA_ITEM ? threadId : undefined
        return agendaId ? dataLoader.get('agendaItems').load(agendaId) : null
      }
    },
    createdBy: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The userId that created the item'
    },
    createdByUser: {
      type: GraphQLNonNull(require('./User').default),
      description: 'The user that created the item',
      resolve: ({createdBy}, _args, {dataLoader}: GQLContext) => {
        return dataLoader.get('users').load(createdBy)
      }
    },
    dueDate: {
      type: GraphQLISO8601Type,
      description: 'a user-defined due date'
    },
    editors: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TaskEditorDetails))),
      description:
        'a list of users currently editing the task (fed by a subscription, so queries return null)',
      resolve: ({editors = []}) => {
        return editors
      }
    },
    integration: {
      type: TaskIntegration
    },
    meetingId: {
      type: GraphQLID,
      description: 'the foreign key for the meeting the task was created in'
    },
    doneMeetingId: {
      type: GraphQLID,
      description: 'the foreign key for the meeting the task was marked as complete'
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'the shared sort order for tasks on the team dash & user dash'
    },
    status: {
      type: new GraphQLNonNull(TaskStatusEnum),
      description: 'The status of the task'
    },
    tags: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),
      description: 'The tags associated with the task'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the team (indexed). Needed for subscribing to archived tasks'
    },
    team: {
      type: new GraphQLNonNull(Team),
      description: 'The team this task belongs to',
      resolve: ({teamId}, _args, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId)
      }
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description:
        '* The userId, index useful for server-side methods getting all tasks under a user'
    },
    user: {
      type: GraphQLNonNull(require('./User').default),
      description: 'The user the task is assigned to',
      resolve: ({userId}, _args, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

const {connectionType, edgeType} = connectionDefinitions({
  name: Task.name,
  nodeType: Task,
  edgeFields: () => ({
    cursor: {
      type: GraphQLISO8601Type
    }
  }),
  connectionFields: () => ({
    pageInfo: {
      type: PageInfoDateCursor,
      description: 'Page info with cursors coerced to ISO8601 dates'
    }
  })
})

export const TaskConnection = connectionType
export const TaskEdge = edgeType
export default Task
