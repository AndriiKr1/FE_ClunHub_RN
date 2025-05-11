import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import store from './src/store/store';
import Navigation from './src/navigation';
import { initializeAuthState } from './src/store/slices/authSlice';

const App = () => {
  useEffect(() => {
    store.dispatch(initializeAuthState());
  }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
        <Navigation />
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;