import React, { Fragment, PureComponent } from 'react';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import Languages from '../Language/Languages';
import ChangePassword from './ChangePassword';
import MainModal from '../../modals/MainModal';
import { checkPassword } from '../Accounts/AccountFunction';
import { ThemeContext } from '../../containers/AppWrapper';

const T = i18n.createComponent();

const takeToDashboard = () => {
  FlowRouter.go('/dashboard/accounts');
};

const logUserOut = () => {
  Meteor.logout(error => {
    if (!error) {
      FlowRouter.go('/login');
    } else {
      return null;
    }
  });
};
class UserInfo extends PureComponent {
  state = {
    isVisible: false,
    title: 'Change Password',
    reject: 'Cancel',
    confirm: 'Save',
    isOpen: false,
    password: '',
    oldPassword: '',
    passwordConfirm: '',
    error: '',
  };

  handleOldPasswordChange = e => {
    this.setState({
      oldPassword: e.target.value,
    });
  };
  handlePasswordConfirm = e => {
    this.setState({
      password: e.target.value,
    });
  };

  validatePassword = e => {
    this.setState({
      passwordConfirm: e.target.value,
    });
  };
  close = () => {
    this.setState(prevState => ({
      isOpen: !prevState.isOpen,
    }));
  };
  handleSubmit = e => {
    e.preventDefault();
    const { oldPassword, password, passwordConfirm } = this.state;
    const response = checkPassword(password, passwordConfirm);
    if (!response.status) {
      this.setState({
        error: response.msg,
      });
      return false;
    }
    Accounts.changePassword(oldPassword, password, err => {
      err
        ? this.setState({
          error: err.reason,
        })
        : FlowRouter.go('/login');
    });
  };

  render() {
    const user = Meteor.user();
    const {
      isVisible,
      isOpen,
      title,
      confirm,
      reject,
      password,
      oldPassword,
      passwordConfirm,
      error,
    } = this.state; // eslint-disable-line
    return (
      <ThemeContext.Consumer>
        {({ state }) => (
          <div>
            <MainModal
              show={isOpen}
              onClose={this.close}
              subFunc={this.handleSubmit}
              title={title}
              confirm={confirm}
              reject={reject}
            >
              <ChangePassword
                handleOldPassword={this.handleOldPasswordChange}
                handleNewPassword={this.handlePasswordConfirm}
                validatePassword={this.validatePassword}
                oldPassword={oldPassword}
                newPassword={password}
                validatedPassword={passwordConfirm}
                error={error}
              />
            </MainModal>
            <ul
              id="slide-out"
              className="sidenav"
              style={{
                backgroundColor: state.isDark ? state.mainDark : '#ffffff',
              }}
            >
              {user ? (
                <Fragment>
                  <li id="dropBody">
                    <div id="accName">
                      {`${user.profile.name} `}
                      <span id="userEmail">{user.emails[0].address}</span>
                      <span id="uiWrapper">
                        <button className="btn" onClick={logUserOut}>
                          <T>common.accounts.Logout</T>
                        </button>
                      </span>
                      <span id="uiWrapper">
                        <button
                          className="btn teal"
                          onClick={() =>
                            this.setState(prevState => ({
                              isOpen: !prevState.isOpen,
                            }))
                          }
                        >
                          Change Password
                        </button>
                      </span>
                    </div>
                  </li>
                  {Meteor.userId() && isVisible ? (
                    <li>
                      <ChangePassword />
                    </li>
                  ) : null}

                  <br />
                  <br />
                  <li>
                    <Languages />
                  </li>
                  <li>
                    {Roles.userIsInRole(Meteor.userId(), [
                      'admin',
                      'content-manager',
                    ]) ? (
                      <button className="btn teal" onClick={takeToDashboard}>
                        Dashboard
                      </button>
                    ) : (
                      <span />
                    )}
                  </li>
                </Fragment>
              ) : (
                <li id="dropBody">
                  <div id="accName">
                    <button
                      className="btn teal"
                      onClick={() => FlowRouter.go('/login')}
                    >
                      You are not Logged in
                    </button>
                  </div>
                </li>
              )}
              <div className="switch">
                <label>
                  Day Mode
                  <input
                    type="checkbox"
                    onChange={this.props.handleNightMode}
                    checked={this.props.checked}
                  />
                  <span className="lever" />
                  Night Mode
                </label>
              </div>
            </ul>
          </div>
        )}
      </ThemeContext.Consumer>
    );
  }
}
UserInfo.propTypes = {
  handleNightMode: PropTypes.func.isRequired,
  checked: PropTypes.bool.isRequired,
};

export default UserInfo;
