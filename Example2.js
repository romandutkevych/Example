import React, {Fragment, useEffect, createRef} from 'react';
import styled from 'styled-components/native';
import {Button, SecondaryButton} from '../../components/button/Button';
import {ScreenTitle} from '../../components/screenTitle/ScreenTitle';
import {ScrollView, StatusBar} from 'react-native';
import {Container, StyledSafeAreaView} from '../../styledComponents/styledComponents';
import {Devider} from '../../components/devider/Devider';
import {connect} from 'react-redux';
import {
  destroyFirstStep,
  facebookGetData,
  initializeFirstStepData,
  instagramGetData,
  setActiveSignUpStep,
  setSignUpMethod,
} from '../../redux/signUpReducer';

import { INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET, INSTAGRAM_REDIRECT_URL } from 'react-native-dotenv';
import Instagram from 'react-native-instagram-login';
import Link from '../../components/link/Link';
import {
  facebookLogin,
  setFacebookAccessToken,
  setFacebookLoadedData,
  setInstagramAccessToken, setInstagramLoadedData,
} from '../../redux/socialReducer';

const ButtonsWrapper = styled.View`
    flex: 1;
    alignItems: center;
    paddingBottom: 55px;
    justifyContent: flex-end;
  `;

const LoginWrapper = styled.View`
    height: 20px;
    width: 100%;
    flexDirection: row;
    alignItems: center;
    justifyContent: center;
    marginTop: 16px;
  `;

const LoginText = styled.Text`
    color: #fff;
    fontSize: 12px;
    lineHeight: 16px;
    fontFamily: 'Manrope-Regular';
    marginRight: 8px;
  `;


const MainPage = (props) => {

  const {navigation, activeSignUpStep, facebookAccessToken, isValidFacebookAccessToken, isLoadedFacebookData, instagramAccessToken, isValidInstagramAccessToken, isLoadedInstagramData,
    setActiveSignUpStep, setInstagramLoadedData, instagramGetData, setSignUpMethod, destroyFirstStep, initializeFirstStepData, setFacebookAccessToken, setFacebookLoadedData, facebookLogin, facebookGetData, setInstagramAccessToken} = props;

  const instagramLogin = createRef();

  useEffect(()=>{
    setActiveSignUpStep('main');
  }, []);

  useEffect(()=>{
    if(isValidInstagramAccessToken && activeSignUpStep=='main') {
      instagramGetData(instagramAccessToken);
    }
  }, [isValidInstagramAccessToken]);

  useEffect(()=>{
    if(isLoadedInstagramData && activeSignUpStep=='main') {
      navigation.navigate('SignUp');
    }
  }, [isLoadedInstagramData]);

  useEffect(()=>{
    if(isValidFacebookAccessToken && activeSignUpStep=='main') {
      facebookGetData(facebookAccessToken);
    }
  }, [isValidFacebookAccessToken]);

  useEffect(()=>{
    if(isLoadedFacebookData && activeSignUpStep=='main') {
      navigation.navigate('SignUp');
    }
  }, [isLoadedFacebookData]);

  let handleClickMail = () => {
    setSignUpMethod('mail');
    destroyFirstStep();
    initializeFirstStepData('mail');
    navigation.navigate('SignUp')
  };

  let handleClickFacebook = () => {
    setSignUpMethod('facebook');
    destroyFirstStep();
    initializeFirstStepData('facebook');
    setFacebookAccessToken({
      userId: '',
      accessToken: '',
      isValidAccessToken: false
    });
    setFacebookLoadedData(false);
    facebookLogin();
  };

  let handleClickInst = () => {
    setSignUpMethod('instagram');
    destroyFirstStep();
    initializeFirstStepData('instagram');
    setInstagramAccessToken({
      userId: '',
      accessToken: '',
      isValidAccessToken: false
    });
    setInstagramLoadedData(false);
    instagramLogin.current.show();
  };

  let handleClickLogIn = () => {
    navigation.navigate('LogIn');
  };

  return (
    <Fragment>
      <StatusBar barStyle="light-content" />
      <StyledSafeAreaView>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <Container>
            <ScreenTitle title='Hello' description='Glad to meet you!' />
            <ButtonsWrapper>
              <Button handleClick={handleClickFacebook} buttonText={'Sign Up With Facebook'} icon={'facebook'} marginVertical='8' />
              <Button handleClick={handleClickInst} buttonText={'Sign Up With Instagram'} icon={'instagram'} marginVertical='8' />
              <Devider text='OR' />
              <SecondaryButton handleClick={handleClickMail} buttonText={'Sign Up With Email'} icon={'mail'} marginVertical='8' />
              <LoginWrapper>
                <LoginText>Already have an account?</LoginText>
                <Link linkText={'Log In'} fontSize={17} fontWeight={'bold'} lineHeight={20} handleClick={ handleClickLogIn }/>
              </LoginWrapper>
            </ButtonsWrapper>
          </Container>
        </ScrollView>
      </StyledSafeAreaView>

      <Instagram
        ref={instagramLogin}
        appId={INSTAGRAM_APP_ID}
        appSecret={INSTAGRAM_APP_SECRET}
        redirectUrl={INSTAGRAM_REDIRECT_URL}
        scopes={['user_profile', 'user_media']}
        onLoginSuccess={(data) => {
          setInstagramAccessToken({
            userId: data.user_id,
            accessToken: data.access_token,
            isValidAccessToken: true
          });
        }}
        onLoginFailure={(data) => {
          console.log(data);
          setInstagramAccessToken({
            userId: '',
            accessToken: '',
            isValidAccessToken: false
          });
        }}
      />

    </Fragment>
  );
};

let mapStateToProps = (state) => {
  return ({
    activeSignUpStep: state.signUpPage.activeSignUpStep,
    facebookAccessToken: state.socialPage.facebookData.accessToken,
    isValidFacebookAccessToken: state.socialPage.facebookData.isValidAccessToken,
    isLoadedFacebookData: state.socialPage.facebookData.isLoadedData,
    instagramAccessToken: state.socialPage.instagramData.accessToken,
    isValidInstagramAccessToken: state.socialPage.instagramData.isValidAccessToken,
    isLoadedInstagramData: state.socialPage.instagramData.isLoadedData,
  })
};

export default connect(mapStateToProps, { setActiveSignUpStep, setSignUpMethod, destroyFirstStep, initializeFirstStepData, setFacebookAccessToken, setFacebookLoadedData, facebookLogin, facebookGetData, setInstagramAccessToken, setInstagramLoadedData, instagramGetData })(MainPage);

