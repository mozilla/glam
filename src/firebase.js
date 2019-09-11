import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD_M-9mWY65Gbp_0q8J2ooigv99dwxw8NY',
  authDomain: 'mdv2-test-244418.firebaseapp.com',
  databaseURL: 'https://mdv2-test-244418.firebaseio.com',
  projectId: 'mdv2-test-244418',
  storageBucket: 'mdv2-test-244418.appspot.com',
  messagingSenderId: '497993446321',
  appId: '1:497993446321:web:95d756c7f0361ae1',
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const db = firebase.firestore();
