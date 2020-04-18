import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
  Loading,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: true,
    page: 1,
    refreshing: false,
    nextPage: false,
  };

  loadStars = async (page = 1) => {
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    this.setState({ loading: true });

    const response = await api.get(`/users/${user.login}/starred`, {
      params: { page },
    });

    const nextPage = await api.get(`/users/${user.login}/starred`, {
      params: { page: page + 1 },
    });

    this.setState({
      stars: response.data,
      page,
      loading: false,
      refreshing: false,
      nextPage: nextPage.data.length ? true : false,
    });
  };

  loadMoreStars = () => {
    const { page } = this.state;

    const nextPage = page + 1;

    this.loadStars(nextPage);
  };

  componentDidMount() {
    this.loadStars();
  }

  refreshList = () => {
    this.setState({ refreshing: true, stars: [] }, this.loadStars);
  };

  handleNavigate = (repo) => {
    const { navigation } = this.props;

    navigation.navigate('Repository', { repo });
  };

  render() {
    const { navigation } = this.props;
    const { stars, loading, refreshing, nextPage } = this.state;
    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {loading ? (
          <Loading />
        ) : (
          <Stars
            data={stars}
            keyExtractor={(star) => String(star.id)}
            checkNextPage={nextPage}
            loadMore={this.loadMoreStars}
            onRefresh={this.refreshList}
            refreshing={refreshing}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Starred onPress={() => this.handleNavigate(item)}>
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
          />
        )}
      </Container>
    );
  }
}
