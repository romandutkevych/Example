import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Keyboard,
  ScrollView,
  findNodeHandle, TouchableOpacity
} from 'react-native';

// import helpers //

import {EmailValidation} from '../../../helpers/validation/validation';
import {setItem} from '../../../helpers/deviceStorage';
import {
  defaultTextFontFamily,
  defaultBoldFonFamily,
  defaultWidth,
  deviseHeight,
} from '../../../helpers/constants';

// import global style //

import {InputStyle, Container, TextStyles, HeaderStyle} from '../../../styles';

// import elements //

import MainButton from '../../../components/Buttons/MainButton';
import LinkText from '../../../components/LinkText/LinkText';
import ErrorMessage from '../../../components/ErrorMessage/ErrorMessage';
import AuthButton from '../../../components/Buttons/AuthButton';
// import api //
import {loginApi, signInWithSocial} from '../../../api';


// import library //
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {GoogleSignin} from "@react-native-community/google-signin";
import firebase from "react-native-firebase";
import {AccessToken, LoginManager} from "react-native-fbsdk";
import Modal from "react-native-modal";

const LoginPage = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [enabledScroll, setEnabledScroll] = useState(false);
  const [activeInput, setActiveInput] = useState('');
  const [showModal,setShowModal] = useState(false);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '353507973662-pefpebov7c1vjqomimnn5u7l7ni36i72.apps.googleusercontent.com',
    });
    LoginPage.didBlur = navigation.addListener('didBlur', () => {
      setError('');
    });

    LoginPage.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        keyboardHide();
      },
    );

    return () => {
      LoginPage.didBlur.remove();
      LoginPage.keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (email && password) {
      setError('');
    }
  }, [email, password]);

  const loginFunc = async () => {
    const res = await loginApi({
      email: email,
      password: password,
    }).catch(e => {
      setError(e.response.data.error);
      setLoading(false);
    });
    if (!res) {
      return;
    }
    await setItem('access_token', res.data.jwtToken);
    await setLoading(false);
    await navigation.navigate('Loading');
  };

  const loginHandler = async () => {
    let validEmail = EmailValidation(email);
    if (email === '' || password === '') {
      setError('Some field empty');
    }

    if (email && password) {
      if (validEmail) {
        setError('');
        setLoading(true);
        loginFunc();
      } else {
        setError('Email is not correct');
      }
    }
  };

  const forgotPasswordHandler = () => {
    navigation.push('ForgotPasswordScreen');
  };

  const keyboardHide = () => {
    setEnabledScroll(false);
    this.scroll.props.scrollToPosition(0, 0)
  };

  const _scrollToInput = (reactNode) => {
    this.scroll.props.scrollToFocusedInput(reactNode)
  };

  const onFocusHandler = (activeElement,event) => {
    setEnabledScroll(true);
    setActiveInput(activeElement);
    _scrollToInput(findNodeHandle(event.target));
  };

  const signInGoogle = async () => {
    try {
      const data = await GoogleSignin.signIn();
      const credential = firebase.auth.GoogleAuthProvider.credential(data.idToken, data.accessToken);

      await firebase.auth().signInWithCredential(credential);
      const userToken = await firebase.auth().currentUser.getIdToken();
      const socialResponse = await signInWithSocial({tokenId: userToken});
      if (!socialResponse) {
        return;
      }
      await setItem('access_token', socialResponse.data.jwtToken);
      await navigation.navigate('Loading');
      console.log(socialResponse, "sfvsdvsdvsdv");
    } catch (e) {
      console.log(e, 'errrrrror');
    }
  };

  const handleFacebookLogin = async () => {
    console.log('handleFacebookLogin');
    LoginManager.logInWithPermissions(["public_profile","email"]).then(
      async function (result) {
        if (result.isCancelled) {
          console.log("Login cancelled");
        } else {
          const data = await AccessToken.getCurrentAccessToken();
          const credential = firebase.auth.FacebookAuthProvider.credential(data.accessToken);
          await firebase.auth().signInWithCredential(credential);
          const userToken = await firebase.auth().currentUser.getIdToken();
          const socialResponse = await signInWithSocial({tokenId: userToken}).catch( err => {
            setErrorText(err.response.data.error)
            setShowModal(true);
          })
          if (!socialResponse) {
            return;
          }
          await setItem('access_token', socialResponse.data.jwtToken);
          await navigation.navigate('Loading');
        }
      },
      function(error) {
        console.log("Login fail with error: " + error);
      }
    );

  };

  return (
    <>
      <KeyboardAwareScrollView
        innerRef={ref => {
          this.scroll = ref
        }}
        scrollEnabled={enabledScroll}
        enableOnAndroid={true}
      >
        <View style={styles.container}>
          <View style={styles.textWrap}>
            <Text style={styles.mainText} allowFontScaling={false}>Sign In</Text>
          </View>
          <View style={styles.socialIconWrap}>
            <View style={styles.socialWrap}>
              <AuthButton
                clickHandler={handleFacebookLogin}
                buttonText="Continue with Facebook"
                social="facebook"
              />
              <AuthButton buttonText="Continue with Google" social="google" clickHandler={signInGoogle}/>
            </View>

            <Text style={styles.orTextStyle} allowFontScaling={false}>OR</Text>
          </View>
          <View>
            <TextInput
              onChangeText={text => setEmail(text)}
              onFocus={() => setActiveInput('email')}
              onBlur={() => {
                setActiveInput('');
              }}
              placeholder="Email"
              placeholderTextColor="#747474"
              style={
                activeInput === 'email'
                  ? styles.activeInputStyle
                  : styles.inputStyle
              }
            />
            <TextInput
              onChangeText={text => setPassword(text)}
              onFocus={(event: Event) => onFocusHandler('password',event)}
              onBlur={() => {
                setActiveInput('');
              }}
              placeholder="Password"
              placeholderTextColor="#747474"
              style={
                activeInput === 'password'
                  ? styles.activeInputStyle
                  : styles.inputStyle
              }
              secureTextEntry
            />
            <ErrorMessage errorText={error} />
            <View style={styles.linkTextWrap}>
              <LinkText
                clickHandler={() => forgotPasswordHandler()}
                text="Forgot Password ?"
                bottomLine={true}
                textStyle="regular"
              />
            </View>
          </View>
          <View style={styles.loginButton}>
            <MainButton
              clickHandler={() => loginHandler()}
              buttonText="Log in"
              active={true}
              loading={loading}
              width={defaultWidth}
            />
          </View>
          <Modal
            onBackButtonPress={() => setShowModal(false)}
            onBackdropPress={() => setShowModal(false)}
            backdropColor={'rgba(0, 0, 0, 0.3)'}
            isVisible={showModal}
            style={{flexDirection: 'row', justifyContent: "center", flex: 1,  alignItems: 'center', width: defaultWidth}}>
            <View
              style={[
                styles.modalWrap,
              ]}>
              <View style={{alignItems: 'center', paddingTop: 20}}>
                <View style={styles.modalContent}>
                  <Text style={styles.contentText} allowFontScaling={false}>{errorText}</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
                    <TouchableOpacity
                      onPress={() => setShowModal(false)}
                      style={styles.cancelButton}
                    >
                      <Text style={styles.cancelButtonText} allowFontScaling={false}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </KeyboardAwareScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    ...Container.container,
    // height: deviseHeight,
  },
  inputStyle: {
    ...InputStyle.input,
  },
  activeInputStyle: {
    ...InputStyle.input,
    borderColor: '#0072BB',
  },
  mainText: {
    ...TextStyles.authPagesMainTextStyle,
  },
  textWrap: {
    width: defaultWidth,
  },
  linkTextWrap: {
    width: defaultWidth,
    alignItems: 'flex-end',
    bottom: "10%"
    // marginTop: 5,
    // marginBottom: "10%",
  },
  socialIconWrap: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  socialWrap: {
    flexDirection: 'column',
    width: defaultWidth,
  },
  orTextStyle: {
    fontFamily: defaultBoldFonFamily,
    marginVertical: '5%',
    color: '#0072BB',
  },
  loginButton: {
    position: 'absolute',
    bottom: 80,
    marginBottom: 10,
  },
  modalWrap: {
    width: defaultWidth,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    right: 4
  },
  modalContent: {
    paddingHorizontal: 15,
    paddingBottom: 25,
    paddingTop: 20,
    alignItems: 'center'
  },
  cancelButton: {
    width: 150,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#0072BB',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  cancelButtonText: {
    fontFamily: defaultTextFontFamily,
    fontSize: 14,
    color: '#0072BB'
  }
});

export default LoginPage;
