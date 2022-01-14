import React from 'react';
import {Node} from 'react';
import {Card, Button, Headline, Divider, Appbar} from 'react-native-paper';

import {
  SafeAreaView,
  ScrollView,
  // StatusBar,
  StyleSheet,
  Text,
  // useColorScheme,
  View,
  Image,
  RefreshControl,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage'

// import {Colors, Header} from 'react-native/Libraries/NewAppScreen';

// const Section = ({children, title}) => {
//   const isDarkMode = useColorScheme() === 'dark';
//   return (
//     <View style={styles.sectionContainer}>
//       <Text
//         style={[
//           styles.sectionTitle,
//           {
//             color: isDarkMode ? Colors.white : Colors.black,
//           },
//         ]}>
//         {title}
//       </Text>
//       <Text
//         style={[
//           styles.sectionDescription,
//           {
//             color: isDarkMode ? Colors.light : Colors.dark,
//           },
//         ]}>
//         {children}
//       </Text>
//     </View>
//   );
// };

async function getGithubRepsitories(context,optionalVal=null) {
  const BASE_URL = 'https://gh-trending-api.herokuapp.com/repositories';
  let storedResponse=await AsyncStorage.getItem('data')
  if(storedResponse && storedResponse.length>1 && storedResponse !== undefined) {
    console.log('Setting State')
    context.setState({data:JSON.parse(storedResponse)})
    return
  }
  else{
  let jsonResponse = await fetch(BASE_URL).then(res => res.json()).catch(err => context.setState({fetchError:true}))
  let responseToReturn = {};
  jsonResponse.forEach(repoObject => {
    if (!(repoObject.language in responseToReturn)) {
      responseToReturn[repoObject.language] = [repoObject];
    } else {
      responseToReturn[repoObject.language].push(repoObject);
    }
  });
  console.log('Setting Data to received data')
  if(optionalVal!=null) context.setState({data:responseToReturn,refreshing:optionalVal})
  else context.setState({data: responseToReturn});
  await AsyncStorage.setItem('data',JSON.stringify(responseToReturn))
}
}

class CustomCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {showDetails: false};
    this.handlePress = this.handlePress.bind(this);
  }

  handlePress() {
    this.setState({showDetails: !this.state.showDetails});
  }

  render() {
    let {title, subs, language, forks, StarsSince, image} = this.props;
    let {showDetails} = this.state;
    return (
      <React.Fragment>
        <Card onPress={this.handlePress}>
          <Card.Title
            title={title}
            subtitle={subs}
            left={() => (
              <Image
                style={{
                  height: 40,
                  width: 40,
                  borderRadius: 50,
                }}
                source={{uri: image}}
              />
            )}
          />
          {!showDetails ? (
            <React.Fragment></React.Fragment>
          ) : (
            <Card.Actions>
              <Button disabled>Lang: {language}</Button>
              <Button disabled>Forks: {forks}</Button>
              <Button disabled>Stars: {StarsSince}</Button>
            </Card.Actions>
          )}
        </Card>
      </React.Fragment>
    );
  }
}

function generateRandomColor() {
  let r = Math.floor(Math.random() * 255);
  let g = Math.floor(Math.random() * 255);
  let b = Math.floor(Math.random() * 255);
  return `rgb(${r},${g},${b})`;
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {refreshing: false};
  }

  componentDidMount() {
    getGithubRepsitories(this).catch(err => {
      // this.setState({data: null});
      console.error(err);
    });
  }
  render() {
    let {data,refreshing,fetchError} = this.state;
    const app = this;
    // data is an object with keys as language
    return (
      <SafeAreaView>
        {/* <StatusBar /> */}
        <Appbar.Header style={{
            backgroundColor:'white',
            color:'#ddd'
          }}>
            <Appbar.Content
              title="Trending Github Repositories Fetcher"
              subtitle="Done for Kutumb App Assignment"
            />
          </Appbar.Header>
        <ScrollView contentInsetAdjustmentBehavior="automatic" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{
          app.setState({refreshing:true})
          getGithubRepsitories(app)
          setTimeout(()=>{
            app.setState({refreshing:false})
          },2000)
        }} />}>
          {/* <Header /> */}
          <View>
            <React.Fragment>
              {data==null || data==undefined ? (
                fetchError ? <Text>Error while fetching the data.</Text>:<Text>Loading</Text>
              ) : (
                Object.keys(data).map(languageKey => {
                  return (
                    <React.Fragment>
                      <Headline
                        style={{
                          marginTop: 5,
                          // marginLeft:7.5,
                          backgroundColor: generateRandomColor(),
                          padding: 10,
                        }}>
                        {languageKey}
                      </Headline>
                      <React.Fragment key={Math.random()}>
                        {data[languageKey].map((eachEntry, index) => {
                          let {
                            username,
                            repositoryName,
                            language,
                            forks,
                            starsSince,
                            builtBy,
                          } = eachEntry;
                          let imageUrl = builtBy[0].avatar;
                          return (
                            <CustomCard
                              key={index}
                              subs={username}
                              title={repositoryName}
                              language={language}
                              forks={forks}
                              StarsSince={starsSince}
                              image={imageUrl}
                            />
                          );
                        })}
                      </React.Fragment>
                      <Divider />
                    </React.Fragment>
                  );
                })
              )}
            </React.Fragment>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
