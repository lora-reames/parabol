import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import portal from 'react-portal-hoc';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import Button from 'universal/components/Button/Button';
import {DashModal} from 'universal/components/Dashboard';
import TextAreaField from 'universal/components/TextAreaField/TextAreaField';
import Type from 'universal/components/Type/Type';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import RejectOrgApprovalMutation from 'universal/mutations/RejectOrgApprovalMutation';
import formError from 'universal/styles/helpers/formError';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import rejectOrgApprovalValidation from './rejectOrgApprovalValidation';
import getGraphQLError from 'universal/utils/relay/getGraphQLError';

const validate = (values) => {
  const schema = rejectOrgApprovalValidation();
  return schema(values).errors;
};

const RejectOrgApprovalModal = (props) => {
  const {
    atmosphere,
    closeAfter,
    closePortal,
    error,
    handleSubmit,
    isClosing,
    notificationId,
    inviteeEmail,
    inviterName,
    submitting,
    styles
  } = props;
  const onSubmit = (submissionData) => {
    return new Promise((resolve, reject) => {
      const schema = rejectOrgApprovalValidation();
      const {data: {reason}} = schema(submissionData);
      const variables = {reason, notificationId};
      const onError = (err) => {
        reject(new SubmissionError({_error: err}));
      };
      const onCompleted = (res, errors) => {
        const graphQLError = getGraphQLError(res, errors);
        if (graphQLError) {
          onError(graphQLError);
        } else {
          resolve();
          closePortal();
        }
      }
      RejectOrgApprovalMutation(atmosphere, variables, onError, onCompleted);
    })
  };
  return (
    <DashModal closeAfter={closeAfter} closePortal={closePortal} isClosing={isClosing} onBackdropClick={closePortal}>
      <Type align="center" bold marginBottom=".5rem" scale="s6" colorPalette="mid">
        Care to say why?
      </Type>
      <Type align="center" marginBottom="1rem" scale="sBase" colorPalette="dark">
        Type a response below and <br />we’ll pass it along to {inviterName}.
      </Type>
      <form onSubmit={handleSubmit(onSubmit)}>
        {error && <div className={css(styles.error)}>{error.message}</div>}
        <Field
          component={TextAreaField}
          name="reason"
          placeholder="Comment"
        />
        <div className={css(styles.buttonBlock)}>
          <Button
            aria-label={`Reject ${inviteeEmail} from the organization`}
            colorPalette="warm"
            isBlock
            label={`Reject ${inviteeEmail}`}
            size={ui.modalButtonSize}
            type="submit"
            onClick={handleSubmit(onSubmit)}
            waiting={submitting}
          />
        </div>
      </form>
    </DashModal>
  );
};

RejectOrgApprovalModal.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  closeAfter: PropTypes.number.isRequired,
  closePortal: PropTypes.func.isRequired,
  error: PropTypes.any,
  handleSubmit: PropTypes.func.isRequired,
  isClosing: PropTypes.bool,
  inviteeEmail: PropTypes.string,
  inviterName: PropTypes.string,
  notificationId: PropTypes.string.isRequired,
  submitting: PropTypes.bool,
  styles: PropTypes.object
};

const styleThunk = () => ({
  buttonBlock: {
    marginTop: '1rem'
  },

  error: formError
});

export default portal({escToClose: true, closeAfter: 100})(
  withAtmosphere(reduxForm({form: 'rejectOrgApproval', validate})(
    withStyles(styleThunk)(RejectOrgApprovalModal)
  )
  )
);
