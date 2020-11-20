import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import {PokerEstimatePhase_meeting} from '../__generated__/PokerEstimatePhase_meeting.graphql'
import EstimatePhaseArea from './EstimatePhaseArea'
import EstimatePhaseDiscussionDrawer from './EstimatePhaseDiscussionDrawer'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderDescription from './PhaseHeaderDescription'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'
import PokerEstimateHeaderCardJira from './PokerEstimateHeaderCardJira'
import {PokerMeetingPhaseProps} from './PokerMeeting'
import {Breakpoint, DiscussionThreadEnum} from '~/types/constEnums'
import useBreakpoint from '~/hooks/useBreakpoint'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import styled from '@emotion/styled'

const StyledMeetingHeaderAndPhase = styled(MeetingHeaderAndPhase)<{isOpen: boolean}>(
  ({isOpen}) => ({
    width: isOpen ? `calc(100% - ${DiscussionThreadEnum.WIDTH}px)` : '100%',
  })
)

interface Props extends PokerMeetingPhaseProps {
  isDrawerOpen: boolean
  meeting: PokerEstimatePhase_meeting
  toggleDrawer: () => void
}

const PokerEstimatePhase = (props: Props) => {
  const {avatarGroup, isDrawerOpen, meeting, toggleDrawer, toggleSidebar} = props
  const {localStage, endedAt, showSidebar} = meeting
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const meetingContentRef = useRef<HTMLDivElement>(null)
  if (!localStage) return null
  const {story} = localStage
  const {__typename} = story!

  return (
    <MeetingContent ref={meetingContentRef}>
      <StyledMeetingHeaderAndPhase isOpen={isDrawerOpen} hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          isDrawerOpen={isDrawerOpen}
          toggleSidebar={toggleSidebar}
          toggleDrawer={toggleDrawer}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.ESTIMATE}</PhaseHeaderTitle>
          <PhaseHeaderDescription>{'Estimate each story as a team'}</PhaseHeaderDescription>
        </MeetingTopBar>
        {__typename === 'JiraIssue' && <PokerEstimateHeaderCardJira stage={localStage as any} />}
        <PhaseWrapper>
          <EstimatePhaseArea meeting={meeting} />
        </PhaseWrapper>
      </StyledMeetingHeaderAndPhase>
      <ResponsiveDashSidebar isOpen={isDrawerOpen} isRightSidebar onToggle={toggleDrawer}>
        <EstimatePhaseDiscussionDrawer
          isDesktop={isDesktop}
          isOpen={isDrawerOpen}
          meeting={meeting}
          meetingContentRef={meetingContentRef}
          onToggle={toggleDrawer}
        />
      </ResponsiveDashSidebar>
    </MeetingContent>
  )
}

graphql`
  fragment PokerEstimatePhaseStage on EstimateStage {
    ...PokerEstimateHeaderCardJira_stage
    story {
      __typename
    }
  }
`
export default createFragmentContainer(PokerEstimatePhase, {
  meeting: graphql`
    fragment PokerEstimatePhase_meeting on PokerMeeting {
      ...EstimatePhaseArea_meeting
      id
      endedAt
      showSidebar
      localStage {
        ...PokerEstimatePhaseStage @relay(mask: false)
      }
      phases {
        ... on EstimatePhase {
          stages {
            ...PokerEstimatePhaseStage @relay(mask: false)
          }
        }
      }
      ...EstimatePhaseDiscussionDrawer_meeting
    }
  `,
})
