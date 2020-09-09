import {RecordSourceSelectorProxy} from 'relay-runtime'
import getThreadSourceThreadConn from '~/mutations/connections/getThreadSourceThreadConn'
import {handleRemoveReply} from '~/mutations/DeleteCommentMutation'
import {ITask, IUser} from '../../types/graphql'
import safeRemoveNodeFromArray from '../../utils/relay/safeRemoveNodeFromArray'
import safeRemoveNodeFromConn from '../../utils/relay/safeRemoveNodeFromConn'
import getArchivedTasksConn from '../connections/getArchivedTasksConn'
import getTeamTasksConn from '../connections/getTeamTasksConn'
import getUserTasksConn from '../connections/getUserTasksConn'
import pluralizeHandler from './pluralizeHandler'
import useUserTaskFilters from '~/utils/useUserTaskFilters'

const handleRemoveTask = (taskId: string, store: RecordSourceSelectorProxy<any>) => {
  const viewer = store.getRoot().getLinkedRecord<IUser>('viewer')
  const task = store.get<ITask>(taskId)
  if (!task) return
  const teamId = task.getValue('teamId')
  const threadSourceId = task.getValue('threadId')
  const threadParentId = task.getValue('threadParentId')
  if (threadParentId) {
    handleRemoveReply(taskId, threadParentId, store)
    return
  }
  const threadSourceProxy = store.get(threadSourceId!)
  const meetingId = task.getValue('meetingId')
  const meeting = store.get(meetingId!)
  const team = store.get(teamId)
  const {userIds, teamIds, showArchived} = useUserTaskFilters(viewer.getDataID())
  const archiveConns = [getArchivedTasksConn(viewer, userIds, teamIds, showArchived)]
  const teamConn = getTeamTasksConn(team)
  const userConn = getUserTasksConn(viewer, userIds, teamIds, showArchived)
  const threadSourceConn = getThreadSourceThreadConn(threadSourceProxy)
  safeRemoveNodeFromConn(taskId, teamConn)
  safeRemoveNodeFromConn(taskId, userConn)
  archiveConns.forEach((archiveConn) => safeRemoveNodeFromConn(taskId, archiveConn))
  safeRemoveNodeFromConn(taskId, threadSourceConn)
  safeRemoveNodeFromArray(taskId, meeting, 'tasks')
}

const handleRemoveTasks = pluralizeHandler(handleRemoveTask)
export default handleRemoveTasks
