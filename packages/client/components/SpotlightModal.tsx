import React, {KeyboardEvent} from 'react'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import {SpotlightModal_meeting} from '~/__generated__/SpotlightModal_meeting.graphql'
import {SpotlightModal_reflection} from '~/__generated__/SpotlightModal_reflection.graphql'
import {PALETTE} from '../styles/paletteV3'
import MenuItemLabel from './MenuItemLabel'
import Icon from './Icon'
import {ICON_SIZE} from '../styles/typographyV2'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import {Breakpoint, ElementWidth} from '../types/constEnums'
import PlainButton from './PlainButton/PlainButton'
import DraggableReflectionCard from './ReflectionGroup/DraggableReflectionCard'
import useBreakpoint from '../hooks/useBreakpoint'
import SpotlightEmptyState from './SpotlightEmptyState'
import {Elevation} from '../styles/elevation'

const ModalContainer = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  background: '#FFFF',
  borderRadius: 8,
  boxShadow: Elevation.Z8,
  display: 'flex',
  flexWrap: 'wrap',
  height: '80vh',
  justifyContent: 'center',
  overflow: 'hidden',
  width: isDesktop ? '80vw' : '90vw'
}))

const SelectedReflection = styled('div')({
  alignItems: 'flex-start',
  background: PALETTE.SLATE_100,
  borderRadius: '8px 8px 0px 0px',
  display: 'flex',
  flexWrap: 'wrap',
  height: '33.3%',
  justifyContent: 'center',
  padding: 16,
  position: 'relative',
  width: '100%'
})

const SimilarReflectionGroups = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  height: '66.6%',
  padding: 16
})

const Title = styled('div')({
  color: PALETTE.SLATE_800,
  fontSize: 16,
  fontWeight: 600,
  textAlign: 'center'
})

const TopRow = styled('div')({
  width: `calc(100% - 48px)`,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
})

const Content = styled('div')({
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  position: 'absolute',
  top: 0
})

const SearchInput = styled('input')({
  appearance: 'none',
  border: `1px solid ${PALETTE.SKY_500}`,
  borderRadius: 4,
  boxShadow: `0 0 1px 1px ${PALETTE.SKY_300}`,
  color: PALETTE.SLATE_700,
  display: 'block',
  fontSize: 14,
  lineHeight: '24px',
  outline: 'none',
  padding: '6px 0 6px 39px',
  width: '100%',
  '::placeholder': {
    color: PALETTE.SLATE_600
  }
})

const SearchItem = styled(MenuItemLabel)({
  overflow: 'visible',
  padding: 0,
  position: 'absolute',
  bottom: -16,
  width: ElementWidth.REFLECTION_CARD
})

const StyledMenuItemIcon = styled(MenuItemComponentAvatar)({
  position: 'absolute',
  left: 8,
  top: 8
})

const SearchIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24
})

const StyledCloseButton = styled(PlainButton)({
  height: 24,
  position: 'absolute',
  right: 16
})

const CloseIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  fontSize: ICON_SIZE.MD24,
  '&:hover,:focus': {
    color: PALETTE.SLATE_800
  }
})

interface Props {
  closeSpotlight: () => void
  meeting: SpotlightModal_meeting
  reflection: SpotlightModal_reflection
}

const SpotlightModal = (props: Props) => {
  const {closeSpotlight, meeting, reflection} = props
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING_SELECTOR)
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') closeSpotlight()
  }
  const reflectionGroupsCount = 0
  return (
    <ModalContainer onKeyDown={handleKeyDown} isDesktop={isDesktop}>
      <SelectedReflection>
        <TopRow>
          <Title>Find cards with similar reflections</Title>
          <StyledCloseButton onClick={closeSpotlight}>
            <CloseIcon>close</CloseIcon>
          </StyledCloseButton>
        </TopRow>
        <Content>
          <DraggableReflectionCard
            inSpotlight
            isReadOnly
            staticIdx={0}
            reflection={reflection as any}
            meeting={meeting as any}
          />
        </Content>
        <SearchItem>
          <StyledMenuItemIcon>
            <SearchIcon>search</SearchIcon>
          </StyledMenuItemIcon>
          <SearchInput
            autoFocus
            autoComplete='off'
            name='search'
            placeholder='Or search for keywords...'
            type='text'
          />
        </SearchItem>
      </SelectedReflection>
      <SimilarReflectionGroups>
        {reflectionGroupsCount === 0 ? <SpotlightEmptyState /> : null}
      </SimilarReflectionGroups>
    </ModalContainer>
  )
}

export default createFragmentContainer(SpotlightModal, {
  reflection: graphql`
    fragment SpotlightModal_reflection on RetroReflection {
      ...ColorBadge_reflection
      id
      isViewerCreator
      isEditing
      meetingId
      reflectionGroupId
      promptId
      content
      reactjis {
        ...ReactjiSection_reactjis
        id
        isViewerReactji
      }
      sortOrder
    }
  `,
  meeting: graphql`
    fragment SpotlightModal_meeting on RetrospectiveMeeting {
      id
      teamId
      localPhase {
        phaseType
      }
      localStage {
        isComplete
        phaseType
      }
      phases {
        phaseType
        stages {
          isComplete
          phaseType
        }
      }
    }
  `
})